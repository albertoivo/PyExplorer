import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BossBattleQuestion } from '../components/game/questionTypes/BossBattleQuestion';
import type { QuestionDocument } from '../types/question';

// Mock timers
vi.useFakeTimers();

vi.mock('@monaco-editor/react', () => ({
    default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
        <textarea
            data-testid="monaco-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
    loader: {
        config: vi.fn(),
        init: vi.fn().mockResolvedValue({}),
    },
}));

describe('BossBattleQuestion', () => {
    const mockQuestion: QuestionDocument = {
        id: 'boss_1',
        type: 'boss_battle',
        world: 'basic_commands',
        difficulty: 'hard',
        ageMin: 8,
        title: 'Boss 1',
        prompt: 'Defeat the boss',
        explanationKidFriendly: 'Explain',
        bossMetadata: {
            bossName: 'Big Boss',
            bossAvatar: '👹',
            timeLimitSeconds: 60,
            initialCode: 'print("hello")'
        },
        tests: [],
        solutionTemplate: ''
    };

    const mockOnRun = vi.fn().mockResolvedValue({
        hasError: false,
        allTestsPassed: true,
        stdout: '',
        stderr: ''
    });
    const mockOnComplete = vi.fn();
    const mockOnNext = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('renders initial state correctly', () => {
        render(
            <BossBattleQuestion
                question={mockQuestion}
                onRun={mockOnRun}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                isExecuting={false}
            />
        );

        expect(screen.getByText('Desafio do Chefe: Big Boss')).toBeDefined();
        expect(screen.getByText('⚔️ Iniciar Batalha')).toBeDefined();
    });

    it('starts the battle and timer', () => {
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

        expect(screen.getByText('Big Boss')).toBeDefined();
        // Timer should start at 01:00
        expect(screen.getByText('01:00')).toBeDefined();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // 59 seconds left
        expect(screen.getByText('00:59')).toBeDefined();
    });

    it('handles time running out', () => {
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
            vi.advanceTimersByTime(60000); // 60s
        });

        expect(screen.getByText(/O tempo acabou/i)).toBeDefined();
        expect(screen.getByText('🔄 Tentar Novamente')).toBeDefined();
    });

    it('calls onRun when attacking', async () => {
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

        expect(mockOnRun).toHaveBeenCalled();
    });
});
