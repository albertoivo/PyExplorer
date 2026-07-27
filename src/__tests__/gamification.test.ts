import { describe, it, expect } from 'vitest';
import { calculateStreak, getLocalDateStr } from '../utils/gamificationUtils';
import { recordQuestionLogic, getInitialGamification } from '../utils/gamificationState';

describe('Gamification Logic: Streak Calculation', () => {
    const today = '2023-10-10';
    const yesterday = '2023-10-09';
    const twoDaysAgo = '2023-10-08';

    it('should initialize streak to 1 for new user (no previous date)', () => {
        const result = calculateStreak(0, 0, null, today);
        expect(result).toEqual({
            streak: 1,
            longestStreak: 1,
            lastActiveDate: today,
            shouldUpdate: true
        });
    });

    it('should not update if user already logged in today', () => {
        const result = calculateStreak(5, 10, today, today);
        expect(result).toEqual({
            streak: 5,
            longestStreak: 10,
            lastActiveDate: today,
            shouldUpdate: false
        });
    });

    it('should increment streak if last login was yesterday', () => {
        const result = calculateStreak(5, 5, yesterday, today);
        expect(result).toEqual({
            streak: 6,
            longestStreak: 6,
            lastActiveDate: today,
            shouldUpdate: true
        });
    });

    it('should reset streak to 1 if last login was 2 days ago', () => {
        const result = calculateStreak(10, 10, twoDaysAgo, today);
        expect(result).toEqual({
            streak: 1,
            longestStreak: 10,
            lastActiveDate: today,
            shouldUpdate: true
        });
    });

    it('should handle streak of 0 correctly', () => {
        const result = calculateStreak(0, 0, yesterday, today);
        expect(result).toEqual({
            streak: 1,
            longestStreak: 1,
            lastActiveDate: today,
            shouldUpdate: true
        });
    });
});

describe('Gamification Logic: Shield Integration in recordQuestionLogic', () => {
    it('should consume shield and protect streak when completing a question after missing 1 day', () => {
        const now = new Date();
        const twoDaysAgoDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
        const twoDaysAgoStr = getLocalDateStr(twoDaysAgoDate);

        const initialState = getInitialGamification();
        initialState.streak.currentStreak = 10;
        initialState.streak.longestStreak = 15;
        initialState.streak.lastActivityDate = twoDaysAgoStr;
        initialState.powerUps.inventory.shield = 1;

        const { newState } = recordQuestionLogic(initialState, true, 20);

        expect(newState.streak.currentStreak).toBe(11); // Protected and incremented!
        expect(newState.powerUps.inventory.shield).toBe(0); // Consumed!
    });

    it('should NOT consume shield and should reset streak if missing more than 1 day', () => {
        const now = new Date();
        const threeDaysAgoDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
        const threeDaysAgoStr = getLocalDateStr(threeDaysAgoDate);

        const initialState = getInitialGamification();
        initialState.streak.currentStreak = 10;
        initialState.streak.longestStreak = 15;
        initialState.streak.lastActivityDate = threeDaysAgoStr;
        initialState.powerUps.inventory.shield = 1;

        const { newState } = recordQuestionLogic(initialState, true, 20);

        expect(newState.streak.currentStreak).toBe(1); // Reset!
        expect(newState.powerUps.inventory.shield).toBe(1); // Not consumed!
    });
});
