import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../gamificationUtils';

describe('gamificationUtils', () => {
    describe('calculateStreak', () => {
        const today = '2025-05-15'; // Simulamos "hoje"

        it('should initialize streak for first login', () => {
            const result = calculateStreak(0, 0, null, today);

            expect(result).toEqual({
                streak: 1,
                longestStreak: 1,
                lastActiveDate: today,
                shouldUpdate: true
            });
        });

        it('should maintain streak if logged in same day', () => {
            const result = calculateStreak(5, 10, today, today);

            expect(result).toEqual({
                streak: 5,
                longestStreak: 10,
                lastActiveDate: today,
                shouldUpdate: false
            });
        });

        it('should increment streak if logged in consecutive day (yesterday)', () => {
            const yesterday = '2025-05-14';
            const result = calculateStreak(5, 10, yesterday, today);

            expect(result).toEqual({
                streak: 6,
                longestStreak: 10, // 6 < 10
                lastActiveDate: today,
                shouldUpdate: true
            });
        });

        it('should update longestStreak if current streak surpasses it', () => {
            const yesterday = '2025-05-14';
            const result = calculateStreak(9, 9, yesterday, today);

            expect(result).toEqual({
                streak: 10,
                longestStreak: 10, // 10 >= 10
                lastActiveDate: today,
                shouldUpdate: true
            });

            // Caso onde streak novo é maior
            const result2 = calculateStreak(10, 10, yesterday, today);
            expect(result2).toEqual({
                streak: 11,
                longestStreak: 11,
                lastActiveDate: today,
                shouldUpdate: true
            });
        });

        it('should reset streak if missed a day', () => {
            const twoDaysAgo = '2025-05-13';
            const result = calculateStreak(5, 20, twoDaysAgo, today);

            expect(result).toEqual({
                streak: 1,
                longestStreak: 20, // Mantém o recorde
                lastActiveDate: today,
                shouldUpdate: true
            });
        });

        it('should handle undefined lastActiveDate gracefully', () => {
            const result = calculateStreak(0, 0, undefined, today);
            expect(result).toEqual({
                streak: 1,
                longestStreak: 1,
                lastActiveDate: today,
                shouldUpdate: true
            });
        });

        it('should protect streak and set shieldUsed to true if missed exactly 1 day and hasShield is true', () => {
            const twoDaysAgo = '2025-05-13'; // missed 2025-05-14
            const result = calculateStreak(5, 20, twoDaysAgo, today, true);

            expect(result).toEqual({
                streak: 6, // maintained and incremented for today's activity!
                longestStreak: 20,
                lastActiveDate: today,
                shouldUpdate: true,
                shieldUsed: true
            });
        });

        it('should reset streak if missed more than 1 day even if hasShield is true', () => {
            const threeDaysAgo = '2025-05-12'; // missed 13th and 14th
            const result = calculateStreak(5, 20, threeDaysAgo, today, true);

            expect(result).toEqual({
                streak: 1, // reset because shield only protects 1 day
                longestStreak: 20,
                lastActiveDate: today,
                shouldUpdate: true
            });
            expect(result.shieldUsed).toBeFalsy();
        });
    });
});
