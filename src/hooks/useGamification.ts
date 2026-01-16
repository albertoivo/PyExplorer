import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    UserGamification,
    UserAchievement,
    Achievement,
    Mission,
} from '../types/gamification';
import {
    ACHIEVEMENTS,
    getLevelFromXP,
    getLevelProgress,
} from '../data/gamificationData';
import { useAuth } from './useAuth';
import { getGamification, saveGamificationData } from '../firebase/firestore';

// ============================================
// ESTADO INICIAL
// ============================================

function getInitialGamification(): UserGamification {
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
        },
    };
}

// ============================================
// HOOK
// ============================================

const GUEST_GAMIFICATION_KEY = 'pyexplorer_guest_gamification';

export function useGamification() {
    const { userData, isGuest } = useAuth();
    const [gamification, setGamification] = useState<UserGamification>(getInitialGamification);
    const [loading, setLoading] = useState(true);
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

    // ============================================
    // LOAD/SAVE
    // ============================================

    const loadGamification = useCallback(async () => {
        console.log('📥 Loading gamification data...');
        setLoading(true);
        try {
            if (isGuest) {
                const stored = localStorage.getItem(GUEST_GAMIFICATION_KEY);
                if (stored) {
                    setGamification(JSON.parse(stored));
                }
            } else if (userData) {
                const remoteData = await getGamification(userData.uid);
                if (remoteData) {
                    console.log('✅ Loaded from Firestore:', {
                        achievements: remoteData.achievements.length,
                        totalCompleted: remoteData.stats.totalQuestionsCompleted
                    });
                    setGamification(remoteData);
                } else {
                    console.log('⚠️ No data in Firestore, using initial state');
                }
            }
        } catch (error) {
            console.error('❌ Error loading gamification:', error);
        } finally {
            setLoading(false);
        }
    }, [userData, isGuest]);

    const saveGamification = useCallback((data: UserGamification) => {
        console.log('💾 Saving gamification:', {
            achievements: data.achievements.length,
            totalCompleted: data.stats.totalQuestionsCompleted
        });

        if (isGuest) {
            localStorage.setItem(GUEST_GAMIFICATION_KEY, JSON.stringify(data));
        } else if (userData) {
            localStorage.setItem(`gamification_${userData.uid}`, JSON.stringify(data));
            saveGamificationData(userData.uid, data).catch(err => {
                console.error('❌ Error saving to Firestore:', err);
            });
        }
    }, [userData, isGuest]);

    // Load once on mount - no dependencies to avoid re-running
    useEffect(() => {
        loadGamification();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run on mount

    // ============================================
    // ACHIEVEMENTS
    // ============================================

    const unlockAchievement = useCallback((achievementId: string) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;

        setGamification(prev => {
            // Check if already unlocked
            if (prev.achievements.some(ua => ua.achievementId === achievementId)) {
                return prev;
            }

            const userAchievement: UserAchievement = {
                achievementId,
                unlockedAt: new Date(),
                seen: false,
            };

            const updated = {
                ...prev,
                achievements: [...prev.achievements, userAchievement],
            };

            console.log(`🏆 Achievement unlocked: ${achievement.name}`);
            saveGamification(updated);
            setNewAchievements(p => [...p, achievement]);

            return updated;
        });
    }, [saveGamification]);

    const checkQuestionAchievements = useCallback((totalCompleted: number, consecutiveCorrect: number) => {
        if (totalCompleted >= 1) unlockAchievement('first_question');
        if (totalCompleted >= 10) unlockAchievement('persistent');
        if (totalCompleted >= 50) unlockAchievement('dedicated');
        if (totalCompleted >= 100) unlockAchievement('centurion');
        if (consecutiveCorrect >= 5) unlockAchievement('perfect_5');
        if (consecutiveCorrect >= 10) unlockAchievement('perfect_10');
    }, [unlockAchievement]);

    // ============================================
    // RECORD QUESTION COMPLETED
    // ============================================

    const recordQuestionCompleted = useCallback((
        passed: boolean,
        xpEarned: number = 10,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _responseTimeSeconds?: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _options?: { worldId?: string, starsEarned?: number }
    ) => {
        setGamification(prev => {
            const newConsecutive = passed ? (prev.stats.consecutiveCorrect || 0) + 1 : 0;
            const newBestConsecutive = Math.max(prev.stats.bestConsecutiveCorrect || 0, newConsecutive);

            const updated = {
                ...prev,
                level: {
                    ...prev.level,
                    currentXP: prev.level.currentXP + xpEarned,
                    totalXP: prev.level.totalXP + xpEarned,
                },
                stats: {
                    ...prev.stats,
                    totalQuestionsCompleted: prev.stats.totalQuestionsCompleted + 1,
                    totalCorrectAnswers: passed ? prev.stats.totalCorrectAnswers + 1 : prev.stats.totalCorrectAnswers,
                    consecutiveCorrect: newConsecutive,
                    bestConsecutiveCorrect: newBestConsecutive,
                },
            };

            console.log('📝 Question completed:', {
                totalCompleted: updated.stats.totalQuestionsCompleted,
                consecutiveCorrect: updated.stats.consecutiveCorrect
            });

            saveGamification(updated);
            checkQuestionAchievements(updated.stats.totalQuestionsCompleted, newConsecutive);

            return updated;
        });
    }, [saveGamification, checkQuestionAchievements]);

    // ============================================
    // COMPUTED VALUES
    // ============================================

    const currentLevel = useMemo(() => getLevelFromXP(gamification.level.totalXP), [gamification.level.totalXP]);
    const levelProgress = useMemo(() => getLevelProgress(gamification.level.totalXP), [gamification.level.totalXP]);

    const achievements = useMemo(() => ACHIEVEMENTS, []);
    const unlockedAchievements = useMemo(() => {
        return gamification.achievements
            .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
            .filter(Boolean) as Achievement[];
    }, [gamification.achievements]);

    // ============================================
    // STUB FUNCTIONS (to maintain compatibility)
    // ============================================

    const checkWorldAchievements = useCallback(() => {
        // Stub - implement later if needed
    }, []);

    const recalculateAllAchievements = useCallback(() => {
        const stats = gamification.stats;
        checkQuestionAchievements(stats.totalQuestionsCompleted, stats.consecutiveCorrect);
    }, [gamification.stats, checkQuestionAchievements]);

    // ============================================
    // RETURN
    // ============================================

    return {
        // State
        gamification,
        loading,
        currentLevel,
        levelProgress,
        streak: {
            currentStreak: userData?.streak || 0,
            longestStreak: userData?.streak || 0, // TODO: Add separate field for longestStreak in userData
            lastActivityDate: userData?.lastActiveDate || '',
            activityHistory: (() => {
                // Gera histórico de atividades baseado no streak atual
                const history: string[] = [];
                const currentStreak = userData?.streak || 0;
                const today = new Date();

                // Adiciona os últimos N dias baseado no streak
                for (let i = 0; i < currentStreak; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    history.push(date.toISOString().split('T')[0]);
                }

                return history;
            })(),
        },
        activeMissions: gamification.activeMissions,
        inventory: gamification.inventory,
        powerUps: gamification.powerUps,

        // UI State
        showLevelUp: null,
        dailyMissions: [] as Mission[],
        weeklyMissions: [] as Mission[],

        // Achievements
        achievements,
        unlockedAchievements,
        newAchievements,

        // Actions
        recordQuestionCompleted,
        checkWorldAchievements,
        recalculateAllAchievements,

        // Stubs
        markAchievementSeen: () => { },
        equipItem: () => { },
        buyShopItem: () => false, // Returns boolean to match expected signature
        claimMissionReward: () => { },
        dismissLevelUp: () => { },
        userPowerUps: gamification.powerUps,
        usePowerUp: () => false, // Returns boolean to match expected signature
        buyPowerUp: () => false, // Returns boolean to match expected signature
    };
}
