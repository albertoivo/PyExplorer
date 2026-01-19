import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultipleChoiceQuestion } from '../MultipleChoiceQuestion';
import type { QuestionDocument } from '../../../../types/question';

const mockQuestion: QuestionDocument = {
    id: 'q1',
    type: 'multiple_choice',
    title: 'Test Question',
    prompt: 'What is 2+2?',
    difficulty: 'easy',
    options: ['3', '4', '5', '6'],
    answerIndex: 1, // '4'
    tags: []
};

describe('MultipleChoiceQuestion', () => {
    const mockOnAnswer = vi.fn();

    it('renders question details and options', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        expect(screen.getByText('Test Question')).toBeDefined();
        expect(screen.getByText('What is 2+2?')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
        expect(screen.getByText('4')).toBeDefined();
        expect(screen.getByText('5')).toBeDefined();
        expect(screen.getByText('6')).toBeDefined();
    });

    it('allows selecting an option', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        const optionA = screen.getByText('3').closest('button');
        fireEvent.click(optionA!);

        expect(optionA?.className).toContain('question-option--selected');
    });

    it('enables submit button only after selection', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        const submitBtn = screen.getByText(/Verificar Resposta/);
        expect(submitBtn).toHaveProperty('disabled', true);

        const optionB = screen.getByText('4').closest('button');
        fireEvent.click(optionB!);

        expect(submitBtn).toHaveProperty('disabled', false);
    });

    it('submits correct answer', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        // Select correct answer (Index 1: '4')
        const optionB = screen.getByText('4').closest('button');
        fireEvent.click(optionB!);

        const submitBtn = screen.getByText(/Verificar Resposta/);
        fireEvent.click(submitBtn);

        // onAnswer(isCorrect, index)
        expect(mockOnAnswer).toHaveBeenCalledWith(true, 1);
    });

    it('submits incorrect answer', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        // Select incorrect answer (Index 0: '3')
        const optionA = screen.getByText('3').closest('button');
        fireEvent.click(optionA!);

        const submitBtn = screen.getByText(/Verificar Resposta/);
        fireEvent.click(submitBtn);

        expect(mockOnAnswer).toHaveBeenCalledWith(false, 0);
    });

    it('shows results correctly (Correct Answer)', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                showResult={true}
                selectedAnswer={1} // Correct
            />
        );

        const optionB = screen.getByText('4').closest('button');
        expect(optionB?.className).toContain('question-option--correct');
        expect(screen.getByText('✓')).toBeDefined();
    });

    it('shows results correctly (Incorrect Answer)', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                showResult={true}
                selectedAnswer={0} // Incorrect (Index 1 is correct)
            />
        );

        const optionA = screen.getByText('3').closest('button');
        expect(optionA?.className).toContain('question-option--incorrect');
        expect(screen.getByText('✗')).toBeDefined();

        const optionB = screen.getByText('4').closest('button');
        expect(optionB?.className).toContain('question-option--correct');
        expect(screen.getByText('✓')).toBeDefined();
    });

    it('does not allow selection when disabled', () => {
        render(
            <MultipleChoiceQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                disabled={true}
            />
        );

        const optionA = screen.getByText('3').closest('button');
        fireEvent.click(optionA!);

        expect(optionA?.className).not.toContain('question-option--selected');
    });
});
