import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultPanel from '../ResultPanel';

describe('ResultPanel Component', () => {
    const defaultProps = {
        success: true,
        message: 'Great job!',
        onNext: vi.fn(),
        onRetry: vi.fn(),
    };

    it('renders success state correctly', () => {
        render(<ResultPanel {...defaultProps} success={true} points={10} title="Victory!" />);

        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('result-panel--success');
        expect(screen.getByText('Victory!')).toBeInTheDocument();
        expect(screen.getByText('Great job!')).toBeInTheDocument();
        expect(screen.getByText('+10 pontos')).toBeInTheDocument();
        expect(screen.getByText('🎉')).toBeInTheDocument();

        // Next button should be present
        expect(screen.getByRole('button', { name: /próxima questão/i })).toBeInTheDocument();

        // Retry button should NOT be present in success state
        expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();
    });

    it('renders error state correctly', () => {
        render(<ResultPanel {...defaultProps} success={false} message="Try again" />);

        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('result-panel--error');
        expect(screen.getByText('Quase lá!')).toBeInTheDocument(); // Default title
        expect(screen.getByText('Try again')).toBeInTheDocument();
        expect(screen.getByText('💪')).toBeInTheDocument();

        // Retry button should be present
        expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();

        // Next button (Skip) should be present if onNext is provided
        expect(screen.getByRole('button', { name: /pular questão/i })).toBeInTheDocument();

        // Points should not be shown
        expect(screen.queryByText(/pontos/i)).not.toBeInTheDocument();
    });

    it('handles interactions correctly', () => {
        render(<ResultPanel {...defaultProps} success={false} />);

        // Click Retry
        fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
        expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);

        // Click Skip (Next)
        fireEvent.click(screen.getByRole('button', { name: /pular questão/i }));
        expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('toggles explanation visibility', () => {
        const explanation = "This is a detailed explanation.";
        render(<ResultPanel {...defaultProps} explanation={explanation} showExplanation={true} />);

        // Initially explanation should not be visible, but toggle button should be
        const toggleBtn = screen.getByRole('button', { name: /ver explicação/i });
        expect(toggleBtn).toBeInTheDocument();
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText(explanation)).not.toBeInTheDocument();

        // Click toggle to show
        fireEvent.click(toggleBtn);
        expect(screen.getByText(explanation)).toBeInTheDocument();
        expect(toggleBtn).toHaveTextContent(/ocultar explicação/i);
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

        // Click toggle to hide
        fireEvent.click(toggleBtn);
        expect(screen.queryByText(explanation)).not.toBeInTheDocument();
        expect(toggleBtn).toHaveTextContent(/ver explicação/i);
    });

    it('does not render explanation button if showExplanation is false', () => {
        render(<ResultPanel {...defaultProps} explanation="Secret" showExplanation={false} />);
        expect(screen.queryByRole('button', { name: /ver explicação/i })).not.toBeInTheDocument();
    });

    it('manages focus on mount for accessibility', () => {
        render(<ResultPanel {...defaultProps} />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveFocus();
    });

    it('renders confetti on success', () => {
        const { container } = render(<ResultPanel {...defaultProps} success={true} />);
        expect(container.querySelector('.result-panel__confetti')).toBeInTheDocument();
    });

    it('does not render confetti on error', () => {
        const { container } = render(<ResultPanel {...defaultProps} success={false} />);
        expect(container.querySelector('.result-panel__confetti')).not.toBeInTheDocument();
    });
});
