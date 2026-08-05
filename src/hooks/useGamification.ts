import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
    UserGamification,
    Achievement,
    PowerUpType,
    LevelInfo,
} from '../types/gamification';
import {
    ACHIEVEMENTS,
    getLevelFromXP,
    getLevelProgress,
} from '../data/gamificationData';
import { useAuth } from './useAuth';
import { getGamification, saveGamificationData } from '../firebase/firestore';
import {
    getInitialGamification,
    checkDailyAndWeeklyReset,
    buyShopItemLogic,
    equipItemLogic,
    consumePowerUpLogic,
    buyPowerUpLogic,
    claimMissionRewardLogic,
    recordQuestionLogic,
    unlockAchievementLogic,
    markAchievementSeenLogic,
    updateMissionProgress,
    hydrateMissions,
    checkAndUnlockAchievements,
    ensureEndgameMissions,
    applyStreakUpdate,
    migrateLegacyStreak,
    normalizeGamificationForRules,
    removePetField,
} from '../utils/gamificationState';
import { calculateStreak } from '../utils/gamificationUtils';
import { feedPet, checkPetStatus, getInitialPet } from '../utils/petLogic';

// ============================================
// HOOK
// ============================================

const GUEST_GAMIFICATION_KEY = 'pyexplorer_guest_gamification';

type LegacyStreakUserFields = {
    streak?: number;
    longestStreak?: number;
    lastActiveDate?: string;
};

type FirebaseLikeError = {
    code?: string;
    message?: string;
};

function isPermissionDeniedError(error: unknown): boolean {
    const err = error as FirebaseLikeError;
    return err?.code === 'permission-denied' || err?.code === 'firestore/permission-denied';
}



async function saveGamificationWithFallback(uid: string, data: UserGamification): Promise<void> {
    const normalized = normalizeGamificationForRules(data);
    try {
        await saveGamificationData(uid, normalized);
    } catch (error) {
        if (!isPermissionDeniedError(error)) throw error;
        // Regras de produção desatualizadas — tenta progressivamente remover campos novos
        if (normalized.pet) {
            try {
                await saveGamificationData(uid, removePetField(normalized));
                return;
            } catch (error2) {
                if (!isPermissionDeniedError(error2)) throw error2;
            }
        }
    }
}

export function useGamification() {
    const { userData, isGuest, updateUserData } = useAuth();
    const [gamification, setGamification] = useState<UserGamification>(getInitialGamification);



    // Ref to always have latest userData (avoids stale closures in loadGamification)
    const userDataRef = useRef(userData);
    useEffect(() => {
        userDataRef.current = userData;
    }, [userData]);

    const [loading, setLoading] = useState(true);
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
    const [showLevelUp, setShowLevelUp] = useState<LevelInfo | null>(null);
    const [missionNotification, setMissionNotification] = useState<{ title: string, rewards: { stars: number, xp: number } } | null>(null);

    const safeAddAchievement = useCallback((achievement: Achievement) => {
        setNewAchievements(prev => {
            if (prev.some(a => a.id === achievement.id)) return prev;
            return [...prev, achievement];
        });
    }, []);

    // ============================================
    // LOAD/SAVE
    // ============================================

    const saveGamification = useCallback((data: UserGamification) => {
        if (!data || !data.level || !data.stats) return;

        // Prevent wiping XP check
        if (data.level.totalXP === 0 && gamification.level.totalXP > 0) return;

        if (isGuest) {
            localStorage.setItem(GUEST_GAMIFICATION_KEY, JSON.stringify(data));
        } else if (userData) {
            localStorage.setItem(`gamification_${userData.uid}`, JSON.stringify(data));
            saveGamificationWithFallback(userData.uid, data).catch((error) => {
                console.error('❌ Error saving gamification:', error);
            });
        }
    }, [userData, isGuest, gamification.level.totalXP]);



    const runGamificationChecks = useCallback((currentState: UserGamification, currentBalance: number) => {
        let finalState = currentState;
        let hasChanges = false;

        // 1. Check Achievements
        const { newState: stateWithAchievements, unlocked } = checkAndUnlockAchievements(finalState, currentBalance);
        if (unlocked.length > 0) {
            finalState = stateWithAchievements;
            hasChanges = true;
            unlocked.forEach(a => safeAddAchievement(a));
        }

        // 2. Check Endgame Missions Unlock
        const { newState: stateWithMissions, changed: missionsChanged } = ensureEndgameMissions(finalState);
        if (missionsChanged) {
            finalState = stateWithMissions;
            hasChanges = true;
        }

        if (hasChanges) {
            setGamification(finalState);
            saveGamification(finalState);
            // Sync with UserData if XP changed
            if (finalState.level.totalXP !== currentState.level.totalXP) {
                updateUserData({ totalScore: finalState.level.totalXP });
            }
        }
    }, [saveGamification, safeAddAchievement, updateUserData]);

    // Ref to track pending achievement checks
    const achievementCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timeout on unmount or user change
    useEffect(() => {
        return () => {
            if (achievementCheckTimeoutRef.current) {
                clearTimeout(achievementCheckTimeoutRef.current);
            }
        };
    }, []);

    const loadGamification = useCallback(async () => {
        setLoading(true);
        try {
            const currentUserData = userDataRef.current;

            if (isGuest) {
                const stored = localStorage.getItem(GUEST_GAMIFICATION_KEY);
                if (stored) {
                    let data = JSON.parse(stored);
                    const resetted = checkDailyAndWeeklyReset(data);
                    if (resetted) {
                        data = resetted;
                        localStorage.setItem(GUEST_GAMIFICATION_KEY, JSON.stringify(data));
                    }

                    // Streak Logic for Guest
                    const { newState: updatedData, changed, shieldUsed } = applyStreakUpdate(data, calculateStreak);
                    if (changed) {
                        data = updatedData;
                        localStorage.setItem(GUEST_GAMIFICATION_KEY, JSON.stringify(data));
                        if (shieldUsed) {
                            setMissionNotification({
                                title: '🛡️ Escudo de Streak Ativado! Seu streak de ofensivas foi protegido contra 1 dia de inatividade!',
                                rewards: { stars: 0, xp: 0 }
                            });
                        }
                    }

                    setGamification(data);
                }
            } else if (currentUserData) {
                const remoteData = await getGamification(currentUserData.uid);
                if (remoteData) {
                    let finalData = remoteData;
                    let hasUpdates = false;

                    const resetted = checkDailyAndWeeklyReset(remoteData);
                    if (resetted) {
                        finalData = resetted;
                        hasUpdates = true;
                    }

                    // --- MIGRATION: Sync Legacy Streak from UserData ---
                    const legacyUser = currentUserData as typeof currentUserData & LegacyStreakUserFields;
                    const legacyMigration = migrateLegacyStreak(finalData, legacyUser.streak, legacyUser.longestStreak, legacyUser.lastActiveDate);
                    if (legacyMigration.changed) {
                        finalData = legacyMigration.newState;
                        hasUpdates = true;
                    }

                    // --- STREAK LOGIC ---
                    const { newState: updatedFinalData, changed: streakChanged, shieldUsed: streakShieldUsed } = applyStreakUpdate(finalData, calculateStreak);
                    if (streakChanged) {
                        finalData = updatedFinalData;
                        hasUpdates = true;
                        if (streakShieldUsed) {
                            setMissionNotification({
                                title: '🛡️ Escudo de Streak Ativado! Seu streak de ofensivas foi protegido contra 1 dia de inatividade!',
                                rewards: { stars: 0, xp: 0 }
                            });
                        }
                    }

                    // --- PET MIGRATION ---
                    if (!finalData.pet) {
                        finalData.pet = getInitialPet();
                        hasUpdates = true;
                    } else {
                        // Update Pet Status (Hunger Decay)
                        const updatedPet = checkPetStatus(finalData.pet);
                        if (JSON.stringify(updatedPet) !== JSON.stringify(finalData.pet)) {
                            finalData.pet = updatedPet;
                            hasUpdates = true;
                        }
                    }

                    setGamification(finalData);

                    if (hasUpdates) {
                        try {
                            await saveGamificationWithFallback(currentUserData.uid, finalData);
                        } catch {
                            // Ignora silenciosamente no client
                        }
                    }

                    // Clear any existing timeout
                    if (achievementCheckTimeoutRef.current) {
                        clearTimeout(achievementCheckTimeoutRef.current);
                    }

                    // Schedule new check with SAFETY GUARD (zombie check)
                    achievementCheckTimeoutRef.current = setTimeout(() => {
                        // CRITICAL: Ensure we are still talking about the same user
                        // If userDataRef.current changed, it means user switched -> ABORT
                        if (userDataRef.current?.uid === currentUserData.uid) {
                            runGamificationChecks(finalData, currentUserData.balance || 0);
                        }
                    }, 100);
                } else {
                    // New user or no data: Start FRESH
                    const initial = getInitialGamification();

                    // --- MIGRATION: Sync Legacy Streak from UserData ---
                    const legacyUser = currentUserData as typeof currentUserData & LegacyStreakUserFields;
                    const { newState: initialWithLegacy } = migrateLegacyStreak(initial, legacyUser.streak, legacyUser.longestStreak, legacyUser.lastActiveDate);

                    setGamification(initialWithLegacy);
                    try {
                        await saveGamificationWithFallback(currentUserData.uid, initialWithLegacy);
                    } catch {
                        // Ignora
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error loading gamification:', error);
        } finally {
            setLoading(false);
        }
    }, [isGuest, runGamificationChecks]);

    // Load when user data is available (only once per user session)
    const hasLoadedRef = useRef<string | null>(null);
    useEffect(() => {
        const userId = userData?.uid || (isGuest ? 'guest' : null);
        if (userId && hasLoadedRef.current !== userId) {
            hasLoadedRef.current = userId;
            loadGamification();
        }
    }, [userData?.uid, isGuest, loadGamification]);


    // ============================================
    // ACTIONS
    // ============================================

    const recordQuestionCompleted = useCallback((
        passed: boolean,
        xpEarned: number = 10,
        responseTimeSeconds?: number,
        options?: { worldId?: string, starsEarned?: number, isBoss?: boolean, previousStars?: number, wasCompleted?: boolean }
    ) => {
        const {
            newState,
            levelUp,
            starsEarned,
            missionRewards,
            completedMissionTitles
        } = recordQuestionLogic(
            gamification,
            passed,
            xpEarned,
            { ...options, responseTimeSeconds }
        );

        // 1. Calculate Total Balance Update (Question + Missions)
        const totalStarsToAdd = starsEarned + (missionRewards?.stars || 0);

        // 2. Update UserData ONLY ONCE
        // Total Score is already calculated in newState.level.totalXP (includes question + mission XP)
        if (totalStarsToAdd > 0 || newState.level.totalXP !== gamification.level.totalXP) {
            updateUserData({
                balance: (userData?.balance || 0) + totalStarsToAdd,
                totalScore: newState.level.totalXP
            });
        }

        // 3. Handle Level Up
        if (levelUp) {
            setShowLevelUp(levelUp);
        }

        // 4. Check Achievements with NEW state and balance
        const newBalance = (userData?.balance || 0) + totalStarsToAdd;
        const { newState: stateWithAchievements, unlocked } = checkAndUnlockAchievements(newState, newBalance);
        const finalState = stateWithAchievements;
        unlocked.forEach(a => safeAddAchievement(a));

        // 5. Handle Mission Notifications (Auto-Claimed)
        if (completedMissionTitles && completedMissionTitles.length > 0) {
            completedMissionTitles.forEach(title => {
                setMissionNotification({
                    title,
                    rewards: missionRewards // Note: This shows AGGREGATE rewards if multiple complete at once.
                });
            });
        }

        setGamification(finalState);
        saveGamification(finalState);
    }, [gamification, userData, updateUserData, saveGamification, safeAddAchievement]);

    // ============================================
    // STUB FUNCTIONS (Compatibility)
    // ============================================

    const checkWorldAchievements = useCallback((worldId?: string, questionsCompleted?: number, totalQuestions?: number, mistakes: number = 0) => {
        let currentState = gamification;
        let hasUpdates = false;

        if (worldId && questionsCompleted !== undefined && totalQuestions !== undefined) {
            if (questionsCompleted === totalQuestions) {
                // 1. First World
                const r1 = unlockAchievementLogic(currentState, 'first_world');
                if (r1.success) {
                    currentState = r1.newState;
                    const a = ACHIEVEMENTS.find(x => x.id === 'first_world');
                    if (a) safeAddAchievement(a);
                }

                // 2. Perfect World
                if (mistakes === 0) {
                    const r2 = unlockAchievementLogic(currentState, 'perfect_world');
                    if (r2.success) {
                        currentState = r2.newState;
                        const a = ACHIEVEMENTS.find(x => x.id === 'perfect_world');
                        if (a) safeAddAchievement(a);
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
                if (a) safeAddAchievement(a);
            }
        }
        if (currentState.stats.worldsCompleted >= 5) {
            const r4 = unlockAchievementLogic(currentState, 'world_champion');
            if (r4.success) {
                currentState = r4.newState;
                hasUpdates = true;
                const a = ACHIEVEMENTS.find(x => x.id === 'world_champion');
                if (a) safeAddAchievement(a);
            }
        }

        // Check remaining global stats achievements + endgame missions
        const { newState: stateWithAchievements, unlocked } = checkAndUnlockAchievements(currentState, userData?.balance || 0);
        if (unlocked.length > 0) {
            currentState = stateWithAchievements;
            hasUpdates = true;
            unlocked.forEach(a => safeAddAchievement(a));
        }

        const { newState: stateWithMissions, changed: missionsChanged } = ensureEndgameMissions(currentState);
        if (missionsChanged) {
            currentState = stateWithMissions;
            hasUpdates = true;
        }

        if (worldId && questionsCompleted === totalQuestions) {
            // Trigger Mission Update for World Completion
            const mResult = updateMissionProgress(currentState, 'complete_world', 1, { worldId });
            // Handle Auto-Claim
            if (mResult.completedMissions.length > 0) {
                currentState = mResult.newState;
                hasUpdates = true;

                // Update User Data
                updateUserData({
                    balance: (userData?.balance || 0) + mResult.rewards.stars,
                    totalScore: currentState.level.totalXP
                });

                if (mResult.levelUp) setShowLevelUp(mResult.levelUp);

                mResult.completedMissions.forEach(m => {
                    setMissionNotification({
                        title: m,
                        rewards: { stars: mResult.rewards.stars, xp: mResult.rewards.xp }
                    });
                });
            }
        }

        if (hasUpdates) {
            setGamification(currentState);
            saveGamification(currentState);
        }
    }, [gamification, saveGamification, safeAddAchievement, updateUserData, userData]);

    // ============================================
    // RETURN
    // ============================================

    const currentLevel = useMemo(() => getLevelFromXP(gamification.level.totalXP), [gamification.level.totalXP]);
    const levelProgress = useMemo(() => getLevelProgress(gamification.level.totalXP), [gamification.level.totalXP]);
    const achievements = useMemo(() => ACHIEVEMENTS, []);
    const unlockedAchievements = useMemo(() => {
        return gamification.achievements
            .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
            .filter(Boolean) as Achievement[];
    }, [gamification.achievements]);

    // Hydrate missions (memoized)
    const { daily: dailyMissions, weekly: weeklyMissions } = useMemo(() => {
        return hydrateMissions(gamification.activeMissions || []);
    }, [gamification.activeMissions]);

    const buyShopItem = useCallback((itemId: string, price: number) => {
        const result = buyShopItemLogic(gamification, itemId, price, userData?.balance || 0);
        if (result.success) {
            // Check Fashionista/Personal Museum
            const { newState: finalState, unlocked } = checkAndUnlockAchievements(result.newState, (userData?.balance || 0) - price);
            unlocked.forEach(a => safeAddAchievement(a));

            setGamification(finalState);
            saveGamification(finalState);
            updateUserData({ balance: (userData?.balance || 0) - price });
            return true;
        }
        return false;
    }, [gamification, userData, saveGamification, updateUserData, safeAddAchievement]);

    const equipItem = useCallback((itemId: string, type: 'avatar' | 'frame' | 'title') => {
        setGamification(prev => {
            const newState = equipItemLogic(prev, itemId, type);
            saveGamification(newState);
            return newState;
        });
    }, [saveGamification]);

    const markAchievementSeen = useCallback((achievementId: string) => {
        const newState = markAchievementSeenLogic(gamification, achievementId);
        setGamification(newState);
        saveGamification(newState);
        setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
    }, [gamification, saveGamification]);

    const claimMissionReward = useCallback((missionId: string) => {
        const { success, newState, rewards, levelUp } = claimMissionRewardLogic(gamification, missionId);
        if (success) {
            updateUserData({
                balance: (userData?.balance || 0) + rewards.stars,
                totalScore: newState.level.totalXP
            });

            // Check Achievements (Magnata)
            const newBalance = (userData?.balance || 0) + rewards.stars;
            const { newState: finalState, unlocked } = checkAndUnlockAchievements(newState, newBalance);
            unlocked.forEach(a => safeAddAchievement(a));

            if (levelUp) setShowLevelUp(levelUp);
            setGamification(finalState);
            saveGamification(finalState);
        }
    }, [gamification, userData, updateUserData, saveGamification, safeAddAchievement]);

    const dismissLevelUp = useCallback(() => setShowLevelUp(null), []);

    const usePowerUp = useCallback((powerUpType: PowerUpType) => {
        const result = consumePowerUpLogic(gamification, powerUpType);
        if (result.success) {
            setGamification(result.newState);
            saveGamification(result.newState);
            return true;
        }
        return false;
    }, [gamification, saveGamification]);

    const buyPowerUp = useCallback((powerUpType: PowerUpType, price: number) => {
        const result = buyPowerUpLogic(gamification, powerUpType, price, userData?.balance || 0);
        if (result.success) {
            setGamification(result.newState);
            saveGamification(result.newState);
            updateUserData({ balance: (userData?.balance || 0) - price });
            return true;
        }
        return false;
    }, [gamification, userData, updateUserData, saveGamification]);

    const dismissMissionNotification = useCallback(() => setMissionNotification(null), []);

    const feedPetCallback = useCallback(() => {
        const COST = 10;
        const balance = userData?.balance || 0;

        if (balance < COST) return false;

        const currentPet = gamification.pet || getInitialPet();
        // Prevent feeding if full?
        if (currentPet.hunger >= 100) return false;

        const newPet = feedPet(currentPet);
        const newState = { ...gamification, pet: newPet };

        setGamification(newState);
        saveGamification(newState);
        updateUserData({ balance: balance - COST });
        return true;
    }, [gamification, userData, updateUserData, saveGamification]);

    const dismissPetEvolutionCallback = useCallback(() => {
        if (!gamification.pet) return;
        const newPet = { ...gamification.pet, justEvolved: false };
        const newState = { ...gamification, pet: newPet };
        setGamification(newState);
        saveGamification(newState);
    }, [gamification, saveGamification]);

    return useMemo(() => ({
        // State
        gamification,
        loading,
        currentLevel,
        levelProgress,
        streak: gamification.streak, // Source of truth is now gamification
        activeMissions: gamification?.activeMissions || [],
        inventory: gamification?.inventory,
        powerUps: gamification?.powerUps,
        userStars: userData?.balance || 0,

        // UI State
        showLevelUp,
        dailyMissions,
        weeklyMissions,

        // Achievements
        achievements,
        unlockedAchievements,
        newAchievements,

        // Actions
        recordQuestionCompleted,
        checkWorldAchievements,
        buyShopItem,
        equipItem,
        markAchievementSeen,
        claimMissionReward,
        dismissLevelUp,
        userPowerUps: gamification.powerUps,
        usePowerUp,
        buyPowerUp,
        missionNotification,
        dismissMissionNotification,

        // Pet
        pet: gamification.pet,
        feedPet: feedPetCallback,
        dismissPetEvolution: dismissPetEvolutionCallback,
    }), [
        gamification,
        loading,
        currentLevel,
        levelProgress,
        showLevelUp,
        dailyMissions,
        weeklyMissions,
        achievements,
        unlockedAchievements,
        newAchievements,
        recordQuestionCompleted,
        checkWorldAchievements,
        buyShopItem,
        equipItem,
        markAchievementSeen,
        claimMissionReward,
        dismissLevelUp,
        usePowerUp,
        buyPowerUp,
        missionNotification,
        dismissMissionNotification,
        feedPetCallback,
        dismissPetEvolutionCallback,
        userData?.balance
    ]);
}
