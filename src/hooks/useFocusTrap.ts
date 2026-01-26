import { useEffect, RefObject } from 'react';

/**
 * Hook to trap focus inside a modal and handle Escape key.
 * @param ref Reference to the modal container
 * @param isActive Whether the modal is open/active
 * @param onEscape Callback for Escape key
 * @param initialFocusRef Optional reference to element to focus on mount. If not provided, will try to focus the container.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isActive: boolean,
  onEscape?: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!isActive) return;

    const previousElement = document.activeElement as HTMLElement;

    // Initial focus
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (ref.current) {
      ref.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab (Focus Trap)
      if (e.key === 'Tab' && ref.current) {
        const focusableElements = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (e.shiftKey) {
          // Shift + Tab
          // If focus is on first element OR the container itself (initial state), wrap to last
          if (activeElement === firstElement || activeElement === ref.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
          // If focus is on container, ensure we go to first element
          else if (activeElement === ref.current) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousElement && document.body.contains(previousElement)) {
        previousElement.focus();
      }
    };
  }, [isActive, onEscape, ref, initialFocusRef]);
}
