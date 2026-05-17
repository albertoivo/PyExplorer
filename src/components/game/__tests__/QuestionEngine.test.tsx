import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import QuestionEngine from '../QuestionEngine';
import { useAuth } from '../../../hooks/useAuth';
import { usePyodide } from '../../../context/PyodideContext';
import { useMascotContext } from '../../../context/MascotContext';
import { playSound } from '../../../utils/soundEffects';
import type { QuestionDocument } from '../../../types/question';

// Mocks
vi.mock('../../../hooks/useAuth');
vi.mock('../../../context/PyodideContext');
vi.mock('../../../context/MascotContext');
vi.mock('../../../utils/soundEffects');

// Mock Child Components
vi.mock('../questionTypes', () => ({
    MultipleChoiceQuestion: ({ onAnswer }: { onAnswer: (correct: boolean) => void }) => (
        <div data-testid="multiple-choice">
            <button onClick={() => onAnswer(true)}>Correct</button>
            <button onClick={() => onAnswer(false)}>Incorrect</button>
        </div>
    ),
    TrueFalseQuestion: () => <div data-testid="true-false" />,
    FillCodeQuestion: () => <div data-testid="fill-code" />,
    PartialFunctionQuestion: () => <div data-testid="partial-function" />,
    FullFunctionQuestion: () => <div data-testid="full-function" />,
    ParsonsQuestion: () => <div data-testid="parsons" />,
    TurtleQuestion: () => <div data-testid="turtle" />,
}));

vi.mock('../questionTypes/BossBattleQuestion', () => ({
    BossBattleQuestion: ({ onRun, onComplete }: { onRun: (code: string) => void; onComplete: (score: number) => void }) => (
        <div data-testid="boss-battle">
            <button onClick={() => onRun('print("hello")')}>Run Code</button>
            <button onClick={() => onComplete(100)}>Complete Boss</button>
        </div>
    ),
}));

vi.mock('../feedback/ResultPanel', () => ({
    ResultPanel: ({ success, points, onNext, onRetry }: { success: boolean; points?: number; onNext?: () => void; onRetry?: () => void }) => (
        <div data-testid="result-panel">
            {success ? 'Success' : 'Failure'}
            {points !== undefined && ` Points: ${points}`}
            {onNext && <button onClick={onNext}>Next</button>}
            {onRetry && <button onClick={onRetry}>Retry</button>}
        </div>
    ),
}));

vi.mock('../../education', () => ({
    ProgressiveHints: ({ onHintRevealed }: { onHintRevealed: (hintId: string, cost: number) => void }) => (
        <div data-testid="progressive-hints">
            <button onClick={() => onHintRevealed('hint_1', 10)}>Reveal Hint</button>
        </div>
    ),
}));

describe('QuestionEngine', () => {
    const mockOnComplete = vi.fn();
    const mockOnNext = vi.fn();
    const mockOnRetry = vi.fn();
    const mockUpdateUserData = vi.fn();
    const mockRunPython = vi.fn();
    const mockMascotReact = vi.fn();

    const baseQuestion: QuestionDocument = {
        id: 'q1',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Test Question',
        prompt: 'What is 1+1?',
        explanationKidFriendly: 'Math is fun!',
        points: 10,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (useAuth as Mock).mockReturnValue({
            userData: { totalScore: 100, balance: 50 },
            updateUserData: mockUpdateUserData,
        });

        (usePyodide as Mock).mockReturnValue({
            runPython: mockRunPython,
            executing: false,
        });

        (useMascotContext as Mock).mockReturnValue({
            react: mockMascotReact,
        });
    });

    it('renders the correct question type component', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );
        expect(screen.getByTestId('multiple-choice')).toBeInTheDocument();

        // Test another type
        render(
            <QuestionEngine
                question={{ ...baseQuestion, type: 'true_false', id: 'q2' }}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );
        expect(screen.getByTestId('true-false')).toBeInTheDocument();
    });

    it('handles correct answer flow', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        fireEvent.click(screen.getByText('Correct'));

        expect(playSound).toHaveBeenCalledWith('success');
        // confetti is now dynamically imported
        expect(mockMascotReact).toHaveBeenCalledWith(true);
        expect(screen.getByTestId('result-panel')).toHaveTextContent('Success');

        // Base points: 10 * 1 (easy) * 1 (multiple_choice) = 10
        expect(mockOnComplete).toHaveBeenCalledWith(true, 10);
    });

    it('handles incorrect answer flow', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        fireEvent.click(screen.getByText('Incorrect'));

        expect(playSound).toHaveBeenCalledWith('error');
        expect(mockMascotReact).toHaveBeenCalledWith(false);
        expect(screen.getByTestId('result-panel')).toHaveTextContent('Failure');

        // Incorrect answer gives 0 points
        expect(mockOnComplete).toHaveBeenCalledWith(false, 0);
    });

    it('handles hints system', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        // Open hints
        fireEvent.click(screen.getByText(/Preciso de Ajuda/i));
        expect(screen.getByTestId('progressive-hints')).toBeInTheDocument();

        // Reveal hint (cost 10)
        fireEvent.click(screen.getByText('Reveal Hint'));

        // Should deduct cost from user data
        expect(mockUpdateUserData).toHaveBeenCalledWith({
            totalScore: 90, // 100 - 10
            balance: 40,    // 50 - 10
        });

        // Answer correctly
        fireEvent.click(screen.getByText('Correct'));

        // Score should be reduced by half of hint cost (5)
        // Base score 10 - 5 = 5
        expect(mockOnComplete).toHaveBeenCalledWith(true, 5);
    });

    it('calculates score correctly based on difficulty', () => {
        const hardQuestion: QuestionDocument = {
            ...baseQuestion,
            difficulty: 'hard', // Multiplier 2
            points: 20,
        };

        render(
            <QuestionEngine
                question={hardQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        fireEvent.click(screen.getByText('Correct'));

        // 20 (base) * 2 (hard) * 1 (multiple_choice) = 40
        expect(mockOnComplete).toHaveBeenCalledWith(true, 40);
    });

    it('applies power-up double_stars', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                activePowerUp="double_stars"
            />
        );

        fireEvent.click(screen.getByText('Correct'));

        // onComplete receives base score (GamePage handles multiplication)
        expect(mockOnComplete).toHaveBeenCalledWith(true, 10);

        // ResultPanel should show doubled score
        expect(screen.getByTestId('result-panel')).toHaveTextContent('Points: 20');
    });

    it('handles Boss Battle flow', async () => {
        const bossQuestion: QuestionDocument = {
            ...baseQuestion,
            type: 'boss_battle',
            tests: [],
        };

        render(
            <QuestionEngine
                question={bossQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        expect(screen.getByTestId('boss-battle')).toBeInTheDocument();

        // Run Code
        fireEvent.click(screen.getByText('Run Code'));
        expect(mockRunPython).toHaveBeenCalledWith('print("hello")', []);

        // Complete Boss
        fireEvent.click(screen.getByText('Complete Boss'));
        expect(mockOnComplete).toHaveBeenCalledWith(true, 100);
    });

    it('renders in read-only mode', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                readOnly={true}
            />
        );

        expect(screen.getByText(/Modo Visualização/i)).toBeInTheDocument();
        // Result panel should be visible immediately
        expect(screen.getByTestId('result-panel')).toBeInTheDocument();
    });

    it('handles retry and next actions', () => {
        render(
            <QuestionEngine
                question={baseQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                onRetry={mockOnRetry}
            />
        );

        // Fail first
        fireEvent.click(screen.getByText('Incorrect'));

        // Retry
        fireEvent.click(screen.getByText('Retry'));
        expect(mockOnRetry).toHaveBeenCalled();

        // UI should reset (simulated by parent re-render usually, but local state changes too)
        // Note: QuestionEngine remounts on key change usually, but internal retry handler
        // just hides result.

        // Now Succeed
        fireEvent.click(screen.getByText('Correct'));

        // Next
        fireEvent.click(screen.getByText('Next'));
        expect(mockOnNext).toHaveBeenCalled();
    });
});
