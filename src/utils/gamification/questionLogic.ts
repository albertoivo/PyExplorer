import type { UserGamification, LevelInfo, Mission } from '../../types/gamification';
import { getLevelFromXP, ENDGAME_MISSIONS, generateDailyMissions, generateWeeklyMissions } from '../../data/gamificationData';
import { calculateStreak } from '../gamificationUtils';
import { getInitialPet, gainPetXp } from '../petLogic';

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
    const starsEarned = options?.starsEarned || 0;
    const completedMissions: string[] = [];
    let missionXP = 0;
    let missionStars = 0;

    newState.activeMissions = newState.activeMissions.map(mission => {
        if (mission.status !== 'active') return mission;

        const daily = generateDailyMissions(new Date());
        const weekly = generateWeeklyMissions(new Date());

        let def = [...daily, ...weekly].find(m => m.id === mission.missionId);

        if (!def && mission.missionId.startsWith('endgame_')) {
            const typePart = mission.missionId.split('_')[1];
            const found = ENDGAME_MISSIONS.find(m => m.objectiveType === typePart || (typePart === 'improve' && m.objectiveType === 'improve_stars') || (typePart === 'syntax' && m.objectiveType === 'syntax_master'));
            if (found) {
                def = { ...found, id: mission.missionId } as Mission;
            }
        }

        if (!def) return mission;

        let newProgress = mission.progress;
        let shouldUpdate = false;

        if (def.targetWorld && def.targetWorld !== options?.worldId) {
            return mission;
        }

        switch (def.objectiveType) {
            case 'speedrun':
                if (passed && def.timeLimit && responseTime <= def.timeLimit) {
                    newProgress += 1;
                    shouldUpdate = true;
                }
                break;
            case 'improve_stars':
                if (passed && starsEarned > 0) {
                    newProgress += 1;
                    shouldUpdate = true;
                }
                break;
            case 'syntax_master':
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
            const cappedProgress = Math.min(newProgress, def.targetValue);
            const isCompleted = cappedProgress >= def.targetValue;

            if (isCompleted) {
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

    let finalLevelState = newState.level;
    let finalLevelUp = levelUp;

    if (missionXP > 0) {
        const afterMissionTotalXP = finalLevelState.totalXP + missionXP;
        const afterMissionLevelInfo = getLevelFromXP(afterMissionTotalXP);

        finalLevelState = {
            ...finalLevelState,
            totalXP: afterMissionTotalXP,
            currentXP: afterMissionTotalXP - afterMissionLevelInfo.minXP
        };

        if (!finalLevelUp && afterMissionLevelInfo.level > getLevelFromXP(state.level.totalXP).level) {
            finalLevelUp = afterMissionLevelInfo;
        } else if (finalLevelUp && afterMissionLevelInfo.level > finalLevelUp.level) {
            finalLevelUp = afterMissionLevelInfo;
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
