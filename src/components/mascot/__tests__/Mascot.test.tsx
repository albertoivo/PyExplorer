import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Mascot } from '../Mascot';
import { MOOD_CONFIGS } from '../../../utils/mascotConfig';

// Mock timer functions
vi.useFakeTimers();

describe('Mascot Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with default props', () => {
        render(<Mascot />);

        expect(screen.getByText('Pythoninho')).toBeInTheDocument();
        const mascotButton = screen.getByRole('button');
        expect(mascotButton).toHaveAttribute('type', 'button');
        expect(mascotButton).toHaveClass('mascot--medium', 'mascot--bottom-right');
    });

    it('renders with specified mood', () => {
        const mood = 'happy';
        const config = MOOD_CONFIGS[mood];

        render(<Mascot mood={mood} />);

        const mascotButton = screen.getByRole('button');
        expect(mascotButton).toHaveAttribute('aria-label', expect.stringContaining(mood));
        expect(screen.getByText(config.face)).toBeInTheDocument();
    });

    it('displays provided message', () => {
        const message = 'Hello World';
        render(<Mascot message={message} />);

        expect(screen.getByText(message)).toBeInTheDocument();
        const mascotButton = screen.getByRole('button');
        expect(mascotButton).toHaveAttribute('aria-label', expect.stringContaining(message));
    });

    it('hides message after timeout (default behavior)', () => {
        render(<Mascot message="Temporary Message" />);

        expect(screen.getByText('Temporary Message')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('Temporary Message')).not.toBeInTheDocument();
    });

    it('executes onClick callback when clicked', () => {
        const handleClick = vi.fn();
        render(<Mascot onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows random message on click if no onClick prop provided', () => {
        render(<Mascot />);

        // Initial state: default message (might be visible or not depending on implementation,
        // but explicit message prop is undefined)

        fireEvent.click(screen.getByRole('button'));

        // Should show a message bubble
        const bubble = screen.getByRole('button').querySelector('.mascot__bubble');
        expect(bubble).toBeInTheDocument();
        expect(bubble).not.toBeEmptyDOMElement();
    });

    it('respects visibility prop', () => {
        const { rerender } = render(<Mascot visible={false} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        rerender(<Mascot visible={true} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('auto-hides after specified duration', () => {
        render(<Mascot autoHide={3} />);

        expect(screen.getByRole('button')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('applies correct CSS classes for size and position', () => {
        render(<Mascot size="large" position="center" />);

        const mascotButton = screen.getByRole('button');
        expect(mascotButton).toHaveClass('mascot--large', 'mascot--center');
    });

    it('renders decorative tail', () => {
        render(<Mascot />);
        // Use class selector for SVG container since it's decorative
        const tail = document.querySelector('.mascot__tail');
        expect(tail).toBeInTheDocument();
    });
});
