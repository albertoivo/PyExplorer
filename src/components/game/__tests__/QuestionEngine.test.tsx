import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuestionEngine } from '../QuestionEngine';
import type { QuestionDocument } from '../../../types/question';

// Mock dependencies
const { mockUpdateUserData, mockRunPython, mockMascotReact, mockConfetti, mockPlaySound } = vi.hoisted(() => {
    return {
        mockUpdateUserData: vi.fn(),
        mockRunPython: vi.fn(),
        mockMascotReact: vi.fn(),
        mockConfetti: vi.fn(),
        mockPlaySound: vi.fn(),
    };
});

vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        userData: { uid: 'test-user', totalScore: 100, balance: 50 },
        updateUserData: mockUpdateUserData,
    }),
}));

vi.mock('../../../context/PyodideContext', () => ({
    usePyodide: () => ({
        runPython: mockRunPython,
        executing: false,
    }),
}));

vi.mock('../../../context/MascotContext', () => ({
    useMascotContext: () => ({
        react: mockMascotReact,
    }),
}));

vi.mock('canvas-confetti', () => ({
    default: mockConfetti,
}));

vi.mock('../../../utils/soundEffects', () => ({
    playSound: mockPlaySound,
}));

// Mock Child Components
vi.mock('../questionTypes', () => ({
    MultipleChoiceQuestion: ({ onAnswer, disabled }: any) => (
        <div data-testid="mc-question">
            <button disabled={disabled} onClick={() => onAnswer(true)}>Answer Correct</button>
            <button disabled={disabled} onClick={() => onAnswer(false)}>Answer Incorrect</button>
        </div>
    ),
    TrueFalseQuestion: () => <div data-testid="tf-question">True False</div>,
    FillCodeQuestion: () => <div data-testid="fc-question">Fill Code</div>,
    // Add other types as needed
    PartialFunctionQuestion: () => <div />,
    FullFunctionQuestion: () => <div />,
    ParsonsQuestion: () => <div />,
    TurtleQuestion: () => <div />,
}));

vi.mock('../questionTypes/BossBattleQuestion', () => ({
    BossBattleQuestion: ({ onRun, onComplete }: any) => (
        <div data-testid="boss-question">
            <button onClick={() => onRun('print("hello")')}>Run Code</button>
            <button onClick={() => onComplete(100)}>Complete Boss</button>
        </div>
    ),
}));

vi.mock('../feedback/ResultPanel', () => ({
    ResultPanel: ({ onRetry, onNext, success, message }: any) => (
        <div data-testid="result-panel">
            <span>{success ? 'Success' : 'Fail'}</span>
            <span>{message}</span>
            {onRetry && <button onClick={onRetry}>MockRetry</button>}
            {onNext && <button onClick={onNext}>MockNext</button>}
        </div>
    )
}));

vi.mock('../../education', () => ({
    ProgressiveHints: ({ onHintRevealed }: any) => (
        <div data-testid="hints">
            <button onClick={() => onHintRevealed('hint1', 5)}>Reveal Hint 1</button>
        </div>
    ),
}));

describe('QuestionEngine', () => {
    const mockQuestion: QuestionDocument = {
        id: 'q1',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Test Question',
        prompt: 'What is 1+1?',
        explanationKidFriendly: 'Math is fun!',
        options: ['1', '2', '3'],
        answerIndex: 1,
        points: 10,
    };

    const mockOnComplete = vi.fn();
    const mockOnNext = vi.fn();
    const mockOnRetry = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the correct question type component', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );
        expect(screen.getByTestId('mc-question')).toBeInTheDocument();
    });

    it('renders boss battle question correctly', () => {
        const bossQuestion: QuestionDocument = { ...mockQuestion, type: 'boss_battle' };
        render(
            <QuestionEngine
                question={bossQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );
        expect(screen.getByTestId('boss-question')).toBeInTheDocument();
    });

    it('handles correct answer flow', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        fireEvent.click(screen.getByText('Answer Correct'));

        // Check effects
        expect(mockMascotReact).toHaveBeenCalledWith(true);
        expect(mockConfetti).toHaveBeenCalled();
        expect(mockPlaySound).toHaveBeenCalledWith('success');
        expect(mockOnComplete).toHaveBeenCalledWith(true, 10); // Base points 10 * 1 (easy) * 1 (MC) = 10

        // Check Result Panel
        expect(screen.getByTestId('result-panel')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('handles incorrect answer flow', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                onRetry={mockOnRetry}
            />
        );

        fireEvent.click(screen.getByText('Answer Incorrect'));

        // Check effects
        expect(mockMascotReact).toHaveBeenCalledWith(false);
        expect(mockPlaySound).toHaveBeenCalledWith('error');
        expect(mockOnComplete).toHaveBeenCalledWith(false, 0);

        // Check Result Panel
        expect(screen.getByTestId('result-panel')).toBeInTheDocument();
        expect(screen.getByText('Fail')).toBeInTheDocument();

        // Retry
        fireEvent.click(screen.getByText('MockRetry'));
        expect(mockOnRetry).toHaveBeenCalled();
    });

    it('handles next button click', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        // Answer correctly to see next button
        fireEvent.click(screen.getByText('Answer Correct'));
        fireEvent.click(screen.getByText('MockNext'));

        expect(mockOnNext).toHaveBeenCalled();
    });

    it('handles hints logic', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        // Toggle hints
        const toggleBtn = screen.getByText(/Preciso de Ajuda/i);
        fireEvent.click(toggleBtn);

        expect(screen.getByTestId('hints')).toBeInTheDocument();

        // Reveal hint
        fireEvent.click(screen.getByText('Reveal Hint 1'));

        // Check user data update (cost 5)
        // userData: totalScore: 100, balance: 50 -> new: 95, 45
        expect(mockUpdateUserData).toHaveBeenCalledWith({ totalScore: 95, balance: 45 });

        // Answer correctly with hints cost (5)
        // Score: 10. Penalty: floor(5/2) = 2. Final: 8.
        fireEvent.click(screen.getByText('Answer Correct'));

        expect(mockOnComplete).toHaveBeenCalledWith(true, 8);
        expect(screen.getByText(/Você usou dicas/i)).toBeInTheDocument();
    });

    it('renders in readonly mode', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                readOnly={true}
            />
        );

        expect(screen.getByText('📖 Modo Visualização')).toBeInTheDocument();
        expect(screen.getByTestId('result-panel')).toBeInTheDocument();
        // Should disable interactions (mocked component respects disabled prop)
        expect(screen.getByText('Answer Correct')).toBeDisabled();
    });

    it('integrates boss battle run logic', async () => {
        const bossQuestion: QuestionDocument = {
            ...mockQuestion,
            type: 'boss_battle',
            tests: [{ input: 'x', output: 'y' }]
        };

        mockRunPython.mockResolvedValue({ stdout: 'hello', passed: true });

        render(
            <QuestionEngine
                question={bossQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
            />
        );

        await act(async () => {
            fireEvent.click(screen.getByText('Run Code'));
        });

        expect(mockRunPython).toHaveBeenCalledWith('print("hello")', bossQuestion.tests);
    });

    it('applies powerup double_stars', () => {
        render(
            <QuestionEngine
                question={mockQuestion}
                onComplete={mockOnComplete}
                onNext={mockOnNext}
                activePowerUp="double_stars"
            />
        );

        fireEvent.click(screen.getByText('Answer Correct'));

        // Base 10. QuestionEngine does NOT apply multiplier to onComplete score (handled by GamePage)
        expect(mockOnComplete).toHaveBeenCalledWith(true, 10);
        expect(screen.getByText(/Double Stars Ativo!/i)).toBeInTheDocument();
    });
});
