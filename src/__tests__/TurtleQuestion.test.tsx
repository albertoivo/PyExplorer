
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TurtleQuestion } from '../components/game/questionTypes/TurtleQuestion';
import type { QuestionDocument } from '../types/question';

// Mock do hook usePyodide
const mockRunPython = vi.fn();
// IMPORTANT: Mock runPython to always return a promise!
mockRunPython.mockResolvedValue({});

vi.mock('../hooks/usePyodide', () => ({
    usePyodide: () => ({
        runPython: mockRunPython,
        ready: true,
    }),
}));

// Mock do componente PythonEditor (Monaco é pesado para testar)
vi.mock('../components/editor/PythonEditor', () => ({
    default: ({ code, onChange }: { code: string; onChange: (val: string) => void }) => (
        <textarea
            data-testid="python-editor"
            value={code}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

// Mock do componente TurtleCanvas
vi.mock('../components/game/turtle/TurtleCanvas', () => ({
    default: () => <div data-testid="turtle-canvas">Canvas Mock</div>,
}));

// Mock dos utils de validação
vi.mock('../utils/turtleValidation', () => ({
    runTurtleSimulation: vi.fn(),
    compareTurtlePaths: vi.fn(),
}));

const mockQuestion: QuestionDocument = {
    id: 'turtle_test_1',
    type: 'turtle_challenge',
    world: 'basic_commands',
    difficulty: 'easy',
    ageMin: 8,
    title: 'Test Turtle',
    prompt: 'Desenhe um quadrado.',
    starterCode: 'forward(100)',
    explanationKidFriendly: 'Teste',
    points: 10
};

describe('TurtleQuestion', () => {
    it('renders correctly', async () => {
         await act(async () => {
            render(
                <TurtleQuestion
                    question={mockQuestion}
                    onAnswer={() => {}}
                />
            );
        });

        expect(screen.getByText('Test Turtle')).toBeInTheDocument();
        expect(screen.getByTestId('python-editor')).toHaveValue('forward(100)');
        expect(screen.getByTestId('turtle-canvas')).toBeInTheDocument();
    });

    it('runs code when "Testar Desenho" is clicked', async () => {
        mockRunPython.mockResolvedValue({ hasError: false });

        await act(async () => {
            render(
                <TurtleQuestion
                    question={mockQuestion}
                    onAnswer={() => {}}
                />
            );
        });

        const runButton = screen.getByText('▶ Testar Desenho');

        await act(async () => {
            fireEvent.click(runButton);
            // Aguarda execução
            await new Promise(r => setTimeout(r, 200));
        });

        expect(mockRunPython).toHaveBeenCalled();
    });
});
