import type { UserGamification } from '../../types/gamification';
import { checkDailyAndWeeklyReset } from './missionLogic';
import { migrateLegacyStreak, applyStreakUpdate } from './streakLogic';
import { calculateStreak } from '../gamificationUtils';
import { checkPetStatus, getInitialPet } from '../petLogic';

type LegacyStreakUserFields = {
    streak?: number;
    longestStreak?: number;
    lastActiveDate?: string;
};

export interface ProcessedGamificationData {
    finalData: UserGamification;
    hasUpdates: boolean;
    shieldUsed: boolean;
}

export function processLoadedGamificationData(
    remoteData: UserGamification,
    legacyUserFields?: LegacyStreakUserFields,
    isInitial: boolean = false
): ProcessedGamificationData {
    let finalData = remoteData;
    let hasUpdates = false;

    // 1. Daily/Weekly Reset
    const resetted = checkDailyAndWeeklyReset(remoteData);
    if (resetted) {
        finalData = resetted;
        hasUpdates = true;
    }

    // 2. Legacy Migration
    if (legacyUserFields) {
        const legacyMigration = migrateLegacyStreak(
            finalData,
            legacyUserFields.streak,
            legacyUserFields.longestStreak,
            legacyUserFields.lastActiveDate
        );
        if (legacyMigration.changed) {
            finalData = legacyMigration.newState;
            hasUpdates = true;
        }
    }

    // 3. Streak Update (skip if it's the very first time initializing to avoid falsely setting streak to 1)
    let streakShieldUsed = false;
    if (!isInitial) {
        const { newState: updatedFinalData, changed: streakChanged, shieldUsed } = applyStreakUpdate(finalData, calculateStreak);
        if (streakChanged) {
            finalData = updatedFinalData;
            hasUpdates = true;
            streakShieldUsed = shieldUsed;
        }
    }

    // 4. Pet Status Check
    if (!finalData.pet) {
        finalData.pet = getInitialPet();
        hasUpdates = true;
    } else {
        const updatedPet = checkPetStatus(finalData.pet);
        if (JSON.stringify(updatedPet) !== JSON.stringify(finalData.pet)) {
            finalData.pet = updatedPet;
            hasUpdates = true;
        }
    }

    return {
        finalData,
        hasUpdates,
        shieldUsed: streakShieldUsed,
    };
}
