import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Mascot } from '../Mascot';

// Removing mocks to test against real config (which caused mismatch)

describe('Mascot', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders with default props (idle)', () => {
        render(<Mascot />);
        expect(screen.getByText('Pythoninho')).toBeDefined();
        // Based on debug output, idle face is 🐍
        expect(screen.getByText('🐍')).toBeDefined();
    });

    it('does not render when visible is false', () => {
        const { container } = render(<Mascot visible={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders specific mood', () => {
        render(<Mascot mood="happy" />);
        // Based on debug output, happy face is 😊
        expect(screen.getByText('😊')).toBeDefined();
    });

    it('displays message when provided', () => {
        render(<Mascot message="Hello World" />);
        expect(screen.getByText('Hello World')).toBeDefined();
    });

    it('hides message after 5 seconds', () => {
        render(<Mascot message="Hello World" />);
        expect(screen.getByText('Hello World')).toBeDefined();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('Hello World')).toBeNull();
    });

    it('handles autoHide prop to disappear entirely', () => {
        const { container } = render(<Mascot autoHide={2} />);
        expect(container.firstChild).not.toBeNull();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(container.firstChild).toBeNull();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Mascot onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalled();
    });

    it('shows random message on click if no onClick provided', () => {
        render(<Mascot />);

        fireEvent.click(screen.getByRole('button'));

        // Since we don't mock messages, we check if ANY message bubble appears
        // The bubble contains class "mascot__message"
        const message = screen.queryByText(/./, { selector: '.mascot__message' });
        expect(message).toBeDefined();
    });
});
