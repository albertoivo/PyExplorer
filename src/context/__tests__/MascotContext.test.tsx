import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MascotProvider, useMascotContext } from '../MascotContext';
import type { ReactNode } from 'react';

// Wrapper component to provide the context
const wrapper = ({ children }: { children: ReactNode }) => (
    <MascotProvider>{children}</MascotProvider>
);

describe('MascotContext', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        expect(result.current.mood).toBe('idle');
        expect(result.current.message).toBeUndefined();
        expect(result.current.visible).toBe(true);
    });

    it('should update mood and message correctly using setMood', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.setMood('happy', 'Test Message');
        });

        expect(result.current.mood).toBe('happy');
        expect(result.current.message).toBe('Test Message');
    });

    it('should show specific message using showMessage', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.showMessage('Hello World', 'excited');
        });

        expect(result.current.message).toBe('Hello World');
        expect(result.current.mood).toBe('excited');
    });

    it('should default to idle mood in showMessage if not provided', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        // First set to something else
        act(() => {
            result.current.setMood('happy');
        });

        act(() => {
            result.current.showMessage('Just a message');
        });

        expect(result.current.message).toBe('Just a message');
        expect(result.current.mood).toBe('idle');
    });

    it('should toggle visibility', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.hide();
        });
        expect(result.current.visible).toBe(false);

        act(() => {
            result.current.show();
        });
        expect(result.current.visible).toBe(true);
    });

    it('should react to correct answer', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        // Force a mock for Math.random if needed, but the implementation uses it for mood choice.
        // We just check if it's one of the expected moods.

        act(() => {
            result.current.react(true);
        });

        expect(result.current.visible).toBe(true);
        expect(['happy', 'excited']).toContain(result.current.mood);
        expect(result.current.message).toBeDefined();
    });

    it('should react to incorrect answer', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.react(false);
        });

        expect(result.current.visible).toBe(true);
        expect(['encouraging', 'confused']).toContain(result.current.mood);
        expect(result.current.message).toBeDefined();
    });

    it('should celebrate', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.celebrate('Custom Celebrate!');
        });

        expect(result.current.mood).toBe('celebrating');
        expect(result.current.message).toBe('Custom Celebrate!');
        expect(result.current.visible).toBe(true);
    });

    it('should celebrate with default message if none provided', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.celebrate();
        });

        expect(result.current.mood).toBe('celebrating');
        expect(result.current.message).toBeDefined();
    });

    it('should reset state', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.setMood('confused', 'Bad day');
            result.current.hide();
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current.mood).toBe('idle');
        expect(result.current.message).toBeUndefined();
        expect(result.current.visible).toBe(true);
    });

    it('should throw error if used outside provider', () => {
        // Suppress console.error for this test as React logs the error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useMascotContext());
        }).toThrow('useMascotContext deve ser usado dentro de MascotProvider');

        consoleSpy.mockRestore();
    });
});
