import type { UserGamification, Achievement, LevelInfo } from '../../types/gamification';
import { ACHIEVEMENTS, SHOP_ITEMS } from '../../data/gamificationData';
import { ensureEndgameMissions, updateMissionProgress } from './missionLogic';

export function unlockAchievementLogic(
    state: UserGamification,
    achievementId: string
): { success: boolean, newState: UserGamification } {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return { success: false, newState: state };

    if (state.achievements.some(ua => ua.achievementId === achievementId)) {
        return { success: false, newState: state };
    }

    const userAchievement = {
        achievementId,
        unlockedAt: new Date(),
        seen: false,
    };

    return {
        success: true,
        newState: {
            ...state,
            achievements: [...state.achievements, userAchievement],
        }
    };
}

export function checkAchievementsLogic(
    state: UserGamification,
    userBalance: number
): string[] {
    const unlocked: string[] = [];
    const {
        totalQuestionsCompleted,
        consecutiveCorrect,
        worldsCompleted,
        bossesDefeated,
        consecutiveFastAnswers
    } = state.stats;

    // Learning
    if (totalQuestionsCompleted >= 1) unlocked.push('first_question');
    if (totalQuestionsCompleted >= 10) unlocked.push('ten_questions'); // Fix: ten_questions was "persistent" in logic but ID is "ten_questions". Need to verify IDs from DATA.
    // DATA.ts: first_question, ten_questions, fifty_questions, hundred_questions
    if (totalQuestionsCompleted >= 50) unlocked.push('fifty_questions');
    if (totalQuestionsCompleted >= 100) unlocked.push('hundred_questions');

    // Mastery
    if (consecutiveCorrect >= 5) unlocked.push('perfect_5');
    if (consecutiveCorrect >= 10) unlocked.push('perfect_10'); // DATA: perfect_10
    if (consecutiveCorrect >= 25) unlocked.push('perfect_25');

    // Worlds — 18 mundos no total (6+5+4+3)
    if (worldsCompleted >= 1)  unlocked.push('first_world');    // Explorador
    if (worldsCompleted >= 5)  unlocked.push('world_master');   // Mestre dos Mundos
    if (worldsCompleted >= 10) unlocked.push('world_champion'); // Campeão Global
    if (worldsCompleted >= 18) unlocked.push('all_worlds');     // Conquistador de Mundos

    // Bosses (Fallback to worldsCompleted for legacy data)
    const effectiveBosses = Math.max(bossesDefeated || 0, worldsCompleted || 0);

    if (effectiveBosses >= 1) unlocked.push('giant_slayer');
    if (effectiveBosses >= 3) unlocked.push('legend_hunter');
    if (effectiveBosses >= 18) unlocked.push('the_destroyer'); // Todos os 18 bosses

    // Speed
    if (consecutiveFastAnswers >= 5) unlocked.push('light_speed');

    // Money (Magnata)
    if (userBalance >= 1000) unlocked.push('magnate');

    // Inventory (Fashionista: 3 avatars)
    const ownedAvatars = state.inventory.ownedItems.filter(id => {
        const item = SHOP_ITEMS.find(i => i.id === id);
        return item?.type === 'avatar';
    });
    if (ownedAvatars.length >= 3) unlocked.push('fashionista');

    // Inventory (Personal Museum: All items)
    if (state.inventory.ownedItems.length >= SHOP_ITEMS.length) unlocked.push('personal_museum');

    return unlocked;
}

export function markAchievementSeenLogic(state: UserGamification, achievementId: string): UserGamification {
    return {
        ...state,
        achievements: state.achievements.map(a =>
            a.achievementId === achievementId
                ? { ...a, seen: true }
                : a
        ),
    };
}

// ============================================
// COMPOSITE HELPERS (DRY)
// ============================================

/**
 * Checks which achievements should be unlocked given the current state and
 * user balance, then sequentially unlocks each one. Returns the updated state
 * and the list of Achievement objects that were newly unlocked (for UI toasts).
 *
 * This is a pure function — all side-effects (saving, showing toasts) are the
 * caller's responsibility.
 */
export function checkWorldAchievementsLogic(
    state: UserGamification,
    userBalance: number,
    worldId?: string,
    questionsCompleted?: number,
    totalQuestions?: number,
    mistakes: number = 0
): {
    newState: UserGamification;
    hasUpdates: boolean;
    unlockedAchievements: Achievement[];
    completedMissions: string[];
    missionRewards: { stars: number; xp: number };
    levelUp: LevelInfo | null;
} {
    let currentState = state;
    let hasUpdates = false;
    const unlockedAchievements: Achievement[] = [];

    if (worldId && questionsCompleted !== undefined && totalQuestions !== undefined) {
        if (questionsCompleted === totalQuestions) {
            // 1. First World
            const r1 = unlockAchievementLogic(currentState, 'first_world');
            if (r1.success) {
                currentState = r1.newState;
                const a = ACHIEVEMENTS.find(x => x.id === 'first_world');
                if (a) unlockedAchievements.push(a);
            }

            // 2. Perfect World
            if (mistakes === 0) {
                const r2 = unlockAchievementLogic(currentState, 'perfect_world');
                if (r2.success) {
                    currentState = r2.newState;
                    const a = ACHIEVEMENTS.find(x => x.id === 'perfect_world');
                    if (a) unlockedAchievements.push(a);
                }
            }

            // 3. Stats update
            currentState = {
                ...currentState,
                stats: {
                    ...currentState.stats,
                    worldsCompleted: currentState.stats.worldsCompleted + 1,
                    perfectWorlds: mistakes === 0 ? currentState.stats.perfectWorlds + 1 : currentState.stats.perfectWorlds,
                    completedWorldIds: [...(currentState.stats.completedWorldIds || []), worldId],
                }
            };
            hasUpdates = true;
        }
    }

    // Check world-specific achievements at custom thresholds
    if (currentState.stats.worldsCompleted >= 1) {
        const r3 = unlockAchievementLogic(currentState, 'world_master');
        if (r3.success) {
            currentState = r3.newState;
            hasUpdates = true;
            const a = ACHIEVEMENTS.find(x => x.id === 'world_master');
            if (a) unlockedAchievements.push(a);
        }
    }
    if (currentState.stats.worldsCompleted >= 5) {
        const r4 = unlockAchievementLogic(currentState, 'world_champion');
        if (r4.success) {
            currentState = r4.newState;
            hasUpdates = true;
            const a = ACHIEVEMENTS.find(x => x.id === 'world_champion');
            if (a) unlockedAchievements.push(a);
        }
    }

    // Check remaining global stats achievements + endgame missions
    const { newState: stateWithAchievements, unlocked } = checkAndUnlockAchievements(currentState, userBalance);
    if (unlocked.length > 0) {
        currentState = stateWithAchievements;
        hasUpdates = true;
        unlockedAchievements.push(...unlocked);
    }

    const { newState: stateWithMissions, changed: missionsChanged } = ensureEndgameMissions(currentState);
    if (missionsChanged) {
        currentState = stateWithMissions;
        hasUpdates = true;
    }

    let finalCompletedMissions: string[] = [];
    let finalMissionRewards = { stars: 0, xp: 0 };
    let finalLevelUp: LevelInfo | null = null;

    if (worldId && questionsCompleted === totalQuestions) {
        // Trigger Mission Update for World Completion
        const mResult = updateMissionProgress(currentState, 'complete_world', 1, { worldId });
        // Handle Auto-Claim
        if (mResult.completedMissions.length > 0) {
            currentState = mResult.newState;
            hasUpdates = true;
            finalCompletedMissions = mResult.completedMissions;
            finalMissionRewards = mResult.rewards;
            finalLevelUp = mResult.levelUp;
        }
    }

    return {
        newState: currentState,
        hasUpdates,
        unlockedAchievements,
        completedMissions: finalCompletedMissions,
        missionRewards: finalMissionRewards,
        levelUp: finalLevelUp
    };
}

export function checkAndUnlockAchievements(
    state: UserGamification,
    userBalance: number
): { newState: UserGamification; unlocked: Achievement[] } {
    const candidateIds = checkAchievementsLogic(state, userBalance);
    let currentState = state;
    const unlocked: Achievement[] = [];

    for (const id of candidateIds) {
        const result = unlockAchievementLogic(currentState, id);
        if (result.success) {
            currentState = result.newState;
            const achievement = ACHIEVEMENTS.find(a => a.id === id);
            if (achievement) unlocked.push(achievement);
        }
    }

    return { newState: currentState, unlocked };
}
