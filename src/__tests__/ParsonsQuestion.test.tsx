
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ParsonsQuestion } from '../components/game/questionTypes/ParsonsQuestion';
import type { QuestionDocument } from '../types/question';

// Mock do hook usePyodide
const mockRunPython = vi.fn();
vi.mock('../hooks/usePyodide', () => ({
    usePyodide: () => ({
        runPython: mockRunPython,
        ready: true,
    }),
}));

const mockQuestion: QuestionDocument = {
    id: 'parsons_test_1',
    type: 'parsons_problem',
    world: 'basic_commands',
    difficulty: 'easy',
    ageMin: 8,
    title: 'Test Parsons',
    prompt: 'Ordene o código.',
    parsonsSegments: [
        'print("Primeiro")',
        'print("Segundo")'
    ],
    explanationKidFriendly: 'Teste',
    points: 10
};

describe('ParsonsQuestion', () => {
    it('renders correctly', () => {
        render(
            <ParsonsQuestion
                question={mockQuestion}
                onAnswer={() => {}}
            />
        );

        expect(screen.getByText('Test Parsons')).toBeInTheDocument();
        expect(screen.getByText('print("Primeiro")')).toBeInTheDocument();
        expect(screen.getByText('print("Segundo")')).toBeInTheDocument();
        expect(screen.getByText('Verificar Ordem ✨')).toBeInTheDocument();
    });

    it('handles submission correctly', async () => {
        const onAnswer = vi.fn();
        mockRunPython.mockResolvedValueOnce({ hasError: false, allTestsPassed: true });

        render(
            <ParsonsQuestion
                question={mockQuestion}
                onAnswer={onAnswer}
            />
        );

        const submitButton = screen.getByText('Verificar Ordem ✨');

        await act(async () => {
            fireEvent.click(submitButton);
            // Aguarda a execução assíncrona
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(mockRunPython).toHaveBeenCalled();
        expect(onAnswer).toHaveBeenCalledWith(true, expect.any(String));
    });

    it('handles drag start', () => {
        // Mock Math.random to make shuffling deterministic for test
        vi.spyOn(Math, 'random').mockReturnValue(0.1);

        render(
            <ParsonsQuestion
                question={mockQuestion}
                onAnswer={() => {}}
            />
        );

        const block = screen.getByText('print("Primeiro")').closest('.parsons-block');
        expect(block).toBeTruthy();

        const dragEvent = {
            dataTransfer: {
                setData: vi.fn(),
                effectAllowed: ''
            }
        };

        fireEvent.dragStart(block!, dragEvent);
        // With random mock returning 0.1, the order should be preserved (sort is usually unstable with random, but lets check)
        // Actually, let's just inspect the blocks order in DOM if we could,
        // but finding the exact index for drag start is tricky without inspecting internal state.
        // We just verify setData was called with SOME index.
        expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', expect.any(String));

        vi.restoreAllMocks();
    });
});
