/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOffline } from '../useOffline';
import * as questionsService from '../../firebase/questionsService';
import * as firestoreModule from '../../firebase/firestore';
import * as authHook from '../useAuth';

// Mock dependencies
vi.mock('../../firebase/questionsService');
vi.mock('../../firebase/firestore');
vi.mock('../useAuth');

describe('useOffline', () => {
    let localStorageStore: Record<string, string> = {};
    const mockUser = { uid: 'user123' };

    // Robust LocalStorage Mock
    const localStorageMock = {
        getItem: vi.fn((key: string) => localStorageStore[key] || null),
        setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
        clear: vi.fn(() => { localStorageStore = {}; }),
        length: 0,
        key: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorageStore = {};

        // Apply localStorage mock
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            value: true,
            writable: true
        });

        // Mock matchMedia (PWA check)
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        // Mock Auth
        (authHook.useAuth as any).mockReturnValue({
            user: mockUser
        });

        // Mock Service Worker
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                ready: Promise.resolve({
                    addEventListener: vi.fn(),
                    installing: null,
                    waiting: null,
                }),
                controller: {
                    postMessage: vi.fn()
                },
                register: vi.fn(),
            },
            writable: true
        });

        // Ensure fetchAllQuestions returns empty array by default (not undefined)
        (questionsService.fetchAllQuestions as any).mockResolvedValue([]);
    });

    it('initializes with online state', async () => {
        const { result } = renderHook(() => useOffline());
        expect(result.current.isOnline).toBe(true);
        // Wait for async effects to complete
        await waitFor(() => expect(result.current.cachedQuestions).toBeDefined());
    });

    it('updates status when offline/online events fire', async () => {
        const { result } = renderHook(() => useOffline());
        await waitFor(() => expect(result.current.cachedQuestions).toBeDefined());

        act(() => {
            window.dispatchEvent(new Event('offline'));
        });
        expect(result.current.isOnline).toBe(false);

        act(() => {
            window.dispatchEvent(new Event('online'));
        });
        expect(result.current.isOnline).toBe(true);
    });

    it('loads cached questions on mount', async () => {
        const mockQuestions = [{ id: 'q1', type: 'multiple_choice', title: 'Cached' }];
        localStorageStore['pyexplorer_cached_questions'] = JSON.stringify(mockQuestions);

        const { result } = renderHook(() => useOffline());

        await waitFor(() => {
            expect(result.current.cachedQuestions).toHaveLength(1);
        });
        expect(result.current.cachedQuestions[0].id).toBe('q1');
    });

    it('fetches and caches questions if cache is empty', async () => {
        const mockQuestions = [{ id: 'q2', type: 'multiple_choice', title: 'Fetched' }];
        (questionsService.fetchAllQuestions as any).mockResolvedValue(mockQuestions);

        const { result } = renderHook(() => useOffline());

        await waitFor(() => {
            expect(result.current.cachedQuestions).toHaveLength(1);
        });

        expect(questionsService.fetchAllQuestions).toHaveBeenCalled();
        expect(result.current.cachedQuestions[0].id).toBe('q2');
    });

    it('saves offline progress', async () => {
        const { result } = renderHook(() => useOffline());
        await waitFor(() => expect(result.current.cachedQuestions).toBeDefined());

        act(() => {
            result.current.saveOfflineProgress('q1', true, 100);
        });

        expect(result.current.pendingSync).toBe(1);

        // Check localStorage directly via our store check
        const storedStr = localStorageStore['pyexplorer_offline_progress'];
        expect(storedStr).toBeDefined();
        const stored = JSON.parse(storedStr);
        expect(stored).toHaveLength(1);
        expect(stored[0].questionId).toBe('q1');
    });

    // ==========================================
    // SYNC TESTS
    // ==========================================

    it('syncs pending progress when coming online', async () => {
        // Setup pending progress
        const pending = [{ questionId: 'q1', passed: true, score: 100, timestamp: 123 }];
        localStorageStore['pyexplorer_offline_progress'] = JSON.stringify(pending);

        // Start offline
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

        const { result } = renderHook(() => useOffline());

        // Wait for initial load
        await waitFor(() => expect(result.current.pendingSync).toBe(1));

        // Go online
        await act(async () => {
            Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
            window.dispatchEvent(new Event('online'));
        });

        // The effect triggers syncPendingProgress
        await waitFor(() => {
            expect(firestoreModule.updateProgressBatch).toHaveBeenCalledWith('user123', pending);
        });

        // Should clear pending
        await waitFor(() => {
            expect(result.current.pendingSync).toBe(0);
        });
        expect(localStorageStore['pyexplorer_offline_progress']).toBeUndefined();
    });

    it('does NOT sync if user not logged in', async () => {
        (authHook.useAuth as any).mockReturnValue({ user: null });
        const pending = [{ questionId: 'q1', passed: true, score: 100, timestamp: 123 }];
        localStorageStore['pyexplorer_offline_progress'] = JSON.stringify(pending);

        const { result } = renderHook(() => useOffline());
        await waitFor(() => expect(result.current.pendingSync).toBe(1));

        let synced;
        await act(async () => {
            synced = await result.current.syncPendingProgress();
        });

        expect(synced).toBe(false);
        expect(firestoreModule.updateProgressBatch).not.toHaveBeenCalled();
    });

    it('handles sync errors gracefully', async () => {
        const pending = [{ questionId: 'q1', passed: true, score: 100, timestamp: 123 }];
        localStorageStore['pyexplorer_offline_progress'] = JSON.stringify(pending);

        (firestoreModule.updateProgressBatch as any).mockRejectedValue(new Error('Sync failed'));

        const { result } = renderHook(() => useOffline());
        await waitFor(() => expect(result.current.pendingSync).toBe(1));

        let synced;
        await act(async () => {
            synced = await result.current.syncPendingProgress();
        });

        expect(synced).toBe(false);
        // Should still have pending progress
        expect(result.current.pendingSync).toBe(1);
        expect(result.current.isSyncing).toBe(false);
    });

    // ==========================================
    // CACHE TESTS
    // ==========================================

    it('caches questions manually', async () => {
        const { result } = renderHook(() => useOffline());
        await waitFor(() => expect(result.current.cachedQuestions).toBeDefined());

        const questions = [{ id: 'qManual', type: 'true_false' } as any];

        act(() => {
            result.current.cacheQuestions(questions);
        });

        expect(result.current.cachedQuestions).toEqual(questions);
        expect(localStorageStore['pyexplorer_cached_questions']).toBeDefined();
        expect(localStorageStore['pyexplorer_cached_questions']).toContain('qManual');
    });

    it('handles cache load errors', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        // Force getItem failure for this test
        localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('Storage error'); });

        const { result } = renderHook(() => useOffline());

        // Should not crash
        await waitFor(() => expect(result.current.isOnline).toBe(true));

        expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar dados em cache:', expect.any(Error));
    });

    // ==========================================
    // PWA & SERVICE WORKER TESTS
    // ==========================================

    it('detects PWA installation eligibility', async () => {
        const { result } = renderHook(() => useOffline());

        expect(result.current.canInstall).toBe(false);

        // Fire beforeinstallprompt
        const e = new Event('beforeinstallprompt');
        act(() => {
            window.dispatchEvent(e);
        });

        expect(result.current.canInstall).toBe(true);
    });

    it('installs PWA when requested', async () => {
        const { result } = renderHook(() => useOffline());

        // Prepare event
        const e: any = new Event('beforeinstallprompt');
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

        const { result } = renderHook(() => useOffline());

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
