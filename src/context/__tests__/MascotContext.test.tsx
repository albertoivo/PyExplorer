import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MascotProvider, useMascotContext } from '../MascotContext';
import React from 'react';

// Mock utils
vi.mock('../../utils/mascotMessages', () => ({
    getRandomMessage: vi.fn((type: string) => `Mock message for ${type}`),
}));

describe('MascotContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MascotProvider>{children}</MascotProvider>
    );

    it('should throw error when used outside provider', () => {
        // Suppress console.error for the expected error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useMascotContext());
        }).toThrow('useMascotContext deve ser usado dentro de MascotProvider');

        consoleSpy.mockRestore();
    });

    it('should provide initial state', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        expect(result.current.mood).toBe('idle');
        expect(result.current.message).toBeUndefined();
        expect(result.current.visible).toBe(true);
    });

    it('should update mood and message', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.setMood('happy', 'Hello!');
        });

        expect(result.current.mood).toBe('happy');
        expect(result.current.message).toBe('Hello!');
    });

    it('should show specific message', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.showMessage('Custom msg', 'excited');
        });

        expect(result.current.message).toBe('Custom msg');
        expect(result.current.mood).toBe('excited');
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

        act(() => {
            result.current.react(true);
        });

        expect(['happy', 'excited']).toContain(result.current.mood);
        expect(result.current.message).toBe('Mock message for correct');
        expect(result.current.visible).toBe(true);
    });

    it('should react to incorrect answer', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.react(false);
        });

        expect(['encouraging', 'confused']).toContain(result.current.mood);
        expect(result.current.message).toBe('Mock message for incorrect');
        expect(result.current.visible).toBe(true);
    });

    it('should celebrate', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.celebrate('Yay!');
        });

        expect(result.current.mood).toBe('celebrating');
        expect(result.current.message).toBe('Yay!');
    });

    it('should celebrate with random message if none provided', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.celebrate();
        });

        expect(result.current.mood).toBe('celebrating');
        expect(result.current.message).toBe('Mock message for celebrate');
    });

    it('should reset state', () => {
        const { result } = renderHook(() => useMascotContext(), { wrapper });

        act(() => {
            result.current.setMood('sad', 'Error');
            result.current.reset();
        });

        expect(result.current.mood).toBe('idle');
        expect(result.current.message).toBeUndefined();
        expect(result.current.visible).toBe(true);
    });
});
