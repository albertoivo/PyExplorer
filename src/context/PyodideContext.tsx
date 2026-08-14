import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TestCase, TestResult, PythonExecutionResult } from '../types/question';
import { TURTLE_PYTHON_SHIM } from '../components/game/turtle/turtle-python-shim';
import { formatPythonError, compareOutputs } from '../utils/pyodideLogic';

/**
 * Interface para o contexto do Pyodide
 */
interface PyodideContextType {
    /** Se o Pyodide está pronto para uso */
    ready: boolean;
    /** Se está carregando o Pyodide inicialmente */
    loading: boolean;
    /** Se está executando código Python */
    executing: boolean;
    /** Erro de carregamento, se houver */
    error: string | null;
    /** Progresso de carregamento (0-100) */
    loadingProgress: number;
    /** Executa código Python */
    runPython: (code: string, tests?: TestCase[], functionName?: string) => Promise<PythonExecutionResult>;
    /** Carrega o Pyodide sob demanda */
    loadPyodide: () => Promise<void>;
}

const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

interface PyodideProviderProps {
    children: ReactNode;
}

// Tipo para o Pyodide (carregado dinamicamente)
interface PyodideInterface {
    runPython: (code: string) => unknown;
    runPythonAsync: (code: string) => Promise<unknown>;
    globals: {
        get: (name: string) => unknown;
        set: (name: string, value: unknown) => void;
    };
    loadPackage: (packages: string[]) => Promise<void>;
    FS: {
        writeFile: (path: string, data: string, options?: { encoding?: string }) => void;
        readFile: (path: string, options?: { encoding?: string }) => string;
        readdir: (path: string) => string[];
        unlink: (path: string) => void;
    };
}

// Declaração global para loadPyodide
declare global {
    interface Window {
        loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
        // Turtle globals
        turtle_reset: () => void;
        turtle_forward: (d: number) => void;
        turtle_right: (a: number) => void;
        turtle_penup: () => void;
        turtle_pendown: () => void;
        turtle_color: (c: string) => void;
        turtle_width: (w: number) => void;
        turtle_speed: (s: number) => void;
    }
}

/**
 * Provider que carrega e disponibiliza o Pyodide para toda a aplicação
 */
export function PyodideProvider({ children }: PyodideProviderProps) {
    const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const loadPyodide = useCallback(async () => {
        if (ready || loading) return;

        try {
            setLoading(true);
            setLoadingProgress(10);

            // Carrega o script do Pyodide via CDN
            if (!document.querySelector('script[src*="pyodide"]')) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
                script.async = true;

                await new Promise<void>((resolve, reject) => {
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Falha ao carregar script do Pyodide'));
                    document.head.appendChild(script);
                });
            }

            setLoadingProgress(30);

            // Aguarda o loadPyodide estar disponível
            let attempts = 0;
            while (!window.loadPyodide && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!window.loadPyodide) {
                throw new Error('loadPyodide não está disponível');
            }

            setLoadingProgress(50);

            // Inicializa o Pyodide
            const pyodideInstance = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
            });

            setLoadingProgress(80);

            // Configura stdout e stderr capturáveis
            await pyodideInstance.runPythonAsync(`
import sys
import js
from io import StringIO

# Shim para input() usar window.prompt do navegador
def input_shim(prompt=""):
    print(prompt, end="")  # Imprime o prompt no stdout para logs/testes
    result = js.prompt(prompt)
    if result is None:
        return ""  # Retorna string vazia se cancelar
    return str(result)

__builtins__.input = input_shim

class CaptureOutput:
    def __init__(self):
        self.stdout = StringIO()
        self.stderr = StringIO()
        
    def reset(self):
        self.stdout = StringIO()
        self.stderr = StringIO()
        
    def get_stdout(self):
        return self.stdout.getvalue()
        
    def get_stderr(self):
        return self.stderr.getvalue()

_capture = CaptureOutput()
        `);

            setLoadingProgress(100);

            // Garente que as funções globais do Turtle existam (como no-ops se não houver canvas)
            // Isso evita erro se "import turtle" for usado fora de uma questão visual
            const noOp = () => { };
            window.turtle_reset = window.turtle_reset || noOp;
            window.turtle_forward = window.turtle_forward || noOp;
            window.turtle_right = window.turtle_right || noOp;
            window.turtle_penup = window.turtle_penup || noOp;
            window.turtle_pendown = window.turtle_pendown || noOp;
            window.turtle_color = window.turtle_color || noOp;
            window.turtle_width = window.turtle_width || noOp;
            window.turtle_speed = window.turtle_speed || noOp;

            // Cria o módulo 'turtle' no sistema de arquivos do Pyodide
            // Isso permite que "import turtle" funcione em qualquer lugar
            pyodideInstance.FS.writeFile('turtle.py', TURTLE_PYTHON_SHIM);

            setPyodide(pyodideInstance);
            setReady(true);
            setLoading(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar Pyodide';
            console.error('❌ Erro ao carregar Pyodide:', err);
            setError(message);
            setLoading(false);
        }
    }, [ready, loading]);

    /**
     * Executa código Python e retorna resultado
     */
    const runPython = useCallback(async (
        code: string,
        tests?: TestCase[],
        functionName?: string
    ): Promise<PythonExecutionResult> => {
        if (!pyodide || !ready) {
            return {
                stdout: '',
                stderr: 'Pyodide ainda não está pronto. Aguarde o carregamento.',
                hasError: true,
            };
        }

        setExecuting(true);
        try {
            // Limpa quaisquer arquivos .txt de execuções anteriores para garantir testes isolados
            try {
                const existingTxt = pyodide.FS.readdir('.').filter((f: string) => f.endsWith('.txt'));
                for (const f of existingTxt) {
                    pyodide.FS.unlink(f);
                }
            } catch {
                // Ignore cleanup error
            }

            // Reseta captura de saída
            await pyodide.runPythonAsync(`
_capture.reset()
sys.stdout = _capture.stdout
sys.stderr = _capture.stderr
      `);

            // Executa o código do usuário
            await pyodide.runPythonAsync(code);

            // Captura stdout e stderr
            const stdoutText = (await pyodide.runPythonAsync('_capture.get_stdout()')) as string;
            const stderrText = (await pyodide.runPythonAsync('_capture.get_stderr()')) as string;

            // Restaura stdout/stderr originais
            await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);

            // Se há testes, executa-os
            let testResults: TestResult[] | undefined;
            let allTestsPassed = true;

            if (tests && tests.length > 0 && functionName) {
                testResults = [];

                for (const test of tests) {
                    try {
                        let testInput = test.input;
                        if (typeof testInput === 'string') {
                            const trimmed = testInput.trim();
                            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                                try {
                                    testInput = JSON.parse(testInput);
                                } catch {
                                    // Mantém string original se falhar
                                }
                            }
                        }

                        // Prepara os argumentos para a função
                        let args: string;
                        if (Array.isArray(testInput)) {
                            args = testInput.map(arg => JSON.stringify(arg)).join(', ');
                        } else if (testInput === undefined || testInput === null) {
                            args = '';
                        } else {
                            args = JSON.stringify(testInput);
                        }

                        // Chama a função com os argumentos
                        const callCode = `
import json
_test_result = ${functionName}(${args})
json.dumps(_test_result) if not isinstance(_test_result, (int, float, bool, str, type(None))) else _test_result
            `;

                        let actualOutput = await pyodide.runPythonAsync(callCode);

                        // Se a saída foi serializada como JSON string no Python (ex: listas e dicionários), converte de volta para objeto/array JS
                        if (typeof actualOutput === 'string') {
                            const trimmed = actualOutput.trim();
                            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                                try {
                                    actualOutput = JSON.parse(actualOutput);
                                } catch {
                                    // Mantém string original se não for JSON válido
                                }
                            }
                        }

                        // Compara resultado
                        const passed = compareOutputs(actualOutput, test.expectedOutput);

                        testResults.push({
                            passed,
                            input: test.input,
                            expectedOutput: test.expectedOutput,
                            actualOutput,
                        });

                        if (!passed) {
                            allTestsPassed = false;
                        }
                    } catch (testErr) {
                        const errorMessage = testErr instanceof Error ? testErr.message : String(testErr);
                        testResults.push({
                            passed: false,
                            input: test.input,
                            expectedOutput: test.expectedOutput,
                            actualOutput: null,
                            error: errorMessage,
                        });
                        allTestsPassed = false;
                    }
                }
            }
            // Se há testes MAS não há functionName, valida via stdout
            else if (tests && tests.length > 0 && !functionName) {
                testResults = [];
                const outputLines = stdoutText.trim().split('\n').map(line => line.trim()).filter(line => line);

                // Se a saída do stdout estiver vazia, verifica se o usuário criou algum arquivo .txt no sistema de arquivos do Pyodide
                if (outputLines.length === 0 && pyodide) {
                    try {
                        const txtFiles = pyodide.FS.readdir('.').filter((f: string) => f.endsWith('.txt'));
                        for (const file of txtFiles) {
                            const content = pyodide.FS.readFile(file, { encoding: 'utf8' });
                            if (content.trim()) {
                                outputLines.push(...content.trim().split('\n').map((l: string) => l.trim()).filter((l: string) => l));
                            }
                        }
                    } catch {
                        // ignore FS read error
                    }
                }

                for (const test of tests) {
                    // Se expectedOutput é null, apenas verifica se não houve erro (implicitamente passed=true aqui)
                    if (test.expectedOutput === null) {
                        testResults.push({
                            passed: true,
                            input: test.input,
                            expectedOutput: null,
                            actualOutput: outputLines,
                        });
                        continue;
                    }

                    // Verifica se expectedOutput é uma string de regex
                    if (
                        typeof test.expectedOutput === 'string' &&
                        test.expectedOutput.startsWith('regex:')
                    ) {
                        const regexPattern = test.expectedOutput.replace('regex:', '');
                        const regex = new RegExp(regexPattern);
                        // Verifica se ALGUMA linha da saída corresponde ao regex
                        const passed = outputLines.some(line => regex.test(line));

                        testResults.push({
                            passed,
                            input: test.input,
                            expectedOutput: test.expectedOutput,
                            actualOutput: outputLines,
                        });
                        if (!passed) allTestsPassed = false;
                        continue;
                    }

                    // Verifica se expectedOutput é um número (contagem de linhas mínima)
                    if (typeof test.expectedOutput === 'number') {
                        const expectedLineCount = test.expectedOutput;
                        const passed = outputLines.length >= expectedLineCount;

                        testResults.push({
                            passed,
                            input: test.input,
                            expectedOutput: `Pelo menos ${expectedLineCount} linha(s)`,
                            actualOutput: `${outputLines.length} linha(s): ${outputLines.join(', ')}`,
                        });
                        if (!passed) allTestsPassed = false;
                        continue;
                    }

                    // expectedOutput pode ser array de linhas ou string única (que pode conter \n)
                    let expectedLines: string[];

                    if (Array.isArray(test.expectedOutput)) {
                        expectedLines = test.expectedOutput.map(String);
                    } else if (typeof test.expectedOutput === 'string') {
                        // Se for string, divide por quebra de linha e limpa espaços extras
                        expectedLines = test.expectedOutput
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line.length > 0);
                    } else {
                        expectedLines = [String(test.expectedOutput)];
                    }

                    // Verifica se todas as linhas esperadas estão presentes na saída
                    // Comparação flexível: cada linha esperada deve aparecer na saída
                    const allLinesFound = expectedLines.every(expected =>
                        outputLines.some(actual =>
                            actual.toLowerCase().includes(expected.toLowerCase()) ||
                            actual === expected
                        )
                    );

                    // Também verifica correspondência exata por posição se números de linhas forem iguais
                    const exactMatch = expectedLines.length === outputLines.length &&
                        expectedLines.every((expected, idx) => {
                            const actual = outputLines[idx] || '';
                            return actual.toLowerCase() === expected.toLowerCase() ||
                                actual === expected;
                        });

                    const passed = exactMatch || (allLinesFound && outputLines.length >= expectedLines.length);

                    testResults.push({
                        passed,
                        input: test.input,
                        expectedOutput: test.expectedOutput,
                        actualOutput: outputLines,
                    });

                    if (!passed) {
                        allTestsPassed = false;
                    }
                }
            }

            return {
                stdout: stdoutText,
                stderr: stderrText,
                hasError: false,
                testResults,
                allTestsPassed: tests ? allTestsPassed : undefined,
            };
        } catch (err) {
            // Restaura stdout/stderr em caso de erro
            try {
                await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
        `);
            } catch {
                // Ignore error during cleanup
            }

            const errorMessage = err instanceof Error ? err.message : String(err);

            return {
                stdout: '',
                stderr: formatPythonError(errorMessage),
                hasError: true,
            };
        } finally {
            setExecuting(false);
        }
    }, [pyodide, ready]);

    const value = useMemo<PyodideContextType>(() => ({
        ready,
        loading,
        executing,
        error,
        loadingProgress,
        runPython,
        loadPyodide,
    }), [ready, loading, executing, error, loadingProgress, runPython, loadPyodide]);

    return (
        <PyodideContext.Provider value={value}>
            {children}
        </PyodideContext.Provider>
    );
}

/**
 * Hook para acessar o contexto do Pyodide
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePyodide(): PyodideContextType {
    const context = useContext(PyodideContext);
    if (context === undefined) {
        throw new Error('usePyodide deve ser usado dentro de um PyodideProvider');
    }
    return context;
}

