import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrueFalseQuestion } from '../TrueFalseQuestion';
import type { QuestionDocument } from '../../../../types/question';

const mockQuestion: QuestionDocument = {
    id: 'tf1',
    type: 'true_false',
    title: 'Python is fun',
    prompt: 'Python is a programming language.',
    difficulty: 'easy',
    correctBool: true,
    tags: []
};

describe('TrueFalseQuestion', () => {
    const mockOnAnswer = vi.fn();

    it('renders question details', () => {
        render(
            <TrueFalseQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        expect(screen.getByText('Python is fun')).toBeDefined();
        expect(screen.getByText('Python is a programming language.')).toBeDefined();
        expect(screen.getByText('Verdadeiro')).toBeDefined();
        expect(screen.getByText('Falso')).toBeDefined();
    });

    it('renders starter code if provided', () => {
        const codeQuestion = { ...mockQuestion, starterCode: 'print("Hello")' };
        render(
            <TrueFalseQuestion
                question={codeQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        expect(screen.getByText('print("Hello")')).toBeDefined();
    });

    it('allows selecting an option', () => {
        render(
            <TrueFalseQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        const trueBtn = screen.getByText('Verdadeiro').closest('button');
        fireEvent.click(trueBtn!);

        expect(trueBtn?.className).toContain('tf-option--selected');
    });

    it('submits correct answer (True)', () => {
        render(
            <TrueFalseQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        fireEvent.click(screen.getByText('Verdadeiro').closest('button')!);
        fireEvent.click(screen.getByText(/Verificar Resposta/));

        expect(mockOnAnswer).toHaveBeenCalledWith(true, true);
    });

    it('submits incorrect answer (False)', () => {
        render(
            <TrueFalseQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
            />
        );

        fireEvent.click(screen.getByText('Falso').closest('button')!);
        fireEvent.click(screen.getByText(/Verificar Resposta/));

        expect(mockOnAnswer).toHaveBeenCalledWith(false, false);
    });

    it('shows results correctly', () => {
        render(
            <TrueFalseQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                showResult={true}
                selectedAnswer={false} // Selected False (Incorrect)
            />
        );

        const trueBtn = screen.getByText('Verdadeiro').closest('button');
        const falseBtn = screen.getByText('Falso').closest('button');

        expect(trueBtn?.className).toContain('tf-option--correct');
        expect(falseBtn?.className).toContain('tf-option--incorrect');
    });

    it('disables interaction when disabled', () => {
        render(
            <TrueFalseQuestion
                question={mockQuestion}
                onAnswer={mockOnAnswer}
                disabled={true}
            />
        );

        const trueBtn = screen.getByText('Verdadeiro').closest('button');
        fireEvent.click(trueBtn!);

        expect(trueBtn?.className).not.toContain('tf-option--selected');
    });
});
