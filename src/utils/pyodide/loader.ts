import type { PyodideInterface } from './types';
import { TURTLE_PYTHON_SHIM } from '../../components/game/turtle/turtle-python-shim';

export async function loadPyodideInstance(
    setLoadingProgress: (progress: number) => void
): Promise<PyodideInterface> {
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

    return pyodideInstance;
}
