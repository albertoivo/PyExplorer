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
    ENDGAME_MISSIONS,
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
    checkAchievementsLogic,
    unlockAchievementLogic,
    markAchievementSeenLogic,
    updateMissionProgress,
    hydrateMissions
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

export function useGamification() {
    const { userData, isGuest, updateUserData } = useAuth();
    const [gamification, setGamification] = useState<UserGamification>(getInitialGamification);

    // Ref to always have latest gamification state (avoids stale closures in callbacks)
    const gamificationRef = useRef(gamification);
    useEffect(() => {
        gamificationRef.current = gamification;
    }, [gamification]);

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
            saveGamificationData(userData.uid, data).catch(console.error);
        }
    }, [userData, isGuest, gamification.level.totalXP]);



    const runGamificationChecks = useCallback((currentState: UserGamification, currentBalance: number) => {
        let finalState = currentState;
        let hasChanges = false;

        // 1. Check Achievements
        const unlockedIds = checkAchievementsLogic(finalState, currentBalance);
        unlockedIds.forEach(id => {
            const result = unlockAchievementLogic(finalState, id);
            if (result.success) {
                finalState = result.newState;
                hasChanges = true;
                const achievement = ACHIEVEMENTS.find(a => a.id === id);
                if (achievement) safeAddAchievement(achievement);
                console.log(`🏆 Achievement unlocked: ${achievement?.name}`);
            }
        });

        // 2. Check Endgame Missions Unlock
        if (finalState.stats.worldsCompleted >= 1) {
            const hasEndgameMissions = finalState.activeMissions.some(m => m.missionId.startsWith('endgame_'));
            if (!hasEndgameMissions) {
                const newMissions = ENDGAME_MISSIONS.map((m, idx) => ({
                    ...m,
                    id: `endgame_${m.objectiveType}_${idx}`
                }));

                const newActiveMissions = [
                    ...finalState.activeMissions,
                    ...newMissions.map(m => ({
                        missionId: m.id,
                        progress: 0,
                        status: 'active' as const,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    }))
                ];

                finalState = {
                    ...finalState,
                    activeMissions: newActiveMissions
                };
                hasChanges = true;
                console.log('🔓 Endgame missions unlocked!');
            }
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
        console.log('📥 Loading gamification data...');
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
                    const streakResult = calculateStreak(
                        data.streak?.currentStreak || 0,
                        data.streak?.longestStreak || 0,
                        data.streak?.lastActivityDate
                    );

                    if (streakResult.shouldUpdate) {
                         data = {
                            ...data,
                            streak: {
                                currentStreak: streakResult.streak,
                                longestStreak: streakResult.longestStreak,
                                lastActivityDate: streakResult.lastActiveDate,
                                activityHistory: [...(data.streak?.activityHistory || []), streakResult.lastActiveDate]
                            }
                        };
                        localStorage.setItem(GUEST_GAMIFICATION_KEY, JSON.stringify(data));
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
                    if (legacyUser.streak && (!finalData.streak.currentStreak || legacyUser.streak > finalData.streak.currentStreak)) {
                        console.log('🔄 Migrating streak from UserData to Gamification');
                        finalData = {
                            ...finalData,
                            streak: {
                                ...finalData.streak,
                                currentStreak: legacyUser.streak || 0,
                                longestStreak: Math.max(legacyUser.longestStreak || 0, finalData.streak.longestStreak),
                                lastActivityDate: legacyUser.lastActiveDate || finalData.streak.lastActivityDate
                            }
                        };
                        hasUpdates = true;
                    }

                    // --- STREAK LOGIC ---
                    const streakResult = calculateStreak(
                        finalData.streak.currentStreak,
                        finalData.streak.longestStreak,
                        finalData.streak.lastActivityDate
                    );

                    if (streakResult.shouldUpdate) {
                        console.log('🔥 Updating streak logic in Gamification');
                        finalData = {
                            ...finalData,
                            streak: {
                                currentStreak: streakResult.streak,
                                longestStreak: streakResult.longestStreak,
                                lastActivityDate: streakResult.lastActiveDate,
                                activityHistory: [...(finalData.streak.activityHistory || []), streakResult.lastActiveDate]
                            }
                        };
                        hasUpdates = true;
                    }

                    // --- PET MIGRATION ---
                    if (!finalData.pet) {
                        console.log('🥚 Initializing Pet for existing user');
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

                    if (hasUpdates) {
                        await saveGamificationData(currentUserData.uid, finalData);
                    }

                    setGamification(finalData);

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
                        } else {
                            console.log('🛑 Aborting runGamificationChecks: User switched from', currentUserData.uid, 'to', userDataRef.current?.uid);
                        }
                    }, 100);
                } else {
                    // New user or no data: Start FRESH
                    console.log('✨ New user detected, initializing gamification...');
                    const initial = getInitialGamification();

                    // --- MIGRATION: Sync Legacy Streak from UserData ---
                    const legacyUser = currentUserData as typeof currentUserData & LegacyStreakUserFields;
                    if (legacyUser.streak && legacyUser.streak > 0) {
                        console.log('🔄 Migrating streak from UserData to New Gamification');
                        initial.streak = {
                            ...initial.streak,
                            currentStreak: legacyUser.streak,
                            longestStreak: Math.max(legacyUser.longestStreak || 0, initial.streak.longestStreak),
                            lastActivityDate: legacyUser.lastActiveDate || initial.streak.lastActivityDate
                        };
                    }

                    setGamification(initial);
                    await saveGamificationData(currentUserData.uid, initial);
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
        options?: { worldId?: string, starsEarned?: number, isBoss?: boolean, previousStars?: number }
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
            console.log(`🎉 Level Up! ${levelUp.level}`);
            setShowLevelUp(levelUp);
        }

        // 4. Check Achievements with NEW state and balance
        const newBalance = (userData?.balance || 0) + totalStarsToAdd;
        const unlockedIds = checkAchievementsLogic(newState, newBalance);
        let finalState = newState;

        unlockedIds.forEach(id => {
            const result = unlockAchievementLogic(finalState, id);
            if (result.success) {
                finalState = result.newState;
                const achievement = ACHIEVEMENTS.find(a => a.id === id);
                if (achievement) safeAddAchievement(achievement);
            }
        });

        // 5. Handle Mission Notifications (Auto-Claimed)
        if (completedMissionTitles && completedMissionTitles.length > 0) {
            completedMissionTitles.forEach(title => {
                console.log(`✅ Mission Completed (Auto-Claimed): ${title}`);
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
                // Manually duplicate logic from unlockAchievement to compose state updates
                // Or just trust the final state?
                // We need to sequence these updates. 
                // Best is to mutate a temp state object or chain function calls.
                // Since update logic is simple, I'll allow chained updates.

                // 1. First World
                const r1 = unlockAchievementLogic(currentState, 'first_world');
                if (r1.success) {
                    currentState = r1.newState;
                    // Note: safeAddAchievement is side effect, can call immediately
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

        // Also check global stats
        if (currentState.stats.worldsCompleted >= 1) {
            const r3 = unlockAchievementLogic(currentState, 'world_master');
            if (r3.success) {
                currentState = r3.newState;
                hasUpdates = true;
                const a = ACHIEVEMENTS.find(x => x.id === 'world_master');
                if (a) safeAddAchievement(a);
            }

            // --- ENDGAME MISSIONS UNLOCK LOGIC ---
            // If user completed at least 1 world, ensure they have Endgame Missions available
            // We duplicate logic here for immediate feedback, or ideally delegate to runGamificationChecks?
            // Since we can't call hook from hook easily without useEffect loop, we keep logic here.
            const hasEndgameMissions = currentState.activeMissions.some(m => m.missionId.startsWith('endgame_'));
            if (!hasEndgameMissions) {
                const newMissions = ENDGAME_MISSIONS.map((m, idx) => ({
                    ...m,
                    id: `endgame_${m.objectiveType}_${idx}`
                }));

                const newActiveMissions = [
                    ...currentState.activeMissions,
                    ...newMissions.map(m => ({
                        missionId: m.id,
                        progress: 0,
                        status: 'active' as const,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    }))
                ];

                currentState = {
                    ...currentState,
                    activeMissions: newActiveMissions
                };
                hasUpdates = true;
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
                    console.log(`✅ Mission Completed (Auto-Claimed): ${m}`);
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
            let finalState = result.newState;
            // Check Fashionista/Personal Museum
            const unlockedIds = checkAchievementsLogic(finalState, (userData?.balance || 0) - price);
            unlockedIds.forEach(id => {
                const r = unlockAchievementLogic(finalState, id);
                if (r.success) {
                    finalState = r.newState;
                    const a = ACHIEVEMENTS.find(x => x.id === id);
                    if (a) safeAddAchievement(a);
                }
            });

            setGamification(finalState);
            saveGamification(finalState);
            updateUserData({ balance: (userData?.balance || 0) - price });
            return true;
        }
        return false;
    }, [gamification, userData, saveGamification, updateUserData, safeAddAchievement]);

    const equipItem = useCallback((itemId: string, type: 'avatar' | 'frame' | 'title') => {
        // Use ref to get latest state (avoids stale closure from setTimeout in AvatarShop)
        const currentState = gamificationRef.current;
        const newState = equipItemLogic(currentState, itemId, type);
        setGamification(newState);
        saveGamification(newState);
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
            const unlockedIds = checkAchievementsLogic(newState, newBalance);
            let finalState = newState;
            unlockedIds.forEach(id => {
                const r = unlockAchievementLogic(finalState, id);
                if (r.success) {
                    finalState = r.newState;
                    const a = ACHIEVEMENTS.find(x => x.id === id);
                    if (a) safeAddAchievement(a);
                }
            });

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
            console.log(`✅ Power-up usado: ${powerUpType}`);
            saveGamification(result.newState);
            return true;
        }
        return false;
    }, [gamification, saveGamification]);

    const buyPowerUp = useCallback((powerUpType: PowerUpType, price: number) => {
        const result = buyPowerUpLogic(gamification, powerUpType, price, userData?.balance || 0);
        if (result.success) {
            setGamification(result.newState);
            console.log(`✅ Power-up comprado: ${powerUpType}`);
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
    ]);
}
