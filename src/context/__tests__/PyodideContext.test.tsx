/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { PyodideProvider, usePyodide } from '../PyodideContext';
import type { PythonExecutionResult } from '../../types/question';

// Mock pyodide load script
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

        mockPyodideInstance.runPythonAsync
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce(4); // Test result

        const tests = [{ input: [2, 2], expectedOutput: 4 }];

        let output: PythonExecutionResult | undefined;
        await act(async () => {
            output = await result.current.runPython('def sum(a,b): return a+b', tests, 'sum');
        });

        expect(output?.testResults).toBeDefined();
        expect(output?.testResults![0].passed).toBe(true);
        expect(output?.allTestsPassed).toBe(true);
    });

    it('validates multiline stdout', async () => {
        const { result } = renderHook(() => usePyodide(), { wrapper });

        await act(async () => {
            await result.current.loadPyodide();
        });
        await waitFor(() => expect(result.current.ready).toBe(true));

        mockPyodideInstance.runPythonAsync
            .mockResolvedValueOnce(undefined) // reset
            .mockResolvedValueOnce(undefined) // user code
            .mockResolvedValueOnce('Line 1\nLine 2') // stdout
            .mockResolvedValueOnce('') // stderr
            .mockResolvedValueOnce(undefined); // restore

        const tests = [{ input: null, expectedOutput: "Line 1\nLine 2" }];

        let output: PythonExecutionResult | undefined;
        await act(async () => {
            output = await result.current.runPython('print("Line 1\\nLine 2")', tests);
        });

        expect(output?.testResults).toBeDefined();
        expect(output?.testResults![0].passed).toBe(true);
        expect(output?.allTestsPassed).toBe(true);
    });

    describe('Output Validation Strategies', () => {
        it('validates using REGEX', async () => {
            const { result } = renderHook(() => usePyodide(), { wrapper });
            await act(async () => { await result.current.loadPyodide(); });
            await waitFor(() => expect(result.current.ready).toBe(true));

            mockPyodideInstance.runPythonAsync
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce('The answer is 42') // stdout
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce(undefined);

            const tests = [{ input: null, expectedOutput: "regex:answer is \\d+" }];

            let output: PythonExecutionResult | undefined;
            await act(async () => {
                output = await result.current.runPython('print("The answer is 42")', tests);
            });

            expect(output?.testResults![0].passed).toBe(true);
        });

        it('validates Line Count', async () => {
            const { result } = renderHook(() => usePyodide(), { wrapper });
            await act(async () => { await result.current.loadPyodide(); });
            await waitFor(() => expect(result.current.ready).toBe(true));

            mockPyodideInstance.runPythonAsync
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce('1\n2\n3') // stdout
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce(undefined);

            const tests = [{ input: null, expectedOutput: 3 }]; // Expect at least 3 lines

            let output: PythonExecutionResult | undefined;
            await act(async () => {
                output = await result.current.runPython('...', tests);
            });

            expect(output?.testResults![0].passed).toBe(true);
            expect(output?.testResults![0].expectedOutput).toContain('Pelo menos 3');
        });

        it('handles execution error within a test case', async () => {
            const { result } = renderHook(() => usePyodide(), { wrapper });
            await act(async () => { await result.current.loadPyodide(); });
            await waitFor(() => expect(result.current.ready).toBe(true));

            mockPyodideInstance.runPythonAsync
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('ZeroDivisionError')); // Test execution fails

            const tests = [{ input: [1], expectedOutput: 1 }];

            let output: PythonExecutionResult | undefined;
            await act(async () => {
                output = await result.current.runPython('def f(x): return 1/0', tests, 'f');
            });

            expect(output?.testResults![0].passed).toBe(false);
            expect(output?.testResults![0].error).toContain('ZeroDivisionError');
            expect(output?.allTestsPassed).toBe(false);
        });

        it('validates Floating Point with tolerance', async () => {
            const { result } = renderHook(() => usePyodide(), { wrapper });
            await act(async () => { await result.current.loadPyodide(); });
            await waitFor(() => expect(result.current.ready).toBe(true));

            mockPyodideInstance.runPythonAsync
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(3.14159265359); // Actual

            // Expected is close enough
            const tests = [{ input: [], expectedOutput: 3.14159 }];

            let output: PythonExecutionResult | undefined;
            await act(async () => {
                output = await result.current.runPython('def pi(): return 3.14159265359', tests, 'pi');
            });

            expect(output?.testResults![0].passed).toBe(true);
        });

        it('compares objects/arrays via JSON', async () => {
            const { result } = renderHook(() => usePyodide(), { wrapper });
            await act(async () => { await result.current.loadPyodide(); });
            await waitFor(() => expect(result.current.ready).toBe(true));

            mockPyodideInstance.runPythonAsync
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce({ a: 1, b: 2 }); // Actual object

            const tests = [{ input: [], expectedOutput: { a: 1, b: 2 } }];

            let output: PythonExecutionResult | undefined;
            await act(async () => {
                output = await result.current.runPython('def obj(): return {"a":1, "b":2}', tests, 'obj');
            });

            expect(output?.testResults![0].passed).toBe(true);
        });
    });

    describe('Error Formatting', () => {
        it('translates friendly error messages', async () => {
            const { result } = renderHook(() => usePyodide(), { wrapper });
            await act(async () => { await result.current.loadPyodide(); });
            await waitFor(() => expect(result.current.ready).toBe(true));

            const errorCases = [
                { raw: "NameError: name 'x' is not defined", expected: 'Ops! O nome "x" não foi criado ainda' },
                { raw: "IndentationError: unexpected indent", expected: 'Erro de Espaçamento' },
                { raw: "TypeError: unsupported operand type", expected: 'Erro de Tipo' },
                { raw: "ZeroDivisionError: division by zero", expected: 'Não podemos dividir por zero' },
                { raw: "IndexError: list index out of range", expected: 'Erro de Índice' },
            ];

            for (const { raw, expected } of errorCases) {
                mockPyodideInstance.runPythonAsync
                    .mockResolvedValueOnce(undefined)
                    .mockRejectedValueOnce(new Error(raw));

                let output: PythonExecutionResult | undefined;
                await act(async () => {
                    output = await result.current.runPython('bad code');
                });

                expect(output?.hasError).toBe(true);
                expect(output?.stderr).toContain(expected);
            }
        });
    });
});
