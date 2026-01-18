import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';
import type { QuestionDocument } from '../../../types/question';

describe('QuestionCard', () => {
    const mockQuestion: QuestionDocument = {
        id: 'test_q1',
        title: 'Variáveis Simples',
        prompt: 'Qual é o valor de x?',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        options: ['1', '2'],
        answerIndex: 0,
        ageMin: 8,
        explanationKidFriendly: 'Explicação',
    };

    const mockOnClick = vi.fn();

    const defaultProps = {
        question: mockQuestion,
        index: 0,
        status: 'not_started' as const,
        stars: 0 as 0 | 1 | 2 | 3,
        locked: false,
        onClick: mockOnClick,
    };

    beforeEach(() => {
        mockOnClick.mockClear();
    });

    it('renders accessible button with comprehensive aria-label', () => {
        render(<QuestionCard {...defaultProps} />);

        const button = screen.getByRole('button');

        // Check for key parts of the accessible label
        const label = button.getAttribute('aria-label');
        expect(label).toContain('Questão 1');
        expect(label).toContain('Variáveis Simples');
        expect(label).toContain('Não iniciado');
        expect(label).toContain('0 de 3 estrelas');
        expect(label).toContain('Tipo: Escolha');
    });

    it('hides decorative elements from screen readers', () => {
        render(<QuestionCard {...defaultProps} />);

        // The type icon '🎯' is inside a span with aria-hidden="true"
        const typeIcon = screen.getByText('🎯');
        expect(typeIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('calls onClick when clicked and not locked', () => {
        render(<QuestionCard {...defaultProps} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnClick).toHaveBeenCalledWith(mockQuestion);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when locked', () => {
        render(<QuestionCard {...defaultProps} locked={true} />);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(mockOnClick).not.toHaveBeenCalled();
    });
});
