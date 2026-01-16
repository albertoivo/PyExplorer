import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Mascot from '../Mascot';
import { MOOD_CONFIGS } from '../../../utils/mascotConfig';

describe('Mascot Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render visible by default', () => {
        render(<Mascot />);
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Pythoninho')).toBeInTheDocument();
    });

    it('should not render when visible=false', () => {
        render(<Mascot visible={false} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should show message passed via props', () => {
        render(<Mascot message="Hello!" />);
        expect(screen.getByText('Hello!')).toBeInTheDocument();
    });

    it('should hide message after 5 seconds', () => {
        render(<Mascot message="Hello!" />);
        expect(screen.getByText('Hello!')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('Hello!')).not.toBeInTheDocument();
    });

    it('should handle autoHide', () => {
        render(<Mascot autoHide={3} />);
        expect(screen.getByRole('button')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Mascot onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalled();
    });

    it('should show random message when clicked and no onClick provided', () => {
        render(<Mascot />);

        // Ensure no message initially (searching for class mascot__message which is p tag)
        // Or text search.
        // The default config might trigger a message? No, message prop is undefined.
        // But useEffect:
        /*
        useEffect(() => {
            if (message) { ... } else { setCurrentMessage(config.defaultMessage); }
        }, ...);
        */
        // If config.defaultMessage exists, it sets it but doesn't set isMessageVisible=true explicitly?
        // Ah: setIsMessageVisible(true) is only in `if (message)` block.
        // So initially hidden.

        // Check explicit query for message element
        const messageEl = screen.queryByText((content, element) => {
            return element?.classList.contains('mascot__message') ?? false;
        });
        expect(messageEl).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button'));

        // Should show some message
        const messageElAfter = screen.getByText((content, element) => {
            return element?.classList.contains('mascot__message') ?? false;
        });
        expect(messageElAfter).toBeInTheDocument();
    });

    it('should change appearance based on mood', () => {
        render(<Mascot mood="happy" />);
        // MOOD_CONFIGS['happy'].face should be present
        const happyFace = MOOD_CONFIGS['happy'].face;
        expect(screen.getByText(happyFace)).toBeInTheDocument();
    });
});
