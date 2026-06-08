import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuestionEngine } from '../QuestionEngine';
import type { QuestionDocument } from '../../../types/question';

// Mock dependencies
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        userData: { uid: 'test-user', totalScore: 100, balance: 50 },
        updateUserData: vi.fn(),
    }),
}));

vi.mock('../../../context/PyodideContext', () => ({
    usePyodide: () => ({
        runPython: vi.fn(),
        executing: false,
    }),
}));

vi.mock('../../../context/MascotContext', () => ({
    useMascotContext: () => ({
        react: vi.fn(),
    }),
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

vi.mock('../../../utils/soundEffects', () => ({
    playSound: vi.fn(),
}));

// Mock child components to avoid complex rendering
vi.mock('../questionTypes', () => ({
    MultipleChoiceQuestion: () => <div data-testid="mc-question">Question Content</div>,
    TrueFalseQuestion: () => <div />,
    FillCodeQuestion: () => <div />,
    PartialFunctionQuestion: () => <div />,
    FullFunctionQuestion: () => <div />,
    ParsonsQuestion: () => <div />,
    TurtleQuestion: () => <div />,
}));

vi.mock('../../education', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ProgressiveHints: ({ onHintRevealed }: any) => (
        <div data-testid="hints">
            <button onClick={() => onHintRevealed('hint1', 5)}>Reveal Hint</button>
        </div>
    ),
}));

describe('QuestionEngine Performance', () => {
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
    };

    const mockOnComplete = vi.fn();
    const mockOnNext = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Clear localStorage
        localStorage.clear();
        vi.spyOn(Storage.prototype, 'getItem');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reads from localStorage on every render when hints are open (before optimization)', async () => {
        // Setup: Pre-populate localStorage with used hints for this question
        const usedHints = { [mockQuestion.id]: ['hint1'] };
        localStorage.setItem('pyexplorer_used_hints', JSON.stringify(usedHints));

        // Reset spy count (setItem call)
        vi.mocked(localStorage.getItem).mockClear();

        const Wrapper = () => {
            const [, setCount] = React.useState(0);
            return (
                <div>
                    <button onClick={() => setCount(c => c + 1)}>Force Render</button>
                    <QuestionEngine
                        question={mockQuestion}
                        onComplete={mockOnComplete}
                        onNext={mockOnNext}
                    />
                </div>
            );
        };

        const React = await import('react');
        render(<Wrapper />);

        // Initial render:
        // With optimization (lazy init), localStorage is read ONCE on mount to initialize state.
        // (Maybe 2 times in StrictMode, but we count calls).
        const initialCalls = vi.mocked(localStorage.getItem).mock.calls.length;
        expect(initialCalls).toBeGreaterThan(0); // Should be called on mount

        // Open hints
        const toggleButton = screen.getByText(/Preciso de Ajuda/i);
        fireEvent.click(toggleButton);

        // Now hints are shown.
        // Optimization check: Opening hints should NOT trigger new localStorage reads
        // because we are using the state.
        // const callsAfterOpen = vi.mocked(localStorage.getItem).mock.calls.length;
        // expect(callsAfterOpen).toBe(initialCalls); // Depends if re-render happens

        // Force re-render
        const forceBtn = screen.getByText('Force Render');
        fireEvent.click(forceBtn);

        // Check calls again
        const callsAfterRender = vi.mocked(localStorage.getItem).mock.calls.length;

        // CRITICAL: Calls should NOT increase after re-render or opening hints (beyond initial mount)
        console.log(`Calls initial: ${initialCalls}, Calls after render: ${callsAfterRender}`);

        // Expect NO new calls to localStorage after initial mount
        expect(callsAfterRender).toBe(initialCalls);
    });
});
