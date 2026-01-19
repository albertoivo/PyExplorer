import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BossBattleQuestion } from '../BossBattleQuestion';
import type { QuestionDocument } from '../../../../types/question';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
    default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
        <textarea
            data-testid="monaco-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}));

const mockQuestion: QuestionDocument = {
    id: 'boss1',
    type: 'boss_battle',
    title: 'Boss Fight',
    prompt: 'Defeat the boss by summing 1+1',
    difficulty: 'hard',
    tags: [],
    bossMetadata: {
        bossName: 'Bug Lord',
        bossAvatar: '👾',
        timeLimitSeconds: 10,
        initialCode: 'def fight():\n    pass'
    }
};

describe('BossBattleQuestion', () => {
    const mockOnRun = vi.fn();
    const mockOnComplete = vi.fn();
    const mockOnNext = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders intro screen initially', () => {
        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        expect(screen.getByText('Desafio do Chefe: Bug Lord')).toBeDefined();
        expect(screen.getByText('⚔️ Iniciar Batalha')).toBeDefined();
        expect(screen.queryByTestId('monaco-editor')).toBeNull(); // Editor hidden initially
    });

    it('starts battle when Start button is clicked', () => {
        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        fireEvent.click(screen.getByText('⚔️ Iniciar Batalha'));

        expect(screen.getByTestId('monaco-editor')).toBeDefined();
        expect(screen.getByText('⏰')).toBeDefined(); // Timer visible
    });

    it('counts down the timer', () => {
        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        fireEvent.click(screen.getByText('⚔️ Iniciar Batalha'));

        // Initial time: 00:10
        expect(screen.getByText('00:10')).toBeDefined();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText('00:09')).toBeDefined();
    });

    it('triggers Game Over when timer reaches 0', () => {
        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        fireEvent.click(screen.getByText('⚔️ Iniciar Batalha'));

        act(() => {
            vi.advanceTimersByTime(10000); // 10 seconds
        });

        expect(screen.getByText(/O tempo acabou/)).toBeDefined();
        expect(screen.getByText('🔄 Tentar Novamente')).toBeDefined();
    });

    it('allows retrying after Game Over', () => {
        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        fireEvent.click(screen.getByText('⚔️ Iniciar Batalha'));

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        fireEvent.click(screen.getByText('🔄 Tentar Novamente'));

        // Should return to Intro
        expect(screen.getByText('⚔️ Iniciar Batalha')).toBeDefined();
        expect(screen.queryByText(/O tempo acabou/)).toBeNull();
    });

    it('handles victory correctly', async () => {
        mockOnRun.mockResolvedValueOnce({
            hasError: false,
            allTestsPassed: true
        });

        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        fireEvent.click(screen.getByText('⚔️ Iniciar Batalha'));

        // Click Attack
        // Note: handleRun calls onRun.
        // We need to wait for promise resolution.
        const attackBtn = screen.getByText('⚔️ Atacar (Rodar)');

        await act(async () => {
            fireEvent.click(attackBtn);
        });

        expect(mockOnRun).toHaveBeenCalled();
        expect(mockOnComplete).toHaveBeenCalledWith(100);
        expect(screen.getByText(/Incrível! Você derrotou o Bug Lord/)).toBeDefined();
        expect(screen.getByText('🎉 Continuar')).toBeDefined();
    });

    it('handles defeat (execution error) correctly', async () => {
        mockOnRun.mockResolvedValueOnce({
            hasError: true,
            stderr: 'SyntaxError'
        });

        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        fireEvent.click(screen.getByText('⚔️ Iniciar Batalha'));

        const attackBtn = screen.getByText('⚔️ Atacar (Rodar)');

        await act(async () => {
            fireEvent.click(attackBtn);
        });

        expect(screen.getByText('SyntaxError')).toBeDefined();
        expect(mockOnComplete).not.toHaveBeenCalled();
    });
});
