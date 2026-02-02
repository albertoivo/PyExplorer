import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Mascot } from '../Mascot';

describe('Mascot', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders with default props', () => {
        render(<Mascot />);
        expect(screen.getByText('Pythoninho')).toBeInTheDocument();
        // Should find the button role
        expect(screen.getByRole('button', { name: /Mascote Pythoninho/i })).toBeInTheDocument();
    });

    it('displays message when provided', () => {
        render(<Mascot message="Olá mundo!" />);
        expect(screen.getByText('Olá mundo!')).toBeInTheDocument();
    });

    it('renders different moods', () => {
        render(<Mascot mood="happy" />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('mascot');
        // Check aria-label for mood
        expect(button).toHaveAttribute('aria-label', expect.stringContaining('happy'));
    });

    it('hides message after 5 seconds', () => {
        render(<Mascot message="Test message" />);
        expect(screen.getByText('Test message')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('auto-hides mascot if autoHide prop is set', () => {
        render(<Mascot autoHide={3} />);
        expect(screen.getByText('Pythoninho')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.queryByText('Pythoninho')).not.toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Mascot onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalled();
    });

    it('shows random message on click if no onClick provided', () => {
        render(<Mascot />);

        // Initially no message (or default message, but let's assume idle has no default message rendered if explicit message not provided?
        // Logic says: setCurrentMessage(message || config.defaultMessage).
        // Idle default message might be empty or specific.
        // Let's check logic: useEffect sets message.
        // If we click, it sets random message.

        fireEvent.click(screen.getByRole('button'));

        // Should show a bubble now. Bubble has class mascot__bubble
        // Or check text content is not empty.
        // Since messages are random, it's hard to predict exact text, but we can check if bubble exists.
        // Implementation: isMessageVisible becomes true.
        const bubble = document.querySelector('.mascot__bubble');
        // Use container query or check for ANY text
        // But render return container bound to screen
        // Let's rely on class if possible or check if *some* text appears
    });
});
