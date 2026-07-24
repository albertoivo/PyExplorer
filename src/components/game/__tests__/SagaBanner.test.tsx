import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SagaBanner } from '../SagaBanner';
import { SAGAS } from '../../../data/worlds';

describe('SagaBanner Component', () => {
    const mockSaga = SAGAS[0];

    it('renders saga information correctly', () => {
        render(
            <SagaBanner
                saga={mockSaga}
                completedQuestions={3}
                totalQuestions={10}
                percentage={30}
            />
        );

        expect(screen.getByText(mockSaga.title)).toBeInTheDocument();
        expect(screen.getByText(mockSaga.description)).toBeInTheDocument();
        expect(screen.getByText(mockSaga.badge)).toBeInTheDocument();
        expect(screen.getByText(/3\/10 Questões \(30%\)/)).toBeInTheDocument();
    });

    it('hides progress chip if totalQuestions is zero', () => {
        render(
            <SagaBanner
                saga={mockSaga}
                completedQuestions={0}
                totalQuestions={0}
                percentage={0}
            />
        );

        expect(screen.queryByText(/Questões/)).not.toBeInTheDocument();
    });
});
