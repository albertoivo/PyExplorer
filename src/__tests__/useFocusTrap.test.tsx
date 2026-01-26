import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let triggerButton: HTMLButtonElement;
  let firstBtn: HTMLButtonElement;
  let lastBtn: HTMLButtonElement;
  let modalRef: { current: HTMLDivElement | null };

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '';

    triggerButton = document.createElement('button');
    triggerButton.id = 'trigger';
    document.body.appendChild(triggerButton);

    container = document.createElement('div');
    container.id = 'modal';
    container.tabIndex = -1;

    firstBtn = document.createElement('button');
    firstBtn.id = 'first';
    lastBtn = document.createElement('button');
    lastBtn.id = 'last';

    container.appendChild(firstBtn);
    container.appendChild(lastBtn);
    document.body.appendChild(container);

    modalRef = { current: container };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets initial focus to container', () => {
    triggerButton.focus();
    renderHook(() => useFocusTrap(modalRef, true));
    expect(document.activeElement).toBe(container);
  });

  it('traps focus correctly', () => {
    triggerButton.focus();
    renderHook(() => useFocusTrap(modalRef, true));

    // Focus is on container now.
    // Tab -> First
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(firstBtn);

    // Tab from Last -> First
    lastBtn.focus();
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(firstBtn);

    // Shift+Tab from First -> Last
    firstBtn.focus();
    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    document.dispatchEvent(shiftTabEvent);
    expect(document.activeElement).toBe(lastBtn);

    // Shift+Tab from Container -> Last (Focus Leak Fix)
    container.focus();
    document.dispatchEvent(shiftTabEvent);
    expect(document.activeElement).toBe(lastBtn);
  });

  it('restores focus on unmount', () => {
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    const { unmount } = renderHook(() => useFocusTrap(modalRef, true));

    // Focus moved to container
    expect(document.activeElement).toBe(container);

    unmount();

    // Focus restored
    expect(document.activeElement).toBe(triggerButton);
  });

  it('restores focus when isActive becomes false', () => {
    triggerButton.focus();

    const { rerender } = renderHook(
      ({ active }) => useFocusTrap(modalRef, active),
      { initialProps: { active: true } }
    );

    expect(document.activeElement).toBe(container);

    rerender({ active: false });

    expect(document.activeElement).toBe(triggerButton);
  });

  it('calls onEscape when Escape is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useFocusTrap(modalRef, true, onEscape));

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(onEscape).toHaveBeenCalled();
  });

  it('does nothing when inactive', () => {
    triggerButton.focus();
    renderHook(() => useFocusTrap(modalRef, false));

    // Focus stays on trigger
    expect(document.activeElement).toBe(triggerButton);

    // Escape should not trigger
    const onEscape = vi.fn();
    renderHook(() => useFocusTrap(modalRef, false, onEscape));
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);
    expect(onEscape).not.toHaveBeenCalled();
  });
});
