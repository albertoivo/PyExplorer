import type { TestCase, TestResult, PythonExecutionResult } from '../../types/question';
import type { PyodideInterface } from './types';
import { compareOutputs, formatPythonError } from '../pyodideLogic';

export async function runPythonCode(
    pyodide: PyodideInterface | null,
    ready: boolean,
    code: string,
    tests?: TestCase[],
    functionName?: string
): Promise<PythonExecutionResult> {
    if (!pyodide || !ready) {
        return {
            stdout: '',
            stderr: 'Pyodide ainda não está pronto. Aguarde o carregamento.',
            hasError: true,
        };
    }

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
    }
}
