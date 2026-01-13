/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { PyodideProvider, usePyodide } from '../PyodideContext';
import type { PythonExecutionResult } from '../../types/question';

// Mock pyodide load script
// We need to intercept the script loading or mock window.loadPyodide immediately if logic checks for script tag.
// The code checks `document.querySelector('script[src*="pyodide"]')` and if not found, appends it.
// Then waits for window.loadPyodide.

describe('PyodideContext', () => {
    let mockPyodideInstance: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock pyodide instance
        mockPyodideInstance = {
            runPythonAsync: vi.fn().mockResolvedValue(undefined),
            globals: { get: vi.fn(), set: vi.fn() },
            loadPackage: vi.fn().mockResolvedValue(undefined),
            FS: {
                writeFile: vi.fn(),
                readFile: vi.fn().mockReturnValue(''),
            },
        };

        // Mock window.loadPyodide
        window.loadPyodide = vi.fn().mockResolvedValue(mockPyodideInstance);

        // Mock document functions to simulate script load
        const originalCreateElement = document.createElement;
        document.createElement = vi.fn().mockImplementation((tag) => {
            if (tag === 'script') {
                return {
                    src: '',
                    async: false,
                    onload: null,
                    onerror: null,
                };
            }
            return originalCreateElement.call(document, tag);
        }) as any;

        document.head.appendChild = vi.fn().mockImplementation((el: any) => {
            if (el.onload) {
                setTimeout(el.onload, 10); // Simulate load delay
            }
            return el;
        }) as any;

        // Mock querySelector
        document.querySelector = vi.fn().mockReturnValue(null); // Script not loaded yet
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PyodideProvider>{children}</PyodideProvider>
    );

    it('initializes with not ready state', () => {
        const { result } = renderHook(() => usePyodide(), { wrapper });
        expect(result.current.ready).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('loads pyodide successfully', async () => {
        const { result } = renderHook(() => usePyodide(), { wrapper });

        // Trigger load
        act(() => {
            result.current.loadPyodide();
        });

        expect(result.current.loading).toBe(true);

        // Wait for it to be ready
        await waitFor(() => {
            expect(result.current.ready).toBe(true);
        }, { timeout: 2000 });

        expect(result.current.loading).toBe(false);
        expect(window.loadPyodide).toHaveBeenCalled();
    });

    it('runs python code successfully', async () => {
        const { result } = renderHook(() => usePyodide(), { wrapper });

        // Load first
        await act(async () => {
            await result.current.loadPyodide();
        });

        await waitFor(() => expect(result.current.ready).toBe(true));

        // Setup mock return for stdout capture
        // runPythonAsync is called multiple times:
        // 1. Reset capture
        // 2. User code
        // 3. Get stdout
        // 4. Get stderr
        // 5. Restore stdout

        mockPyodideInstance.runPythonAsync
            .mockResolvedValueOnce(undefined) // reset
            .mockResolvedValueOnce(undefined) // user code
            .mockResolvedValueOnce('Hello World') // stdout
            .mockResolvedValueOnce('') // stderr
            .mockResolvedValueOnce(undefined); // restore

        let output: PythonExecutionResult | undefined;
        await act(async () => {
            output = await result.current.runPython('print("Hello World")');
        });

        expect(output?.stdout).toBe('Hello World');
        expect(output?.hasError).toBe(false);
    });

    it('handles python errors', async () => {
        const { result } = renderHook(() => usePyodide(), { wrapper });

        await act(async () => {
            await result.current.loadPyodide();
        });
        await waitFor(() => expect(result.current.ready).toBe(true));

        mockPyodideInstance.runPythonAsync
            .mockResolvedValueOnce(undefined) // reset
            .mockRejectedValueOnce(new Error('SyntaxError: invalid syntax')); // user code error

        let output: PythonExecutionResult | undefined;
        await act(async () => {
            output = await result.current.runPython('syntax error');
        });

        expect(output?.hasError).toBe(true);
        expect(output?.stderr).toContain('Erro de Sintaxe');
    });

    it('executes tests against python code', async () => {
        const { result } = renderHook(() => usePyodide(), { wrapper });

        await act(async () => {
            await result.current.loadPyodide();
        });
        await waitFor(() => expect(result.current.ready).toBe(true));

        // Mock setup for tests
        // 1. Reset
        // 2. User code
        // 3. Stdout
        // 4. Stderr
        // 5. Restore
        // 6. Test call

        mockPyodideInstance.runPythonAsync
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(4); // Test result (sum(2,2) -> 4)

        const tests = [{ input: [2, 2], expectedOutput: 4 }];

        let output: PythonExecutionResult | undefined;
        await act(async () => {
            output = await result.current.runPython('def sum(a,b): return a+b', tests, 'sum');
        });

        expect(output?.testResults).toBeDefined();
        expect(output?.testResults![0].passed).toBe(true);
        expect(output?.allTestsPassed).toBe(true);
    });
});
