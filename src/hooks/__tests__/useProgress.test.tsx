import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgress, useQuestionProgress } from '../useProgress';
import { getUserProgress, updateProgress } from '../../firebase/firestore';
import { calculateStars } from '../../utils/starCalculation';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { User } from 'firebase/auth';
import type { UserData, UserProgress } from '../../types/question';

// --- ROBUST MOCKING ---
const { authState } = vi.hoisted(() => ({
    authState: {
        user: { uid: 'test-user', displayName: 'Test User' } as unknown as User | null,
        userData: { uid: 'test-user', totalScore: 100, balance: 50, email: 'test@test.com' } as unknown as UserData | null,
        isGuest: false,
        updateUserData: vi.fn(),
        refreshUserData: vi.fn(),
    }
}));

vi.mock('../useAuth', () => ({
    useAuth: () => ({
        user: authState.user,
        userData: authState.userData,
        isGuest: authState.isGuest,
        updateUserData: authState.updateUserData,
        refreshUserData: authState.refreshUserData,
    })
}));

vi.mock('../../firebase/firestore');

vi.mock('../../utils/starCalculation', () => ({
    calculateStars: vi.fn(),
    mergeStars: vi.fn((a, b) => Math.max(a, b)),
}));

describe('useProgress Hook', () => {

    const resetAuthState = () => {
        authState.user = { uid: 'test-user', displayName: 'Test User' } as unknown as User;
        authState.userData = { uid: 'test-user', totalScore: 100, balance: 50, email: 'test@test.com' } as unknown as UserData;
        authState.isGuest = false;
        authState.updateUserData.mockClear();
        authState.refreshUserData.mockClear();
    };

    const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        resetAuthState();

        // Stub Global LocalStorage
        vi.stubGlobal('localStorage', localStorageMock);
        localStorageMock.getItem.mockImplementation(() => null);

        // Mock Calculate Stars Default
        (calculateStars as unknown as ReturnType<typeof vi.fn>).mockReturnValue(3);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Loading Progress', () => {
        it('should load progress from Firestore when authenticated', async () => {
            const mockProgress = [{ questionId: 'q1', status: 'completed', score: 10 }];
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockProgress);

            const { result } = renderHook(() => useProgress());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(getUserProgress).toHaveBeenCalledWith('test-user');
            expect(result.current.allProgress).toEqual(mockProgress);
        });

        it('should load progress from LocalStorage when guest', async () => {
            authState.user = null;
            authState.userData = null;
            authState.isGuest = true;

            const mockGuestProgress = [{ questionId: 'q-guest', status: 'completed', score: 5 }];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockGuestProgress));

            const { result } = renderHook(() => useProgress());

            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(getUserProgress).not.toHaveBeenCalled();
            expect(localStorageMock.getItem).toHaveBeenCalledWith('pyexplorer_guest_progress');
            expect(result.current.allProgress).toEqual(mockGuestProgress);
        });

        it('should handle errors when loading from Firestore', async () => {
            const errorMsg = 'Network Error';
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMsg));

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.error).toBe(errorMsg);
        });
    });

    describe('Recording Attempts', () => {
        it('should record a new successful attempt correctly (Authenticated)', async () => {
            const finalProgress = [{
                uid: 'test-user',
                questionId: 'q1',
                status: 'completed',
                score: 20,
                stars: 3,
                attempts: 1,
                lastAttemptAt: new Date(),
                bestTimeSeconds: undefined,
                userAnswer: 'code'
            }];

            (getUserProgress as unknown as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce([])
                .mockResolvedValue(finalProgress);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.recordAttempt('q1', true, 20, 'code', 'easy', 10);
            });

            expect(updateProgress).toHaveBeenCalledWith(
                'test-user', 'q1', true, 20, 'code', 3, 10
            );

            expect(authState.updateUserData).toHaveBeenCalledWith({
                totalScore: 120,
                balance: 70
            });

            const p = result.current.allProgress.find(p => p.questionId === 'q1');
            expect(p).toMatchObject({
                status: 'completed',
                score: 20,
                stars: 3,
                attempts: 1
            });
        });

        it('should record a failed attempt correctly', async () => {
            const failedState = [{
                uid: 'test-user', questionId: 'q1', status: 'in_progress', score: 0, attempts: 1
            }];

            (getUserProgress as unknown as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce([])
                .mockResolvedValue(failedState);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.recordAttempt('q1', false);
            });

            const p = result.current.allProgress.find(p => p.questionId === 'q1');
            expect(p).toMatchObject({
                status: 'in_progress',
                score: 0,
                attempts: 1
            });
        });

        it('should increment attempts on retry', async () => {
            const initialProgress = [{
                uid: 'test-user', questionId: 'q1', status: 'completed', score: 20, attempts: 1
            }];
            const updatedProgress = [{
                uid: 'test-user', questionId: 'q1', status: 'completed', score: 20, attempts: 2
            }];

            (getUserProgress as unknown as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce(initialProgress)
                .mockResolvedValue(updatedProgress);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.recordAttempt('q1', true, 20);
            });

            const p = result.current.allProgress.find(p => p.questionId === 'q1');
            expect(p?.attempts).toBe(2);
        });

        it('should add points ONLY for improvement', async () => {
            // Must use 'in_progress' or lower score to allow improvement
            const initialProgress = [{
                uid: 'test-user', questionId: 'q1', status: 'in_progress', score: 10, attempts: 1
            }];

            (getUserProgress as unknown as ReturnType<typeof vi.fn>)
                .mockResolvedValue(initialProgress);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.recordAttempt('q1', true, 30);
            });

            // 100 + (30 - 10) = 120
            expect(authState.updateUserData).toHaveBeenCalledWith({
                totalScore: 120,
                balance: 70
            });
        });

        it('should handle LocalStorage for Guest users', async () => {
            authState.user = null;
            authState.userData = null;
            authState.isGuest = true;

            localStorageMock.getItem.mockReturnValue(null);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.recordAttempt('q-guest', true, 15);
            });

            expect(updateProgress).not.toHaveBeenCalled();
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'pyexplorer_guest_progress',
                expect.stringContaining('"questionId":"q-guest"')
            );
        });

        it('should revert state on error', async () => {
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            (updateProgress as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Save Failed'));

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.recordAttempt('q1', true);
            });

            expect(result.current.error).toBe('Save Failed');
        });
    });

    describe('Stats', () => {
        it('should calculate stats correctly', async () => {
            const mockData = [
                { questionId: 'q1', status: 'completed', score: 10, attempts: 1 },
                { questionId: 'q2', status: 'in_progress', score: 0, attempts: 2 }
            ] as unknown as UserProgress[];
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.stats).toEqual({
                totalQuestions: 2,
                completed: 1,
                inProgress: 1,
                totalScore: 10,
                totalAttempts: 3
            });
        });

        it('should get progress for specific question', async () => {
            const mockData = [{ questionId: 'q1', status: 'completed' }];
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            const { result } = renderHook(() => useProgress());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const p = result.current.getQuestionProgress('q1');
            expect(p).toEqual(mockData[0]);
            expect(result.current.getQuestionProgress('q99')).toBeNull();
        });
    });

    describe('useQuestionProgress (Derived Hook)', () => {
        it('should return progress for single question', async () => {
            const mockData = [{ questionId: 'q1', status: 'completed' }];
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            const { result } = renderHook(() => useQuestionProgress('q1'));
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.progress).toMatchObject({ questionId: 'q1', status: 'completed' });
        });

        it('should submit answer via derived hook', async () => {
            (getUserProgress as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            const { result } = renderHook(() => useQuestionProgress('q1'));
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                await result.current.submitAnswer(true, 50);
            });

            expect(updateProgress).toHaveBeenCalled();
        });
    });
});
