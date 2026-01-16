import { renderHook, act } from '@testing-library/react';
import { useGamification } from '../hooks/useGamification';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as GamificationData from '../data/gamificationData';

// Mock useAuth
const mockUpdateUserData = vi.fn();
const mockUserData = {
    uid: 'test-user-123',
    balance: 100,
};

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        userData: mockUserData,
        isGuest: false,
        updateUserData: mockUpdateUserData,
    }),
}));

// Mock Firestore
vi.mock('../firebase/firestore', () => ({
    getGamification: vi.fn().mockResolvedValue(null),
    saveGamificationData: vi.fn().mockResolvedValue(undefined),
}));

describe('useGamification Mission Updates', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Mock missions to ensure we have specific ones to test
        vi.spyOn(GamificationData, 'generateDailyMissions').mockReturnValue([
            {
                id: 'daily_mission_1',
                type: 'daily',
                title: 'Test Question Mission',
                description: 'Complete 3 questions',
                icon: '📝',
                objectiveType: 'complete_questions',
                targetValue: 3,
                starsReward: 10,
                xpReward: 50,
            },
            {
                id: 'daily_mission_2',
                type: 'daily',
                title: 'Test Streak Mission',
                description: 'Streak of 2',
                icon: '🎯',
                objectiveType: 'correct_streak',
                targetValue: 2,
                starsReward: 10,
                xpReward: 50,
            }
        ]);

        vi.spyOn(GamificationData, 'generateWeeklyMissions').mockReturnValue([]);
    });

    it('should update complete_questions mission when a question is completed', async () => {
        const { result } = renderHook(() => useGamification());

        // Wait for loading to finish
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // Check initial state
        const mission = result.current.activeMissions.find(m => m.missionId === 'daily_mission_1');
        expect(mission).toBeDefined();
        expect(mission?.progress).toBe(0);

        // Record a completed question
        await act(async () => {
            result.current.recordQuestionCompleted(true, 10, 5);
        });

        // Check if progress updated
        const updatedMission = result.current.activeMissions.find(m => m.missionId === 'daily_mission_1');
        // This expectation is expected to FAIL currently
        expect(updatedMission?.progress).toBe(1);
    });

    it('should update correct_streak mission when questions are completed correctly', async () => {
        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // 1st correct answer
        await act(async () => {
            result.current.recordQuestionCompleted(true, 10, 5);
        });

        let mission = result.current.activeMissions.find(m => m.missionId === 'daily_mission_2');
        // Expect progress to be 1 (current streak)
        expect(mission?.progress).toBe(1);

        // 2nd correct answer
        await act(async () => {
            result.current.recordQuestionCompleted(true, 10, 5);
        });

        mission = result.current.activeMissions.find(m => m.missionId === 'daily_mission_2');
        expect(mission?.progress).toBe(2);
        expect(mission?.status).toBe('completed');
    });
});
