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
    checkAchievementsLogic,
    unlockAchievementLogic,
    markAchievementSeenLogic,
    updateMissionProgress,
    hydrateMissions
} from '../utils/gamificationState';

// ============================================
// HOOK
// ============================================

const GUEST_GAMIFICATION_KEY = 'pyexplorer_guest_gamification';

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



    const runAchievementChecks = useCallback((currentState: UserGamification, currentBalance: number) => {
        const unlockedIds = checkAchievementsLogic(currentState, currentBalance);

        // Process new unlocks
        let finalState = currentState;
        let hasChanges = false;

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
                    setGamification(data);
                }
            } else if (currentUserData) {
                const remoteData = await getGamification(currentUserData.uid);
                if (remoteData) {
                    let finalData = remoteData;
                    const resetted = checkDailyAndWeeklyReset(remoteData);
                    if (resetted) {
                        finalData = resetted;
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
                            runAchievementChecks(finalData, currentUserData.balance || 0);
                        } else {
                            console.log('🛑 Aborting runAchievementChecks: User switched from', currentUserData.uid, 'to', userDataRef.current?.uid);
                        }
                    }, 100);
                } else {
                    // New user or no data: Start FRESH
                    console.log('✨ New user detected, initializing gamification...');
                    const initial = getInitialGamification();
                    setGamification(initial);
                    await saveGamificationData(currentUserData.uid, initial);
                }
            }
        } catch (error) {
            console.error('❌ Error loading gamification:', error);
        } finally {
            setLoading(false);
        }
    }, [isGuest, runAchievementChecks]);

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
        options?: { worldId?: string, starsEarned?: number, isBoss?: boolean }
    ) => {
        const { newState, levelUp, starsEarned } = recordQuestionLogic(
            gamification,
            passed,
            xpEarned,
            { ...options, responseTimeSeconds }
        );

        if (starsEarned > 0) {
            updateUserData({
                balance: (userData?.balance || 0) + starsEarned,
                totalScore: newState.level.totalXP // Sync Score with XP
            });
        } else {
            // Even if no stars, update XP/Score
            updateUserData({ totalScore: newState.level.totalXP });
        }

        if (levelUp) {
            console.log(`🎉 Level Up! ${levelUp.level}`);
            setShowLevelUp(levelUp);
        }

        // Check achievements with NEW state
        const newBalance = (userData?.balance || 0) + starsEarned;

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

        // Update Missions Progress
        let missionsState = finalState;

        // 1. Complete Questions
        let mResult = updateMissionProgress(missionsState, 'complete_questions', 1, { worldId: options?.worldId });
        missionsState = mResult.newState;
        mResult.completedMissions.forEach(m => console.log(`✅ Mission Completed: ${m}`));

        // 2. Correct Streak (pass the current streak as amount)
        if (passed) {
            mResult = updateMissionProgress(missionsState, 'correct_streak', missionsState.stats.consecutiveCorrect);
            missionsState = mResult.newState;
            mResult.completedMissions.forEach(m => console.log(`✅ Mission Completed: ${m}`));
        }

        // 3. Earn Stars
        if (starsEarned > 0) {
            mResult = updateMissionProgress(missionsState, 'earn_stars', starsEarned);
            missionsState = mResult.newState;
            mResult.completedMissions.forEach(m => console.log(`✅ Mission Completed: ${m}`));
        }

        // 4. Complete World

        // Check if world was just completed?
        // Simple check: if question completed implies world completed logic?
        // We can check if `stats.worldsCompleted` changed? Difficult without diff.
        // Or just trigger 'complete_world' event if we know it happened details.
        // For now, let's rely on world completion being rare.
        // We can check if `checkWorldAchievements` was triggered? 
        // Actually, `checkWorldAchievements` is a separate call in QuestionEngine.
        // So we should add mission update THERE too or make recordQuestion handle it more smartly.
        // But `recordQuestion` doesn't know if World is finished.
        // Let's leave 'complete_world' for `checkWorldAchievements`.

        setGamification(missionsState);
        saveGamification(missionsState);
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
                    hasUpdates = true;
                    // Note: safeAddAchievement is side effect, can call immediately
                    const a = ACHIEVEMENTS.find(x => x.id === 'first_world');
                    if (a) safeAddAchievement(a);
                }

                // 2. Perfect World
                if (mistakes === 0) {
                    const r2 = unlockAchievementLogic(currentState, 'perfect_world');
                    if (r2.success) {
                        currentState = r2.newState;
                        hasUpdates = true;
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
            if (mResult.completedMissions.length > 0) {
                currentState = mResult.newState;
                hasUpdates = true;
                mResult.completedMissions.forEach(m => console.log(`✅ Mission Completed: ${m}`));
            }
        }

        if (hasUpdates) {
            setGamification(currentState);
            saveGamification(currentState);
        }
    }, [gamification, saveGamification, safeAddAchievement]);

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

    return {
        // State
        gamification,
        loading,
        currentLevel,
        levelProgress,
        streak: {
            currentStreak: userData?.streak || 0,
            longestStreak: userData?.longestStreak || userData?.streak || 0,
            lastActivityDate: userData?.lastActiveDate || '',
            activityHistory: gamification?.streak?.activityHistory || [],
        },
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

        buyShopItem: useCallback((itemId: string, price: number) => {
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
        }, [gamification, userData, saveGamification, updateUserData, safeAddAchievement]),

        equipItem: useCallback((itemId: string, type: 'avatar' | 'frame' | 'title') => {
            // Use ref to get latest state (avoids stale closure from setTimeout in AvatarShop)
            const currentState = gamificationRef.current;
            const newState = equipItemLogic(currentState, itemId, type);
            setGamification(newState);
            saveGamification(newState);
        }, [saveGamification]),

        markAchievementSeen: useCallback((achievementId: string) => {
            const newState = markAchievementSeenLogic(gamification, achievementId);
            setGamification(newState);
            saveGamification(newState);
            setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
        }, [gamification, saveGamification]),

        claimMissionReward: useCallback((missionId: string) => {
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
        }, [gamification, userData, updateUserData, saveGamification, safeAddAchievement]),

        dismissLevelUp: useCallback(() => setShowLevelUp(null), []),

        userPowerUps: gamification.powerUps,

        usePowerUp: useCallback((powerUpType: PowerUpType) => {
            const result = consumePowerUpLogic(gamification, powerUpType);
            if (result.success) {
                setGamification(result.newState);
                console.log(`✅ Power-up usado: ${powerUpType}`);
                saveGamification(result.newState);
                return true;
            }
            return false;
        }, [gamification, saveGamification]),

        buyPowerUp: useCallback((powerUpType: PowerUpType, price: number) => {
            const result = buyPowerUpLogic(gamification, powerUpType, price, userData?.balance || 0);
            if (result.success) {
                setGamification(result.newState);
                console.log(`✅ Power-up comprado: ${powerUpType}`);
                saveGamification(result.newState);
                updateUserData({ balance: (userData?.balance || 0) - price });
                return true;
            }
            return false;
        }, [gamification, userData, updateUserData, saveGamification]),
    };
}
