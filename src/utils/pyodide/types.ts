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

export interface PyodideInterface {
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
