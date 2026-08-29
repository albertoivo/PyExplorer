import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePWA } from '../usePWA';

describe('usePWA', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // Deprecated
                removeListener: vi.fn(), // Deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('detects PWA installation eligibility', async () => {
        const { result } = renderHook(() => usePWA());

        expect(result.current.canInstall).toBe(false);

        // Fire beforeinstallprompt
        const e = new Event('beforeinstallprompt');
        act(() => {
            window.dispatchEvent(e);
        });

        expect(result.current.canInstall).toBe(true);
    });

    it('installs PWA when requested', async () => {
        const { result } = renderHook(() => usePWA());

        // Prepare event
        const e = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
        e.prompt = vi.fn();
        e.userChoice = Promise.resolve({ outcome: 'accepted' });

        act(() => {
            window.dispatchEvent(e);
        });

        let installed;
        await act(async () => {
            installed = await result.current.installPWA();
        });

        expect(e.prompt).toHaveBeenCalled();
        expect(installed).toBe(true);
        expect(result.current.canInstall).toBe(false); // Should reset
    });

    it('detects service worker updates', async () => {
        let updateCallback: (() => void) | null = null;
        let stateChangeCallback: (() => void) | null = null;

        const mockRegistration = {
            addEventListener: vi.fn((event, cb) => {
                if (event === 'updatefound') updateCallback = cb;
            }),
            installing: {
                state: 'installing',
                addEventListener: vi.fn((event, cb) => {
                    if (event === 'statechange') stateChangeCallback = cb;
                })
            },
            waiting: {
                postMessage: vi.fn()
            }
        };

        // Redefine for this test to bind callbacks
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                ready: Promise.resolve(mockRegistration),
                controller: {},
                register: vi.fn(),
            },
            writable: true
        });

        const { result } = renderHook(() => usePWA());

        // Wait for ready promise
        await waitFor(() => expect(updateCallback).not.toBeNull());

        // Trigger updatefound
        act(() => {
            updateCallback!();
        });

        // Trigger statechange to 'installed'
        if (mockRegistration.installing) {
            mockRegistration.installing.state = 'installed';
        }
        act(() => {
            if (stateChangeCallback) stateChangeCallback();
        });

        expect(result.current.updateAvailable).toBe(true);

        // Apply update
        // We can't easily mock window.location.reload in latest jsdom/vitest without causing navigation errors or read-only/unconfigurable issues sometimes
        // But let's try
        const originalReload = window.location.reload;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn() },
        });

        act(() => {
            result.current.applyUpdate();
        });

        expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
        expect(window.location.reload).toHaveBeenCalled();

        // Restore reload
        window.location.reload = originalReload;
    });
});
