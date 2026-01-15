import { renderHook, act } from '@testing-library/react';
import { useMascot } from '../useMascot';
import { describe, it, expect } from 'vitest';

describe('useMascot', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useMascot());

        expect(result.current.mood).toBe('idle');
        expect(result.current.message).toBeUndefined();
        expect(result.current.visible).toBe(true);
    });

    it('should update mood and message correctly', () => {
        const { result } = renderHook(() => useMascot());

        act(() => {
            result.current.setMood('happy', 'Test Message');
        });

        expect(result.current.mood).toBe('happy');
        expect(result.current.message).toBe('Test Message');
    });

    it('should show specific message', () => {
        const { result } = renderHook(() => useMascot());

        act(() => {
            result.current.showMessage('Hello World', 'excited');
        });

        expect(result.current.message).toBe('Hello World');
        expect(result.current.mood).toBe('excited');
    });

    it('should show specific message with default mood idle', () => {
        const { result } = renderHook(() => useMascot());

        act(() => {
            result.current.showMessage('Hello World');
        });

        expect(result.current.message).toBe('Hello World');
        expect(result.current.mood).toBe('idle');
    });

    it('should toggle visibility', () => {
        const { result } = renderHook(() => useMascot());

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
        const { result } = renderHook(() => useMascot());

        act(() => {
            result.current.react(true);
        });

        expect(result.current.visible).toBe(true);
        expect(['happy', 'excited']).toContain(result.current.mood);
        expect(result.current.message).toBeDefined();
    });

    it('should react to incorrect answer', () => {
        const { result } = renderHook(() => useMascot());

        act(() => {
            result.current.react(false);
        });

        expect(result.current.visible).toBe(true);
        expect(['encouraging', 'confused']).toContain(result.current.mood);
        expect(result.current.message).toBeDefined();
    });

    it('should celebrate', () => {
        const { result } = renderHook(() => useMascot());

        act(() => {
            result.current.celebrate();
        });

        expect(result.current.mood).toBe('celebrating');
        expect(result.current.message).toContain('PARABÉNS');
        expect(result.current.visible).toBe(true);
    });
});
