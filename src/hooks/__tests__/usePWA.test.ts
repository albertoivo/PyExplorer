import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePWA } from '../usePWA';

describe('usePWA', () => {
    let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = [];

    beforeEach(() => {
        vi.clearAllMocks();
        mediaQueryListeners = [];

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(cb => mediaQueryListeners.push(cb)),
                removeListener: vi.fn(),
                addEventListener: vi.fn((event, cb) => {
                    if (event === 'change') mediaQueryListeners.push(cb);
                }),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        // Default navigator.serviceWorker mock
        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                ready: Promise.resolve({
                    addEventListener: vi.fn(),
                    installing: null,
                    waiting: null,
                }),
                controller: {},
                register: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with isPWA false by default', () => {
        const { result } = renderHook(() => usePWA());
        expect(result.current.isPWA).toBe(false);
        expect(result.current.canInstall).toBe(false);
        expect(result.current.updateAvailable).toBe(false);
    });

    it('initializes with isPWA true when matchMedia matches standalone', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: true,
                media: query,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        });

        const { result } = renderHook(() => usePWA());
        expect(result.current.isPWA).toBe(true);
    });

    it('initializes with isPWA true when iOS standalone is true', () => {
        Object.defineProperty(navigator, 'standalone', {
            value: true,
            configurable: true,
        });

        const { result } = renderHook(() => usePWA());
        expect(result.current.isPWA).toBe(true);

        delete (navigator as unknown as { standalone?: boolean }).standalone;
    });

    it('updates isPWA when media query change event fires', () => {
        const { result } = renderHook(() => usePWA());
        expect(result.current.isPWA).toBe(false);

        act(() => {
            mediaQueryListeners.forEach(listener =>
                listener({ matches: true } as MediaQueryListEvent)
            );
        });

        expect(result.current.isPWA).toBe(true);
    });

    it('detects PWA installation eligibility via beforeinstallprompt', () => {
        const { result } = renderHook(() => usePWA());
        expect(result.current.canInstall).toBe(false);

        const e = new Event('beforeinstallprompt');
        act(() => {
            window.dispatchEvent(e);
        });

        expect(result.current.canInstall).toBe(true);
    });

    it('handles appinstalled event', () => {
        const { result } = renderHook(() => usePWA());

        // First fire beforeinstallprompt
        act(() => {
            window.dispatchEvent(new Event('beforeinstallprompt'));
        });
        expect(result.current.canInstall).toBe(true);

        // Then fire appinstalled
        act(() => {
            window.dispatchEvent(new Event('appinstalled'));
        });

        expect(result.current.canInstall).toBe(false);
        expect(result.current.isPWA).toBe(true);
    });

    it('installs PWA when requested', async () => {
        const { result } = renderHook(() => usePWA());

        const e = new Event('beforeinstallprompt') as Event & {
            prompt: () => Promise<void>;
            userChoice: Promise<{ outcome: string }>;
        };
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
        expect(result.current.canInstall).toBe(false);
    });

    it('returns false when installPWA is called without deferredPrompt', async () => {
        const { result } = renderHook(() => usePWA());

        let installed;
        await act(async () => {
            installed = await result.current.installPWA();
        });

        expect(installed).toBe(false);
    });

    it('detects pre-existing waiting service worker on mount', async () => {
        const mockRegistration = {
            addEventListener: vi.fn(),
            installing: null,
            waiting: { postMessage: vi.fn() },
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                ready: Promise.resolve(mockRegistration),
                controller: {},
                register: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
        });

        const { result } = renderHook(() => usePWA());

        await waitFor(() => {
            expect(result.current.updateAvailable).toBe(true);
        });
    });

    it('detects pre-existing installing service worker that finishes installation', async () => {
        let stateChangeCallback: (() => void) | null = null;
        const mockInstalling = {
            state: 'installing',
            addEventListener: vi.fn((event, cb) => {
                if (event === 'statechange') stateChangeCallback = cb;
            }),
        };

        const mockRegistration = {
            addEventListener: vi.fn(),
            installing: mockInstalling,
            waiting: null,
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                ready: Promise.resolve(mockRegistration),
                controller: {},
                register: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
        });

        const { result } = renderHook(() => usePWA());

        await waitFor(() => expect(stateChangeCallback).not.toBeNull());

        act(() => {
            mockInstalling.state = 'installed';
            if (stateChangeCallback) stateChangeCallback();
        });

        expect(result.current.updateAvailable).toBe(true);
    });

    it('detects service worker updates via updatefound', async () => {
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
                }),
            },
            waiting: {
                postMessage: vi.fn(),
            },
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                ready: Promise.resolve(mockRegistration),
                controller: {},
                register: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
        });

        const { result } = renderHook(() => usePWA());

        await waitFor(() => expect(updateCallback).not.toBeNull());

        act(() => {
            updateCallback!();
        });

        if (mockRegistration.installing) {
            mockRegistration.installing.state = 'installed';
        }
        act(() => {
            if (stateChangeCallback) stateChangeCallback();
        });

        expect(result.current.updateAvailable).toBe(true);
    });

    it('applies update and triggers reload on controllerchange', async () => {
        let controllerChangeHandler: (() => void) | null = null;
        const mockRegistration = {
            addEventListener: vi.fn(),
            installing: null,
            waiting: {
                postMessage: vi.fn(),
            },
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                ready: Promise.resolve(mockRegistration),
                controller: {},
                register: vi.fn(),
                addEventListener: vi.fn((event, handler) => {
                    if (event === 'controllerchange') {
                        controllerChangeHandler = handler;
                    }
                }),
                removeEventListener: vi.fn(),
            },
        });

        const originalReload = window.location.reload;
        const mockReload = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: mockReload },
        });

        const { result } = renderHook(() => usePWA());

        await waitFor(() => expect(result.current.updateAvailable).toBe(true));

        act(() => {
            result.current.applyUpdate();
        });

        expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

        act(() => {
            if (controllerChangeHandler) (controllerChangeHandler as () => void)();
        });

        expect(mockReload).toHaveBeenCalledTimes(1);

        window.location.reload = originalReload;
    });

    it('applies update with fallback timeout if controllerchange does not fire', async () => {
        vi.useFakeTimers();

        const mockRegistration = {
            addEventListener: vi.fn(),
            installing: null,
            waiting: {
                postMessage: vi.fn(),
            },
        };

        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            value: {
                ready: Promise.resolve(mockRegistration),
                controller: {},
                register: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            },
        });

        const originalReload = window.location.reload;
        const mockReload = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: mockReload },
        });

        const { result } = renderHook(() => usePWA());

        // Resolve ready promise
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.updateAvailable).toBe(true);

        act(() => {
            result.current.applyUpdate();
        });

        expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
        expect(mockReload).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(mockReload).toHaveBeenCalledTimes(1);

        window.location.reload = originalReload;
    });
});
