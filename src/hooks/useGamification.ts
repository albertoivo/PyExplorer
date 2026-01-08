import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    UserGamification,
    UserAchievement,
    UserMission,
    PowerUpType,
    Achievement,
    LevelInfo,
} from '../types/gamification';
import {
    ACHIEVEMENTS,
    POWERUPS,
    getLevelFromXP,
    getLevelProgress,
    generateDailyMissions,
    generateWeeklyMissions,
} from '../data/gamificationData';
import { useAuth } from './useAuth';
import { getGamification, saveGamificationData } from '../firebase/firestore';

// Chaves do localStorage para convidados
const GUEST_GAMIFICATION_KEY = 'pyexplorer_guest_gamification';

/**
 * Estado inicial de gamificação para novos usuários
 */
function getInitialGamification(): UserGamification {
    const today = new Date().toISOString().split('T')[0];

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
            lastResetDate: today,
        },
        stats: {
            totalQuestionsCompleted: 0,
            totalCorrectAnswers: 0,
            totalPlayTime: 0,
            worldsCompleted: 0,
            perfectWorlds: 0,
        },
    };
}

/**
 * Converte dados do storage (onde datas são strings) para objetos Date
 */
function parseGamificationFromStorage(json: string): UserGamification {
    const data = JSON.parse(json);

    return {
        ...data,
        achievements: (data.achievements || []).map((a: UserAchievement) => ({
            ...a,
            unlockedAt: new Date(a.unlockedAt),
        })),
        activeMissions: (data.activeMissions || []).map((m: UserMission) => ({
            ...m,
            expiresAt: new Date(m.expiresAt),
            completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
        })),
    } as UserGamification;
}

/**
 * Hook principal de gamificação
 */
export function useGamification() {
    const { userData, isGuest, updateUserData } = useAuth();
    const [gamification, setGamification] = useState<UserGamification>(getInitialGamification);
    const [loading, setLoading] = useState(true);
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
    const [showLevelUp, setShowLevelUp] = useState<LevelInfo | null>(null);

    // Carrega dados de gamificação
    useEffect(() => {
        loadGamification();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, isGuest]);

    /**
     * Carrega dados de gamificação do storage
     */
    const loadGamification = useCallback(async () => {
        setLoading(true);
        try {
            if (isGuest) {
                const stored = localStorage.getItem(GUEST_GAMIFICATION_KEY);
                if (stored) {
                    setGamification(parseGamificationFromStorage(stored));
                } else {
                    setGamification(getInitialGamification());
                }
            } else if (userData) {
                let loaded = false;

                // Tenta carregar do Firestore
                try {
                    const remoteData = await getGamification(userData.uid);
                    if (remoteData) {
                        setGamification(remoteData);
                        loaded = true;
                    }
                } catch (err) {
                    console.error('Erro ao buscar gamificação do Firestore:', err);
                }

                // Se não carregou do Firestore (erro ou não existe), tenta carregar do localStorage (migração/offline)
                if (!loaded) {
                    const stored = localStorage.getItem(`gamification_${userData.uid}`);
                    if (stored) {
                        setGamification(parseGamificationFromStorage(stored));
                    } else {
                        setGamification(getInitialGamification());
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar gamificação:', error);
        } finally {
            setLoading(false);
        }
    }, [userData, isGuest]);

    /**
     * Salva dados de gamificação
     */
    const saveGamification = useCallback((data: UserGamification) => {
        try {
            if (isGuest) {
                localStorage.setItem(GUEST_GAMIFICATION_KEY, JSON.stringify(data));
            } else if (userData) {
                // Salva localmente
                localStorage.setItem(`gamification_${userData.uid}`, JSON.stringify(data));

                // Salva no Firestore
                saveGamificationData(userData.uid, data).catch(err => {
                    console.error('Erro ao salvar gamificação no Firestore:', err);
                });
            }
        } catch (error) {
            console.error('Erro ao salvar gamificação:', error);
        }
    }, [userData, isGuest]);

    // ============================================
    // XP E NÍVEIS
    // ============================================

    const currentLevel = useMemo(() => getLevelFromXP(gamification.level.totalXP), [gamification.level.totalXP]);
    const levelProgress = useMemo(() => getLevelProgress(gamification.level.totalXP), [gamification.level.totalXP]);
    const xpToNextLevel = useMemo(() => {
        if (currentLevel.maxXP === Infinity) return 0;
        return currentLevel.maxXP - gamification.level.totalXP;
    }, [currentLevel, gamification.level.totalXP]);

    /**
     * Adiciona XP ao usuário
     */
    const addXP = useCallback((amount: number) => {
        setGamification(prev => {
            const newTotalXP = prev.level.totalXP + amount;
            const oldLevel = getLevelFromXP(prev.level.totalXP);
            const newLevel = getLevelFromXP(newTotalXP);

            // Verifica se subiu de nível
            if (newLevel.level > oldLevel.level) {
                setShowLevelUp(newLevel);

                // Aplica recompensas do novo nível
                if (newLevel.rewards?.stars && userData) {
                    updateUserData({ totalScore: userData.totalScore + newLevel.rewards.stars });
                }
            }

            const updated = {
                ...prev,
                level: {
                    level: newLevel.level,
                    currentXP: newTotalXP - newLevel.minXP,
                    totalXP: newTotalXP,
                },
            };

            saveGamification(updated);
            return updated;
        });
    }, [saveGamification, userData, updateUserData]);

    // ============================================
    // CONQUISTAS
    // ============================================

    const unlockedAchievements = useMemo(() => {
        return gamification.achievements.map(ua =>
            ACHIEVEMENTS.find(a => a.id === ua.achievementId)
        ).filter(Boolean) as Achievement[];
    }, [gamification.achievements]);

    /**
     * Desbloqueia uma conquista
     */
    const unlockAchievement = useCallback((achievementId: string) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;

        // Verifica se já tem a conquista
        if (gamification.achievements.some(ua => ua.achievementId === achievementId)) {
            return;
        }

        const userAchievement: UserAchievement = {
            achievementId,
            unlockedAt: new Date(),
            seen: false,
        };

        setGamification(prev => {
            const updated = {
                ...prev,
                achievements: [...prev.achievements, userAchievement],
            };
            saveGamification(updated);
            return updated;
        });

        // Adiciona XP e estrelas
        addXP(achievement.xpReward);
        if (achievement.starsReward > 0 && userData) {
            updateUserData({ totalScore: userData.totalScore + achievement.starsReward });
        }

        // Notifica o usuário
        setNewAchievements(prev => [...prev, achievement]);
    }, [gamification.achievements, addXP, userData, updateUserData, saveGamification]);

    /**
     * Verifica conquistas de streak
     */
    const checkStreakAchievements = useCallback((streak: number) => {
        if (streak >= 3) unlockAchievement('streak_3');
        if (streak >= 7) unlockAchievement('streak_7');
        if (streak >= 30) unlockAchievement('streak_30');
        if (streak >= 100) unlockAchievement('streak_100');
    }, [unlockAchievement]);

    // ============================================
    // STREAK
    // ============================================

    /**
     * Registra atividade diária e atualiza streak
     */
    const recordDailyActivity = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];

        setGamification(prev => {
            const { lastActivityDate, currentStreak, longestStreak, activityHistory } = prev.streak;

            // Se já registrou hoje, não faz nada
            if (lastActivityDate === today) {
                return prev;
            }

            // Calcula diferença de dias
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let newStreak = currentStreak;

            if (lastActivityDate === yesterdayStr) {
                // Continuou o streak
                newStreak = currentStreak + 1;
            } else if (lastActivityDate === '') {
                // Primeira atividade
                newStreak = 1;
            } else {
                // Perdeu o streak
                newStreak = 1;
            }

            // Atualiza histórico (últimos 30 dias)
            const newHistory = [...activityHistory, today].slice(-30);

            const updated = {
                ...prev,
                streak: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(longestStreak, newStreak),
                    lastActivityDate: today,
                    activityHistory: newHistory,
                },
            };

            saveGamification(updated);

            // Verifica conquistas de streak
            checkStreakAchievements(newStreak);

            return updated;
        });
    }, [saveGamification, checkStreakAchievements]);

    /**
     * Verifica conquistas baseadas em questões
     */
    const checkQuestionAchievements = useCallback((totalCompleted: number, consecutiveCorrect: number) => {
        // Questões completadas
        if (totalCompleted >= 1) unlockAchievement('first_question');
        if (totalCompleted >= 10) unlockAchievement('ten_questions');
        if (totalCompleted >= 50) unlockAchievement('fifty_questions');
        if (totalCompleted >= 100) unlockAchievement('hundred_questions');

        // Acertos consecutivos
        if (consecutiveCorrect >= 5) unlockAchievement('perfect_5');
        if (consecutiveCorrect >= 10) unlockAchievement('perfect_10');
        if (consecutiveCorrect >= 25) unlockAchievement('perfect_25');
    }, [unlockAchievement]);

    /**
     * Marca conquista como vista
     */
    const markAchievementSeen = useCallback((achievementId: string) => {
        setGamification(prev => {
            const updated = {
                ...prev,
                achievements: prev.achievements.map(ua =>
                    ua.achievementId === achievementId ? { ...ua, seen: true } : ua
                ),
            };
            saveGamification(updated);
            return updated;
        });
        setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
    }, [saveGamification]);

    // ============================================
    // MISSÕES
    // ============================================

    const dailyMissions = useMemo(() => generateDailyMissions(new Date()), []);
    const weeklyMissions = useMemo(() => generateWeeklyMissions(new Date()), []);

    const activeMissions = useMemo(() => {
        return gamification.activeMissions.filter(m => m.status !== 'claimed');
    }, [gamification.activeMissions]);

    /**
     * Inicializa missões do dia/semana
     */
    const initializeMissions = useCallback(() => {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        const newMissions: UserMission[] = [];

        // Adiciona missões diárias
        for (const mission of dailyMissions) {
            if (!gamification.activeMissions.some(m => m.missionId === mission.id)) {
                newMissions.push({
                    missionId: mission.id,
                    progress: 0,
                    status: 'active',
                    expiresAt: endOfDay,
                });
            }
        }

        // Adiciona missões semanais
        for (const mission of weeklyMissions) {
            if (!gamification.activeMissions.some(m => m.missionId === mission.id)) {
                newMissions.push({
                    missionId: mission.id,
                    progress: 0,
                    status: 'active',
                    expiresAt: endOfWeek,
                });
            }
        }

        if (newMissions.length > 0) {
            setGamification(prev => {
                const updated = {
                    ...prev,
                    activeMissions: [...prev.activeMissions, ...newMissions],
                };
                saveGamification(updated);
                return updated;
            });
        }
    }, [dailyMissions, weeklyMissions, gamification.activeMissions, saveGamification]);

    /**
     * Atualiza progresso de uma missão
     */
    const updateMissionProgress = useCallback((missionId: string, progress: number) => {
        const allMissions = [...dailyMissions, ...weeklyMissions];
        const mission = allMissions.find(m => m.id === missionId);
        if (!mission) return;

        setGamification(prev => {
            const missions = prev.activeMissions.map(m => {
                if (m.missionId === missionId && m.status === 'active') {
                    const newProgress = Math.min(progress, mission.targetValue);
                    const completed = newProgress >= mission.targetValue;
                    return {
                        ...m,
                        progress: newProgress,
                        status: completed ? 'completed' as const : 'active' as const,
                        completedAt: completed ? new Date() : undefined,
                    };
                }
                return m;
            });

            const updated = { ...prev, activeMissions: missions };
            saveGamification(updated);
            return updated;
        });
    }, [dailyMissions, weeklyMissions, saveGamification]);

    /**
     * Reivindica recompensas de uma missão completa
     */
    const claimMissionReward = useCallback((missionId: string) => {
        const allMissions = [...dailyMissions, ...weeklyMissions];
        const mission = allMissions.find(m => m.id === missionId);
        const userMission = gamification.activeMissions.find(m => m.missionId === missionId);

        if (!mission || !userMission || userMission.status !== 'completed') return;

        // Dá as recompensas
        addXP(mission.xpReward);
        if (mission.starsReward > 0 && userData) {
            updateUserData({ totalScore: userData.totalScore + mission.starsReward });
        }

        // Marca como reivindicada
        setGamification(prev => {
            const missions = prev.activeMissions.map(m =>
                m.missionId === missionId ? { ...m, status: 'claimed' as const } : m
            );
            const updated = { ...prev, activeMissions: missions };
            saveGamification(updated);
            return updated;
        });
    }, [dailyMissions, weeklyMissions, gamification.activeMissions, addXP, userData, updateUserData, saveGamification]);

    // ============================================
    // POWER-UPS
    // ============================================

    /**
     * Usa um power-up
     */
    const usePowerUp = useCallback((type: PowerUpType): boolean => {
        const powerUp = POWERUPS.find(p => p.id === type);
        if (!powerUp) return false;

        const today = new Date().toISOString().split('T')[0];
        let currentPowerUps = gamification.powerUps;

        // Reset diário se necessário
        if (currentPowerUps.lastResetDate !== today) {
            currentPowerUps = {
                ...currentPowerUps,
                usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
                lastResetDate: today,
            };
        }

        // Verifica se tem power-up disponível
        if (currentPowerUps.inventory[type] <= 0) return false;
        if (currentPowerUps.usesToday[type] >= powerUp.maxPerDay) return false;

        // Usa o power-up
        setGamification(prev => {
            const updated = {
                ...prev,
                powerUps: {
                    ...prev.powerUps,
                    inventory: { ...prev.powerUps.inventory, [type]: prev.powerUps.inventory[type] - 1 },
                    usesToday: { ...prev.powerUps.usesToday, [type]: prev.powerUps.usesToday[type] + 1 },
                    lastResetDate: today,
                },
            };
            saveGamification(updated);
            return updated;
        });

        return true;
    }, [gamification.powerUps, saveGamification]);

    /**
     * Compra um power-up
     */
    const buyPowerUp = useCallback((type: PowerUpType): boolean => {
        const powerUp = POWERUPS.find(p => p.id === type);
        if (!powerUp || !userData) return false;

        if (userData.totalScore < powerUp.price) return false;

        // Deduz estrelas
        updateUserData({ totalScore: userData.totalScore - powerUp.price });

        // Adiciona ao inventário
        setGamification(prev => {
            const updated = {
                ...prev,
                powerUps: {
                    ...prev.powerUps,
                    inventory: { ...prev.powerUps.inventory, [type]: prev.powerUps.inventory[type] + 1 },
                },
            };
            saveGamification(updated);
            return updated;
        });

        return true;
    }, [userData, updateUserData, saveGamification]);

    // ============================================
    // LOJA / INVENTÁRIO
    // ============================================

    /**
     * Compra um item da loja
     */
    const buyShopItem = useCallback((itemId: string, price: number): boolean => {
        if (!userData) return false;
        if (userData.totalScore < price) return false;
        if (gamification.inventory.ownedItems.includes(itemId)) return false;

        // Deduz estrelas
        updateUserData({ totalScore: userData.totalScore - price });

        // Adiciona ao inventário
        setGamification(prev => {
            const updated = {
                ...prev,
                inventory: {
                    ...prev.inventory,
                    ownedItems: [...prev.inventory.ownedItems, itemId],
                },
            };
            saveGamification(updated);
            return updated;
        });

        return true;
    }, [userData, updateUserData, gamification.inventory.ownedItems, saveGamification]);

    /**
     * Equipa um item
     */
    const equipItem = useCallback((itemId: string, type: 'avatar' | 'frame' | 'title') => {
        if (!gamification.inventory.ownedItems.includes(itemId)) return;

        setGamification(prev => {
            const updated = {
                ...prev,
                inventory: {
                    ...prev.inventory,
                    ...(type === 'avatar' && { equippedAvatar: itemId }),
                    ...(type === 'frame' && { equippedFrame: itemId }),
                    ...(type === 'title' && { equippedTitle: itemId }),
                },
            };
            saveGamification(updated);
            return updated;
        });
    }, [gamification.inventory.ownedItems, saveGamification]);

    // ============================================
    // ESTATÍSTICAS
    // ============================================

    /**
     * Registra uma questão completada
     */
    const recordQuestionCompleted = useCallback((passed: boolean, xpEarned: number = 10) => {
        recordDailyActivity();
        addXP(xpEarned);

        setGamification(prev => {
            const updated = {
                ...prev,
                stats: {
                    ...prev.stats,
                    totalQuestionsCompleted: prev.stats.totalQuestionsCompleted + 1,
                    totalCorrectAnswers: passed ? prev.stats.totalCorrectAnswers + 1 : prev.stats.totalCorrectAnswers,
                },
            };
            saveGamification(updated);

            // Verifica conquistas
            checkQuestionAchievements(updated.stats.totalQuestionsCompleted, passed ? updated.stats.totalCorrectAnswers : 0);

            return updated;
        });
    }, [recordDailyActivity, addXP, saveGamification, checkQuestionAchievements]);

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    useEffect(() => {
        if (!loading) {
            initializeMissions();
        }
    }, [loading, initializeMissions]);

    // ============================================
    // RETORNO DO HOOK
    // ============================================

    return {
        // Estado
        gamification,
        loading,

        // Nível
        currentLevel,
        levelProgress,
        xpToNextLevel,
        addXP,
        showLevelUp,
        dismissLevelUp: () => setShowLevelUp(null),

        // Streak
        streak: gamification.streak,
        recordDailyActivity,

        // Conquistas
        achievements: ACHIEVEMENTS,
        unlockedAchievements,
        newAchievements,
        unlockAchievement,
        markAchievementSeen,

        // Missões
        dailyMissions,
        weeklyMissions,
        activeMissions,
        updateMissionProgress,
        claimMissionReward,

        // Power-ups
        powerUps: POWERUPS,
        userPowerUps: gamification.powerUps,
        usePowerUp,
        buyPowerUp,

        // Loja
        inventory: gamification.inventory,
        buyShopItem,
        equipItem,

        // Stats
        stats: gamification.stats,
        recordQuestionCompleted,

        // Reload
        reload: loadGamification,
    };
}
