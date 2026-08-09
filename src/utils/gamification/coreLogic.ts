import type {
    UserGamification,
    LevelInfo,
    Mission,
    PowerUpType
} from '../../types/gamification';
import { getLevelFromXP, ENDGAME_MISSIONS, generateDailyMissions, generateWeeklyMissions } from '../../data/gamificationData';
import { calculateStreak, getLocalDateStr } from '../gamificationUtils';
import { getInitialPet, gainPetXp } from '../petLogic';

export function getInitialGamification(): UserGamification {
    return {
        pet: getInitialPet(),
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
            lastResetDate: getLocalDateStr(),
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
            completedWorldIds: [],
        },
    };
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
    return Math.min(max, Math.max(min, value));
}

export function removePetField(data: UserGamification): UserGamification {
    const { pet, ...legacyData } = data;
    void pet;
    return legacyData as UserGamification;
}

export function normalizeGamificationForRules(data: UserGamification): UserGamification {
    const initial = getInitialGamification();

    const inventory = {
        ownedItems: Array.isArray(data.inventory?.ownedItems) ? data.inventory.ownedItems.slice(0, 1000) : initial.inventory.ownedItems,
        equippedAvatar: typeof data.inventory?.equippedAvatar === 'string' ? data.inventory.equippedAvatar.slice(0, 100) : initial.inventory.equippedAvatar,
        equippedFrame: typeof data.inventory?.equippedFrame === 'string' ? data.inventory.equippedFrame.slice(0, 100) : initial.inventory.equippedFrame,
        equippedTitle: typeof data.inventory?.equippedTitle === 'string' ? data.inventory.equippedTitle.slice(0, 100) : initial.inventory.equippedTitle,
    };

    const powerUpKeys: PowerUpType[] = ['skip', 'fifty_fifty', 'extra_hint', 'double_stars', 'shield'];
    const normalizedPowerUps = {
        inventory: powerUpKeys.reduce((acc, key) => {
            acc[key] = clampNumber(data.powerUps?.inventory?.[key], 0, 999, 0);
            return acc;
        }, {} as Record<PowerUpType, number>),
        usesToday: powerUpKeys.reduce((acc, key) => {
            acc[key] = clampNumber(data.powerUps?.usesToday?.[key], 0, 99, 0);
            return acc;
        }, {} as Record<PowerUpType, number>),
        lastResetDate: typeof data.powerUps?.lastResetDate === 'string'
            ? data.powerUps.lastResetDate.slice(0, 10)
            : initial.powerUps.lastResetDate,
    };

    const normalizedStats = {
        totalQuestionsCompleted: clampNumber(data.stats?.totalQuestionsCompleted, 0, 999999, 0),
        totalCorrectAnswers: clampNumber(data.stats?.totalCorrectAnswers, 0, 999999, 0),
        consecutiveCorrect: clampNumber(data.stats?.consecutiveCorrect, 0, 999999, 0),
        bestConsecutiveCorrect: clampNumber(data.stats?.bestConsecutiveCorrect, 0, 999999, 0),
        weekendQuestionsCount: clampNumber(data.stats?.weekendQuestionsCount, 0, 999999, 0),
        lastWeekendDate: typeof data.stats?.lastWeekendDate === 'string' ? data.stats.lastWeekendDate.slice(0, 10) : '',
        totalPlayTime: clampNumber(data.stats?.totalPlayTime, 0, 999999, 0),
        worldsCompleted: clampNumber(data.stats?.worldsCompleted, 0, 999999, 0),
        perfectWorlds: clampNumber(data.stats?.perfectWorlds, 0, 999999, 0),
        bossesDefeated: clampNumber(data.stats?.bossesDefeated, 0, 999999, 0),
        consecutiveFastAnswers: clampNumber(data.stats?.consecutiveFastAnswers, 0, 999999, 0),
        completedWorldIds: Array.isArray(data.stats?.completedWorldIds) ? data.stats.completedWorldIds.slice(0, 100) : [],
    };

    const normalizedPet = data.pet
        ? {
            name: typeof data.pet.name === 'string' ? data.pet.name.slice(0, 50) : initial.pet?.name || 'PyEvo',
            stage: (['egg', 'baby', 'teen', 'adult'] as const).includes(data.pet.stage) ? data.pet.stage : 'egg',
            type: (['generic', 'snake', 'owl', 'chameleon', 'robot', 'dragon'] as const).includes(data.pet.type) ? data.pet.type : 'generic',
            xp: clampNumber(data.pet.xp, 0, 9999999, 0),
            level: clampNumber(data.pet.level, 1, 9999, 1),
            hunger: clampNumber(data.pet.hunger, 0, 100, 100),
            mood: (['happy', 'sad', 'sleeping', 'hungry', 'coding', 'excited'] as const).includes(data.pet.mood) ? data.pet.mood : 'sleeping',
            evolutionPath: (data.pet.evolutionPath && typeof data.pet.evolutionPath === 'object') ? data.pet.evolutionPath : {},
            lastFedAt: typeof data.pet.lastFedAt === 'string' ? data.pet.lastFedAt.slice(0, 50) : new Date().toISOString(),
            ...(typeof data.pet.justEvolved === 'boolean' ? { justEvolved: data.pet.justEvolved } : {}),
        }
        : undefined;

    return {
        level: {
            level: clampNumber(data.level?.level, 0, 100, initial.level.level),
            currentXP: clampNumber(data.level?.currentXP, 0, 9999999, initial.level.currentXP),
            totalXP: clampNumber(data.level?.totalXP, 0, 9999999, initial.level.totalXP),
        },
        streak: {
            currentStreak: clampNumber(data.streak?.currentStreak, 0, 9999, initial.streak.currentStreak),
            longestStreak: clampNumber(data.streak?.longestStreak, 0, 9999, initial.streak.longestStreak),
            lastActivityDate: typeof data.streak?.lastActivityDate === 'string' ? data.streak.lastActivityDate.slice(0, 10) : initial.streak.lastActivityDate,
            activityHistory: Array.isArray(data.streak?.activityHistory) ? data.streak.activityHistory.slice(0, 50) : initial.streak.activityHistory,
        },
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        activeMissions: Array.isArray(data.activeMissions) ? data.activeMissions.slice(0, 50) : [],
        inventory,
        powerUps: normalizedPowerUps,
        stats: normalizedStats,
        ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
        ...(normalizedPet ? { pet: normalizedPet } : {}),
    };
}

export function recordQuestionLogic(
    state: UserGamification,
    passed: boolean,
    xpEarned: number,
    options?: {
        worldId?: string,
        starsEarned?: number,
        isBoss?: boolean,
        responseTimeSeconds?: number,
        previousStars?: number,
        wasCompleted?: boolean
    }
): {
    newState: UserGamification,
    levelUp: LevelInfo | null,
    starsEarned: number,
    missionRewards: { stars: number, xp: number },
    completedMissionTitles: string[]
} {
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

    // XP (Practice XP reduced if already completed)
    const effectiveXpEarned = (passed && options?.wasCompleted)
        ? Math.max(2, Math.round(xpEarned * 0.3))
        : (passed ? xpEarned : 0);

    const oldLevelInfo = getLevelFromXP(state.level.totalXP);
    const newTotalXP = state.level.totalXP + effectiveXpEarned;
    const newLevelInfo = getLevelFromXP(newTotalXP);
    const levelUp = newLevelInfo.level > oldLevelInfo.level ? newLevelInfo : null;

    // Pet Evolution (PyEvo)
    const currentPet = state.pet || getInitialPet();
    // Only gain XP if passed, or maybe small XP if failed? For now, only passed.
    const { newPet } = passed
        ? gainPetXp(currentPet, effectiveXpEarned, options?.worldId || 'generic')
        : { newPet: currentPet };

    // Streak
    const hasShield = (state.powerUps?.inventory?.shield || 0) > 0;
    const streakResult = calculateStreak(
        state.streak.currentStreak,
        state.streak.longestStreak,
        state.streak.lastActivityDate,
        undefined,
        hasShield
    );

    let updatedHistory = state.streak.activityHistory;
    if (streakResult.shouldUpdate && streakResult.lastActiveDate !== state.streak.lastActivityDate) {
        updatedHistory = [...state.streak.activityHistory, streakResult.lastActiveDate].slice(-30);
    }

    const newState = {
        ...state,
        level: {
            ...state.level,
            currentXP: newTotalXP - newLevelInfo.minXP,
            totalXP: newTotalXP,
        },
        pet: newPet,
        powerUps: streakResult.shieldUsed ? {
            ...state.powerUps,
            inventory: {
                ...state.powerUps.inventory,
                shield: Math.max(0, (state.powerUps?.inventory?.shield || 0) - 1)
            }
        } : state.powerUps,
        streak: {
            ...state.streak,
            currentStreak: streakResult.streak,
            longestStreak: streakResult.longestStreak,
            lastActivityDate: streakResult.lastActiveDate,
            activityHistory: updatedHistory
        },
        stats: {
            ...state.stats,
            totalQuestionsCompleted: !options?.wasCompleted ? state.stats.totalQuestionsCompleted + 1 : state.stats.totalQuestionsCompleted,
            totalCorrectAnswers: passed ? state.stats.totalCorrectAnswers + 1 : state.stats.totalCorrectAnswers,
            consecutiveCorrect: newConsecutive,
            bestConsecutiveCorrect: newBestConsecutive,
            bossesDefeated: (passed && isBoss && !options?.wasCompleted) ? (state.stats.bossesDefeated || 0) + 1 : (state.stats.bossesDefeated || 0),
            consecutiveFastAnswers: newConsecutiveFast
        },
    };

    // --- MISSION PROGRESS UPDATES ---
    // We update active missions based on the event
    const starsEarned = options?.starsEarned || 0;
    const completedMissions: string[] = [];
    let missionXP = 0;
    let missionStars = 0;

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
                def = { ...found, id: mission.missionId } as Mission;
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
            case 'login_streak':
                if (streakResult.shouldUpdate) {
                    newProgress += 1;
                    shouldUpdate = true;
                }
                break;
        }

        if (shouldUpdate) {
            // Cap at target
            const cappedProgress = Math.min(newProgress, def.targetValue);
            const isCompleted = cappedProgress >= def.targetValue;

            if (isCompleted) {
                // AUTO-CLAIM
                completedMissions.push(def.title);
                missionStars += def.starsReward;
                missionXP += def.xpReward;
            }

            return {
                ...mission,
                progress: cappedProgress,
                status: isCompleted ? 'claimed' as const : 'active',
                completedAt: isCompleted ? new Date() : undefined
            };
        }

        return mission;
    });

    // Add Mission Rewards to State (Level/XP)
    let finalLevelState = newState.level;
    let finalLevelUp = levelUp;

    if (missionXP > 0) {
        const afterMissionTotalXP = finalLevelState.totalXP + missionXP;
        const afterMissionLevelInfo = getLevelFromXP(afterMissionTotalXP);
        // Check for level up from mission XP (if wasn't already leveled up, or leveled up AGAIN?)
        // Simple approach: Recalculate level up based on final XP vs INITIAL state XP logic?
        // Let's just update the level state.

        finalLevelState = {
            ...finalLevelState,
            totalXP: afterMissionTotalXP,
            currentXP: afterMissionTotalXP - afterMissionLevelInfo.minXP
        };

        // If we leveled up from question, we stay leveled up.
        // If we didn't, we might level up now.
        if (!finalLevelUp && afterMissionLevelInfo.level > getLevelFromXP(state.level.totalXP).level) {
            finalLevelUp = afterMissionLevelInfo;
        } else if (finalLevelUp && afterMissionLevelInfo.level > finalLevelUp.level) {
            finalLevelUp = afterMissionLevelInfo; // Leveled up even more?
        }
    }

    return {
        newState: {
            ...newState,
            level: finalLevelState,
            activeMissions: newState.activeMissions
        },
        levelUp: finalLevelUp,
        starsEarned: (options?.starsEarned || 0),
        missionRewards: { stars: missionStars, xp: missionXP },
        completedMissionTitles: completedMissions
    };
}

// ============================================
// ACHIEVEMENTS
// ============================================
