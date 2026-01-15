import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompletedQuestionModal } from '../CompletedQuestionModal';
import type { QuestionDocument, UserProgress } from '../../../types/question';

describe('CompletedQuestionModal', () => {
    const mockQuestion: QuestionDocument = {
        id: 'test_q1',
        title: 'Test Question',
        prompt: 'Test Prompt',
        // content attribute removed
        type: 'multiple_choice',
        world: 'basic_commands', // Valid world
        difficulty: 'easy',
        options: ['A', 'B'],
        answerIndex: 0,
        ageMin: 8,
        explanationKidFriendly: 'Test Explanation', // Added required field
    };

    const mockProgress: UserProgress = {
        uid: 'test_user', // Correct field name is uid not userId
        questionId: 'test_q1',
        status: 'completed', // Status replaces passed boolean
        score: 100,
        attempts: 2,
        // userAnswer: 'A', // userAnswer might not be in UserProgress interface depending on definition, let's keep it safe
        lastAttemptAt: new Date(),
    };

    const mockHandlers = {
        onViewAnswer: vi.fn(),
        onRedo: vi.fn(),
        onClose: vi.fn(),
    };

    it('renders correctly with accessibility attributes', () => {
        render(
            <CompletedQuestionModal
                question={mockQuestion}
                progress={mockProgress}
                {...mockHandlers}
            />
        );

        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('aria-modal', 'true');
        expect(modal).toHaveAttribute('aria-labelledby', 'completed-modal-title');

        const closeBtn = screen.getByLabelText('Fechar modal');
        expect(closeBtn).toBeInTheDocument();
    });

    it('focuses close button on mount', () => {
        render(
            <CompletedQuestionModal
                question={mockQuestion}
                progress={mockProgress}
                {...mockHandlers}
            />
        );

        const closeBtn = screen.getByLabelText('Fechar modal');
        expect(document.activeElement).toBe(closeBtn);
    });

    it('closes on escape key', () => {
        render(
            <CompletedQuestionModal
                question={mockQuestion}
                progress={mockProgress}
                {...mockHandlers}
            />
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(mockHandlers.onClose).toHaveBeenCalled();
    });
});
