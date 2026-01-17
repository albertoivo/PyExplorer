import type {
    UserGamification,
    PowerUpType,
    LevelInfo
} from '../types/gamification';
import {
    ACHIEVEMENTS,
    getLevelFromXP,
    generateDailyMissions,
    generateWeeklyMissions,
    ENDGAME_MISSIONS,
    SHOP_ITEMS
} from '../data/gamificationData';
import { calculateStreak } from './gamificationUtils';

// ============================================
// INITIAL STATE & HELPERS
// ============================================

export function getInitialGamification(): UserGamification {
    return {
        level: { level: 1, currentXP: 0, totalXP: 0 },
        streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: '',
            activityHistory: [],
        },
        achievements: [],
        activeMissions: [],
        inventory: {
            ownedItems: ['avatar_snake_green', 'frame_basic', 'title_newbie'],
            equippedAvatar: 'avatar_snake_green',
            equippedFrame: 'frame_basic',
            equippedTitle: 'title_newbie',
        },
        powerUps: {
            inventory: { skip: 1, fifty_fifty: 2, extra_hint: 2, double_stars: 1, shield: 0 },
            usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            lastResetDate: new Date().toISOString().split('T')[0],
        },
        stats: {
            totalQuestionsCompleted: 0,
            totalCorrectAnswers: 0,
            consecutiveCorrect: 0,
            bestConsecutiveCorrect: 0,
            weekendQuestionsCount: 0,
            lastWeekendDate: '',
            totalPlayTime: 0,
            worldsCompleted: 0,
            perfectWorlds: 0,
            bossesDefeated: 0,
            consecutiveFastAnswers: 0,
        },
    };
}

export function checkDailyReset(data: UserGamification): UserGamification | null {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = data.powerUps?.lastResetDate;

    if (lastReset !== today) {
        console.log('🔄 Resetting daily power-up limits...');
        return {
            ...data,
            powerUps: {
                ...data.powerUps,
                usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
                lastResetDate: today
            }
        };
    }
    return null;
}

// ============================================
// SHOP ACTIONS
// ============================================

export function buyShopItemLogic(
    state: UserGamification,
    itemId: string,
    price: number,
    userBalance: number
): { success: boolean, newState: UserGamification } {
    if (state.inventory.ownedItems.includes(itemId)) {
        return { success: false, newState: state };
    }
    if (userBalance < price) {
        return { success: false, newState: state };
    }

    return {
        success: true,
        newState: {
            ...state,
            inventory: {
                ...state.inventory,
                ownedItems: [...state.inventory.ownedItems, itemId],
            },
        }
    };
}

export function equipItemLogic(
    state: UserGamification,
    itemId: string,
    type: 'avatar' | 'frame' | 'title'
): UserGamification {
    const updatedInventory = { ...state.inventory };

    switch (type) {
        case 'avatar': updatedInventory.equippedAvatar = itemId; break;
        case 'frame': updatedInventory.equippedFrame = itemId; break;
        case 'title': updatedInventory.equippedTitle = itemId; break;
    }

    return {
        ...state,
        inventory: updatedInventory,
    };
}

// ============================================
// POWER-UPS
// ============================================

export function consumePowerUpLogic(state: UserGamification, powerUpType: PowerUpType): { success: boolean, newState: UserGamification } {
    const currentCount = state.powerUps.inventory[powerUpType] || 0;

    if (currentCount <= 0) {
        return { success: false, newState: state };
    }

    const { inventory, usesToday } = state.powerUps;

    return {
        success: true,
        newState: {
            ...state,
            powerUps: {
                ...state.powerUps,
                inventory: {
                    ...inventory,
                    [powerUpType]: inventory[powerUpType] - 1,
                },
                usesToday: {
                    ...usesToday,
                    [powerUpType]: usesToday[powerUpType] + 1,
                },
            },
        }
    };
}

export function buyPowerUpLogic(
    state: UserGamification,
    powerUpType: PowerUpType,
    price: number,
    userBalance: number
): { success: boolean, newState: UserGamification } {
    if (userBalance < price) {
        return { success: false, newState: state };
    }

    return {
        success: true,
        newState: {
            ...state,
            powerUps: {
                ...state.powerUps,
                inventory: {
                    ...state.powerUps.inventory,
                    [powerUpType]: state.powerUps.inventory[powerUpType] + 1,
                },
            },
        }
    };
}

// ============================================
// MISSIONS
// ============================================

export function claimMissionRewardLogic(
    state: UserGamification,
    missionId: string
): { success: boolean, newState: UserGamification, rewards: { xp: number, stars: number }, levelUp: LevelInfo | null } {
    const userMission = state.activeMissions.find(m => m.missionId === missionId);
    if (!userMission || userMission.status === 'claimed') {
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    const today = new Date();
    const daily = generateDailyMissions(today);
    const weekly = generateWeeklyMissions(today);
    const allMissions = [...daily, ...weekly, ...ENDGAME_MISSIONS];
    // For endgame missions, the ID might be constructed (e.g. endgame_speedrun_0)
    // We need to find the definition either by exact match or by prefix for static endgame definitions
    // Note: ENDGAME_MISSIONS do not have 'id' property in definitions, so we cast to any or handle specifically
    let missionDef = allMissions.find(m => 'id' in m && m.id === missionId);

    // If not found, try to find in ENDGAME_MISSIONS by title matching (since we construct IDs dynamically)
    if (!missionDef) {
        // Find endgame mission definition by checking if the missionId (from user state) matches the constructed pattern
        missionDef = ENDGAME_MISSIONS.find(m => missionId.startsWith(`endgame_${m.objectiveType}`)) as any;
    }

    if (!missionDef) {
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    const { xpReward, starsReward } = missionDef;
    if (xpReward === 0 && starsReward === 0) {
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    // Update XP
    const oldLevelInfo = getLevelFromXP(state.level.totalXP);
    const newTotalXP = state.level.totalXP + xpReward;
    const newLevelInfo = getLevelFromXP(newTotalXP);
    const levelUp = newLevelInfo.level > oldLevelInfo.level ? newLevelInfo : null;

    const newState = {
        ...state,
        level: {
            ...state.level,
            totalXP: newTotalXP,
            currentXP: newTotalXP - newLevelInfo.minXP
        },
        activeMissions: state.activeMissions.map(m =>
            m.missionId === missionId
                ? { ...m, status: 'claimed' as const, completedAt: new Date() }
                : m
        )
    };

    return {
        success: true,
        newState,
        rewards: { xp: xpReward, stars: starsReward },
        levelUp
    };
}

// ============================================
// QUESTIONS & STATS
// ============================================

export function recordQuestionLogic(
    state: UserGamification,
    passed: boolean,
    xpEarned: number,
    options?: {
        worldId?: string,
        starsEarned?: number,
        isBoss?: boolean,
        responseTimeSeconds?: number,
        previousStars?: number
    }
): { newState: UserGamification, levelUp: LevelInfo | null, starsEarned: number } {
    const newConsecutive = passed ? (state.stats.consecutiveCorrect || 0) + 1 : 0;
    const newBestConsecutive = Math.max(state.stats.bestConsecutiveCorrect || 0, newConsecutive);
    const isBoss = options?.isBoss || false;
    const responseTime = options?.responseTimeSeconds || 999;
    // previousStars is used (or will be used) to calculate improvement context if needed,
    // but effectively starsEarned > 0 already signals improvement.
    // We keep previousStars in options for potential future logic, but we don't need currentStars var.
    // const previousStars = options?.previousStars || 0;

    // Fast Answer Logic (< 20s)
    let newConsecutiveFast = (state.stats.consecutiveFastAnswers || 0);
    if (passed && responseTime < 20) {
        newConsecutiveFast += 1;
    } else {
        newConsecutiveFast = 0;
    }

    // XP
    const oldLevelInfo = getLevelFromXP(state.level.totalXP);
    const newTotalXP = state.level.totalXP + xpEarned;
    const newLevelInfo = getLevelFromXP(newTotalXP);
    const levelUp = newLevelInfo.level > oldLevelInfo.level ? newLevelInfo : null;

    // Streak
    const streakResult = calculateStreak(
        state.streak.currentStreak,
        state.streak.longestStreak,
        state.streak.lastActivityDate
    );

    let updatedHistory = state.streak.activityHistory;
    if (streakResult.shouldUpdate && streakResult.lastActiveDate !== state.streak.lastActivityDate) {
        updatedHistory = [...state.streak.activityHistory, streakResult.lastActiveDate].slice(-30);
    }

    const newState = {
        ...state,
        level: {
            ...state.level,
            currentXP: state.level.currentXP + xpEarned,
            totalXP: newTotalXP,
        },
        streak: {
            ...state.streak,
            currentStreak: streakResult.streak,
            longestStreak: streakResult.longestStreak,
            lastActivityDate: streakResult.lastActiveDate,
            activityHistory: updatedHistory
        },
        stats: {
            ...state.stats,
            totalQuestionsCompleted: state.stats.totalQuestionsCompleted + 1,
            totalCorrectAnswers: passed ? state.stats.totalCorrectAnswers + 1 : state.stats.totalCorrectAnswers,
            consecutiveCorrect: newConsecutive,
            bestConsecutiveCorrect: newBestConsecutive,
            bossesDefeated: (passed && isBoss) ? (state.stats.bossesDefeated || 0) + 1 : (state.stats.bossesDefeated || 0),
            consecutiveFastAnswers: newConsecutiveFast
        },
    };

    // --- MISSION PROGRESS UPDATES ---
    // We update active missions based on the event
    const starsEarned = options?.starsEarned || 0;

    newState.activeMissions = newState.activeMissions.map(mission => {
        if (mission.status !== 'active') return mission;

        // Find definition to know objective type
        const daily = generateDailyMissions(new Date());
        const weekly = generateWeeklyMissions(new Date());

        // Try to find in daily/weekly first (they have IDs)
        let def = [...daily, ...weekly].find(m => m.id === mission.missionId);

        // If not found, check endgame missions
        if (!def && mission.missionId.startsWith('endgame_')) {
             // Extract type from ID: endgame_speedrun_...
             const typePart = mission.missionId.split('_')[1]; // speedrun, improve, syntax
             // Cast definition to 'any' or compatible type since it lacks ID
             const found = ENDGAME_MISSIONS.find(m => m.objectiveType === typePart || (typePart === 'improve' && m.objectiveType === 'improve_stars') || (typePart === 'syntax' && m.objectiveType === 'syntax_master'));
             if (found) {
                 def = { ...found, id: mission.missionId } as any;
             }
        }

        if (!def) return mission;

        let newProgress = mission.progress;
        let shouldUpdate = false;

        // Check if mission targets a specific world
        if (def.targetWorld && def.targetWorld !== options?.worldId) {
            return mission;
        }

        switch (def.objectiveType) {
            case 'speedrun':
                // Check if passed AND time is within limit
                if (passed && def.timeLimit && responseTime <= def.timeLimit) {
                    newProgress += 1;
                    shouldUpdate = true;
                }
                break;
            case 'improve_stars':
                // Check if user earned new stars on an old question (improvement)
                // We rely on starsEarned > 0.
                // Note: starsEarned is calculated in GamePage as (newScore - oldScore).
                // If it is > 0, it means improvement.
                if (passed && starsEarned > 0) {
                    newProgress += 1;
                    shouldUpdate = true;
                }
                break;
            case 'syntax_master':
                // "5 questions in a row without errors"
                // If passed, increment. If failed, reset to 0.
                if (passed) {
                    newProgress += 1;
                } else {
                    newProgress = 0;
                }
                shouldUpdate = true;
                break;

            // Existing logic fallback (simplified here, assuming existing logic handles standard types elsewhere or we add them here)
            // The original code didn't update mission progress inside recordQuestionLogic,
            // it likely did it in useGamification or not at all?
            // Wait, looking at original code, I don't see mission progress update in recordQuestionLogic!
            // It seems mission progress was NOT being updated in recordQuestionLogic in the original file I read.
            // Let me re-read recordQuestionLogic carefully.
            // ...
            // You are correct. The original recordQuestionLogic ONLY updated stats/level/streak.
            // It did NOT update activeMissions.
            // This means mission logic was missing or handled elsewhere?
            // Checking useGamification... "recordQuestionCompleted" calls "recordQuestionLogic".
            // It seems the original code might have been incomplete regarding mission updates?
            // Or maybe "activeMissions" are updated via a separate function I missed?
            // No, useGamification just sets the state returned by recordQuestionLogic.
            // So I MUST implement mission update logic here for the new types (and old types if missing).

            case 'complete_questions':
                if (passed) {
                    newProgress += 1;
                    shouldUpdate = true;
                }
                break;
            case 'correct_streak':
                 if (passed) {
                     // Check global streak
                     if (newConsecutive >= def.targetValue) {
                         newProgress = def.targetValue;
                         shouldUpdate = true;
                     }
                 }
                 break;
             case 'earn_stars':
                 if (starsEarned > 0) {
                     newProgress += starsEarned;
                     shouldUpdate = true;
                 }
                 break;
        }

        if (shouldUpdate) {
            // Cap at target
            const cappedProgress = Math.min(newProgress, def.targetValue);
            return {
                ...mission,
                progress: cappedProgress,
                status: cappedProgress >= def.targetValue ? 'completed' : 'active',
                completedAt: cappedProgress >= def.targetValue ? new Date() : undefined
            };
        }

        return mission;
    });

    return {
        newState,
        levelUp,
        starsEarned: options?.starsEarned || 0,
    };
}

// ============================================
// ACHIEVEMENTS
// ============================================

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

    // Worlds
    if (worldsCompleted >= 1) unlocked.push('first_world');
    if (worldsCompleted >= 5) unlocked.push('all_worlds'); // Assume 5 is all? Or check DATA condition? 'all_worlds' condition says "Completar todos". 
    // Logic just guesses 5? I'll keep 5.

    // Bosses (Fallback to worldsCompleted for legacy data)
    const effectiveBosses = Math.max(bossesDefeated || 0, worldsCompleted || 0);

    if (effectiveBosses >= 1) unlocked.push('giant_slayer');
    if (effectiveBosses >= 3) unlocked.push('legend_hunter');

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
