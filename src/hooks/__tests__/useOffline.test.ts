/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOffline } from '../useOffline';
import * as questionsService from '../../firebase/questionsService';
import * as firestoreModule from '../../firebase/firestore';
import * as authContext from '../../context/AuthContext';

// Mock dependencies
vi.mock('../../firebase/questionsService');
vi.mock('../../firebase/firestore');
vi.mock('../../context/AuthContext');

describe('useOffline', () => {
    let localStorageStore: Record<string, string> = {};

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock LocalStorage
        localStorageStore = {};
        vi.mocked(localStorage.getItem).mockImplementation((key) => localStorageStore[key] || null);
        vi.mocked(localStorage.setItem).mockImplementation((key, value) => { localStorageStore[key] = value; });
        vi.mocked(localStorage.removeItem).mockImplementation((key) => { delete localStorageStore[key]; });

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
        (authContext.useAuth as any).mockReturnValue({
            user: { uid: 'user123' }
        });

        // Mock Service Worker
        Object.defineProperty(navigator, 'serviceWorker', {
            value: {
                ready: Promise.resolve({
                    addEventListener: vi.fn(),
                    installing: null,
                    waiting: null,
                }),
                controller: null,
                register: vi.fn(),
            },
            writable: true
        });
    });

    it('initializes with online state', async () => {
        const { result } = renderHook(() => useOffline());
        expect(result.current.isOnline).toBe(true);
        // Wait for async effects to complete
        await waitFor(() => expect(result.current.cachedQuestions).toBeDefined());
    });

    it('updates status when offline/online events fire', async () => {
        const { result } = renderHook(() => useOffline());
        // Wait for init
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
        const mockQuestions = [{ id: 'q1', title: 'Cached' }];
        localStorageStore['pyexplorer_cached_questions'] = JSON.stringify(mockQuestions);

        const { result } = renderHook(() => useOffline());

        await waitFor(() => {
            expect(result.current.cachedQuestions).toHaveLength(1);
        });
        expect(result.current.cachedQuestions[0].id).toBe('q1');
    });

    it('fetches and caches questions if cache is empty', async () => {
        const mockQuestions = [{ id: 'q2', title: 'Fetched' }];
        (questionsService.fetchAllQuestions as any).mockResolvedValue(mockQuestions);

        const { result } = renderHook(() => useOffline());

        await waitFor(() => {
            expect(result.current.cachedQuestions).toHaveLength(1);
        });

        // Should fetch but NOT auto-cache?
        // Code: if (cachedQuestionsStr) ... else { cachedQuestions = await fetchAllQuestions(); }
        // The hook loads them into state, but does it cache them back to localStorage?
        // No, `loadCachedData` just reads. It doesn't write to cache automatically.
        // `cacheQuestions` function does.

        expect(questionsService.fetchAllQuestions).toHaveBeenCalled();
        expect(result.current.cachedQuestions[0].id).toBe('q2');
    });

    it('saves offline progress', async () => {
        const { result } = renderHook(() => useOffline());
        // Wait for init
        await waitFor(() => expect(result.current.cachedQuestions).toBeDefined());

        act(() => {
            result.current.saveOfflineProgress('q1', true, 100);
        });

        expect(result.current.pendingSync).toBe(1);
        const stored = JSON.parse(localStorageStore['pyexplorer_offline_progress']);
        expect(stored).toHaveLength(1);
        expect(stored[0].questionId).toBe('q1');
    });

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
            window.dispatchEvent(new Event('online'));
        });

        expect(firestoreModule.updateProgressBatch).toHaveBeenCalledWith('user123', pending);

        // Should clear pending
        await waitFor(() => {
            expect(result.current.pendingSync).toBe(0);
        });
        expect(localStorageStore['pyexplorer_offline_progress']).toBeUndefined();
    });
});
