import type { UserGamification } from '../../types/gamification';

/**
 * Applies a streak update to the gamification state, factoring in shield usage.
 * Returns the potentially updated state, a boolean indicating if changes occurred,
 * and a boolean indicating if a shield was consumed.
 */
export function applyStreakUpdate(
    state: UserGamification,
    calculateStreakFn: typeof import('../gamificationUtils').calculateStreak
): { newState: UserGamification; changed: boolean; shieldUsed: boolean } {
    const hasShield = (state.powerUps?.inventory?.shield || 0) > 0;
    const streakResult = calculateStreakFn(
        state.streak.currentStreak,
        state.streak.longestStreak,
        state.streak.lastActivityDate,
        undefined,
        hasShield
    );

    if (!streakResult.shouldUpdate) {
        return { newState: state, changed: false, shieldUsed: false };
    }

    const newState = {
        ...state,
        powerUps: streakResult.shieldUsed ? {
            ...state.powerUps,
            inventory: {
                ...state.powerUps.inventory,
                shield: Math.max(0, (state.powerUps?.inventory?.shield || 0) - 1)
            }
        } : state.powerUps,
        streak: {
            currentStreak: streakResult.streak,
            longestStreak: streakResult.longestStreak,
            lastActivityDate: streakResult.lastActiveDate,
            activityHistory: [...(state.streak?.activityHistory || []), streakResult.lastActiveDate]
        }
    };

    return { newState, changed: true, shieldUsed: streakResult.shieldUsed || false };
}

/**
 * Migrates legacy streak data from UserData into the Gamification state, if applicable.
 */
export function migrateLegacyStreak(
    state: UserGamification,
    legacyStreak?: number,
    legacyLongestStreak?: number,
    legacyLastActiveDate?: string
): { newState: UserGamification; changed: boolean } {
    if (legacyStreak && (!state.streak.currentStreak || legacyStreak > state.streak.currentStreak)) {
        return {
            newState: {
                ...state,
                streak: {
                    ...state.streak,
                    currentStreak: legacyStreak || 0,
                    longestStreak: Math.max(legacyLongestStreak || 0, state.streak.longestStreak),
                    lastActivityDate: legacyLastActiveDate || state.streak.lastActivityDate
                }
            },
            changed: true
        };
    }
    return { newState: state, changed: false };
}
