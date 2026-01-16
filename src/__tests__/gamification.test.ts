import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../utils/gamificationUtils';

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
