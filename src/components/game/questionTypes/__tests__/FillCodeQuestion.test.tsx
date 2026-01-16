import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FillCodeQuestion from '../FillCodeQuestion';
import { usePyodide } from '../../../../hooks/usePyodide';

// Mock usePyodide
vi.mock('../../../../hooks/usePyodide');

// Mock PythonEditor
vi.mock('../../../editor/PythonEditor', () => ({
    default: ({ code, onChange, disabled }: any) => (
        <textarea
            data-testid="python-editor"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        />
    ),
}));

describe('FillCodeQuestion', () => {
    const mockRunPython = vi.fn();
    const mockOnAnswer = vi.fn();

    const mockQuestion = {
        id: 'q1',
        type: 'fill_code',
        title: 'Test Question',
        prompt: 'Fill the code',
        starterCode: 'print("hello")',
        difficulty: 'easy',
        functionName: 'test_func',
        tests: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (usePyodide as any).mockReturnValue({
            runPython: mockRunPython,
            ready: true,
        });
    });

    it('should render correctly', () => {
        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        expect(screen.getByText('Test Question')).toBeInTheDocument();
        expect(screen.getByText('Fill the code')).toBeInTheDocument();
        expect(screen.getByTestId('python-editor')).toHaveValue('print("hello")');
    });

    it('should handle code change', () => {
        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        const editor = screen.getByTestId('python-editor');
        fireEvent.change(editor, { target: { value: 'print("world")' } });

        expect(editor).toHaveValue('print("world")');
    });

    it('should execute code and handle success', async () => {
        mockRunPython.mockResolvedValue({
            hasError: false,
            allTestsPassed: true,
            stdout: 'hello',
            testResults: [{ passed: true, expectedOutput: 'a', actualOutput: 'a' }],
        });

        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        const button = screen.getByText(/Executar e Verificar/i);
        fireEvent.click(button);

        expect(screen.getByText(/Executando/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(mockRunPython).toHaveBeenCalledWith('print("hello")', mockQuestion.tests, mockQuestion.functionName);
            expect(mockOnAnswer).toHaveBeenCalledWith(true, 'print("hello")');
            expect(screen.getByText(/Saída:/i)).toBeInTheDocument();
        });
    });

    it('should execute code and handle failure (tests failed)', async () => {
        mockRunPython.mockResolvedValue({
            hasError: false,
            allTestsPassed: false,
            stdout: 'wrong',
            testResults: [{ passed: false, expectedOutput: 'a', actualOutput: 'b' }],
        });

        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        fireEvent.click(screen.getByText(/Executar e Verificar/i));

        await waitFor(() => {
            expect(mockOnAnswer).toHaveBeenCalledWith(false, 'print("hello")');
            expect(screen.getByText(/Teste 1: Falhou/i)).toBeInTheDocument();
        });
    });

    it('should execute code and handle runtime error', async () => {
        mockRunPython.mockResolvedValue({
            hasError: true,
            stderr: 'SyntaxError: unexpected token',
        });

        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        fireEvent.click(screen.getByText(/Executar e Verificar/i));

        await waitFor(() => {
            expect(mockOnAnswer).toHaveBeenCalledWith(false, 'print("hello")');
            expect(screen.getByText(/SyntaxError/i)).toBeInTheDocument();
        });
    });

    it('should handle exception during execution call', async () => {
        mockRunPython.mockRejectedValue(new Error('System Error'));

        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        fireEvent.click(screen.getByText(/Executar e Verificar/i));

        await waitFor(() => {
            expect(mockOnAnswer).toHaveBeenCalledWith(false, 'print("hello")');
            expect(screen.getByText(/Erro: System Error/i)).toBeInTheDocument();
        });
    });

    it('should be disabled when not ready', () => {
        (usePyodide as any).mockReturnValue({
            runPython: mockRunPython,
            ready: false,
        });

        render(
            <FillCodeQuestion
                question={mockQuestion as any}
                onAnswer={mockOnAnswer}
            />
        );

        expect(screen.getByText(/Carregando Python/i)).toBeInTheDocument();
        expect(screen.getByTestId('python-editor')).toBeDisabled();

        const button = screen.getByText(/Executar e Verificar/i);
        expect(button).toBeDisabled();
    });
});
