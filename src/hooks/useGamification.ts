import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    UserGamification,
    UserAchievement,
    UserMission,
    PowerUpType,
    Achievement,
    LevelInfo,
    UserInventory,
} from '../types/gamification';
import {
    ACHIEVEMENTS,
    POWERUPS,
    getLevelFromXP,
    getLevelProgress,
    generateDailyMissions,
    generateWeeklyMissions,
    SHOP_ITEMS,
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
                    updateUserData({ balance: (userData.balance || 0) + newLevel.rewards.stars });
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
            updateUserData({ balance: (userData.balance || 0) + achievement.starsReward });
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
        if (streak >= 50) unlockAchievement('unstoppable');
        if (streak >= 100) unlockAchievement('streak_100');
        if (streak >= 365) unlockAchievement('code_year');
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
     * Verifica conquistas baseadas no horário
     */
    const checkTimeAchievements = useCallback(() => {
        const hour = new Date().getHours();

        // Madrugador: entre 5h e 7h
        if (hour >= 5 && hour < 7) {
            unlockAchievement('early_bird');
        }

        // Coruja Noturna: entre 23h e 1h
        if (hour >= 23 || hour < 1) {
            unlockAchievement('night_owl');
        }
    }, [unlockAchievement]);

    /**
     * Verifica conquistas de velocidade
     */
    const checkSpeedAchievement = useCallback((responseTimeSeconds: number) => {
        // Velocista: resposta correta em menos de 10 segundos
        if (responseTimeSeconds < 10) {
            unlockAchievement('speed_demon');
        }
    }, [unlockAchievement]);

    /**
     * Verifica conquistas de fim de semana
     */
    const checkWeekendAchievements = useCallback((weekendCount: number) => {
        // Guerreiro de fim de semana: 10 questões em um único fim de semana
        if (weekendCount >= 10) {
            unlockAchievement('weekend_warrior');
        }
    }, [unlockAchievement]);

    /**
     * Verifica conquistas de mundo
     */
    const checkWorldAchievements = useCallback((worldsCompleted: number, isPerfect: boolean) => {
        // Explorador: completou um mundo
        if (worldsCompleted >= 1) {
            unlockAchievement('first_world');
        }

        // Perfeição Absoluta: completou um mundo sem errar
        if (isPerfect) {
            unlockAchievement('perfect_world');
        }

        if (worldsCompleted >= 6) {
            unlockAchievement('all_worlds');
        }
    }, [unlockAchievement]);

    /**
     * Verifica conquistas de Bosses
     */
    const checkBossAchievements = useCallback((bossesDefeatedCount: number, firstTry: boolean) => {
        if (bossesDefeatedCount >= 1) unlockAchievement('giant_slayer');
        if (bossesDefeatedCount >= 3) unlockAchievement('legend_hunter');
        // Assumindo cerca de 5 bosses totais
        if (bossesDefeatedCount >= 5) unlockAchievement('the_destroyer');

        if (firstTry) {
            unlockAchievement('untouchable');
        }
    }, [unlockAchievement]);

    /**
     * Verifica conquistas de Loja
     */
    const checkShopAchievements = useCallback((inventory: UserInventory, balance: number) => {
        // Avatares (contar quantos avatares tem na lista ownedItems que começam com 'avatar_')
        const avatarsCount = inventory.ownedItems.filter(id => id.startsWith('avatar_')).length;
        if (avatarsCount >= 3) unlockAchievement('fashionista');

        // Todos os itens (comparar tamanho do ownedItems com total de SHOP_ITEMS)
        if (inventory.ownedItems.length >= SHOP_ITEMS.length) unlockAchievement('personal_museum');

        // Magnata (saldo atual)
        if (balance >= 1000) unlockAchievement('magnate');
    }, [unlockAchievement]);

    // Verifica conquistas de loja/saldo sempre que inventário ou saldo mudarem
    useEffect(() => {
        if (!loading && userData) {
            checkShopAchievements(gamification.inventory, userData.balance || 0);
        }
    }, [loading, userData?.balance, gamification.inventory, checkShopAchievements, userData]);

    /**
     * Verifica conquistas de Maestria e Endgame
     */
    const checkMasteryAchievements = useCallback((stats: UserGamification['stats'], lastWorldCompleted?: string, consecutiveSpeed?: number) => {
        // Enciclopédia Viva
        if (stats.totalQuestionsCompleted >= 250) unlockAchievement('living_encyclopedia');

        // Perfeccionista Supremo
        if (stats.perfectWorlds >= 3) unlockAchievement('supreme_perfectionist');

        // Velocidade da Luz: 5 questões seguidas < 20s
        // Precisa ser rastreado. Vou assumir que quem chama passa essa info ou add ao state.
        // Simplify: Vou checar fora ou adicionar ao state 'consecutiveFastAnswers'.
        // Como o state já tem 'consecutiveCorrect', vou sugerir adicionar um state local ou derivado.
        // Por hora, deixo parametrizado.
        if (consecutiveSpeed && consecutiveSpeed >= 5) unlockAchievement('light_speed');

        // Poliglota Python
        // Vou assumir que o último mundo tem ID 'advanced_concepts' ou similar.
        // Ajustar conforme worlds.ts.
        if (lastWorldCompleted === 'advanced_concepts' || lastWorldCompleted === 'world_5') { // ajustado para world_5 (ultimo)
            unlockAchievement('python_polyglot');
        }

        // Imparável e Ano do Código (Streak)
        // Isso já é checado em checkStreakAchievements, só expandir lá.
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
            updateUserData({ balance: (userData.balance || 0) + mission.starsReward });
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

        if ((userData.balance || 0) < powerUp.price) return false;

        // Deduz estrelas
        updateUserData({ balance: (userData.balance || 0) - powerUp.price });

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
        if ((userData.balance || 0) < price) return false;
        if (gamification.inventory.ownedItems.includes(itemId)) return false;

        // Deduz estrelas
        updateUserData({ balance: (userData.balance || 0) - price });

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

            // Verifica conquistas de loja após compra (redundante com useEffect mas garante feedback imediato se necessário)
            checkShopAchievements(updated.inventory, userData.balance || 0);

            return updated;
        });

        return true;
    }, [userData, updateUserData, gamification.inventory.ownedItems, saveGamification]);

    /**
     * Equipa um item
     */
    const equipItem = useCallback((itemId: string, type: 'avatar' | 'frame' | 'title') => {
        if (!gamification.inventory.ownedItems.includes(itemId)) return;

        // Se for avatar, atualiza também o perfil do usuário
        if (type === 'avatar' && userData) {
            updateUserData({ avatar: itemId });
        }

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
    }, [gamification.inventory.ownedItems, saveGamification, userData, updateUserData]);

    // ============================================
    // ESTATÍSTICAS
    // ============================================

    /**
     * Registra uma questão completada
     * @param passed - Se a resposta foi correta
     * @param xpEarned - XP ganho (padrão: 10)
     * @param responseTimeSeconds - Tempo de resposta em segundos (opcional)
     * @param options - Opções adicionais (mundo, estrelas)
     */
    const recordQuestionCompleted = useCallback((
        passed: boolean,
        xpEarned: number = 10,
        responseTimeSeconds?: number,
        options?: { worldId?: string, starsEarned?: number }
    ) => {
        recordDailyActivity();
        addXP(xpEarned);

        // Verifica conquistas de horário sempre que completar uma questão
        checkTimeAchievements();

        // Verifica conquista de velocidade se passou e temos o tempo
        if (passed && responseTimeSeconds !== undefined) {
            checkSpeedAchievement(responseTimeSeconds);
        }

        setGamification(prev => {
            // Calcula novo streak de acertos consecutivos
            const newConsecutive = passed ? (prev.stats.consecutiveCorrect || 0) + 1 : 0;
            const newBestConsecutive = Math.max(prev.stats.bestConsecutiveCorrect || 0, newConsecutive);

            // Verifica se é fim de semana e contabiliza
            const today = new Date();
            const dayOfWeek = today.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const todayStr = today.toISOString().split('T')[0];

            // Calcula contagem de fim de semana
            let weekendCount = prev.stats.weekendQuestionsCount || 0;
            const lastWeekendDate = prev.stats.lastWeekendDate || '';

            if (isWeekend) {
                // Se é o mesmo fim de semana, incrementa
                // Se é um novo fim de semana, reseta
                const lastDate = lastWeekendDate ? new Date(lastWeekendDate) : null;
                const daysDiff = lastDate ? Math.abs((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

                if (daysDiff <= 1) {
                    weekendCount = weekendCount + 1;
                } else {
                    weekendCount = 1; // Novo fim de semana
                }
            }

            // ATUALIZA MISSÕES
            const allMissionsDef = [...dailyMissions, ...weeklyMissions];
            const updatedMissions = prev.activeMissions.map(userMission => {
                // Se já está completa e não reivindicada (ou reivindicada), não atualiza mais
                if (userMission.status !== 'active') return userMission;

                const missionDef = allMissionsDef.find(m => m.id === userMission.missionId);
                if (!missionDef) return userMission;

                let newProgress = userMission.progress;

                switch (missionDef.objectiveType) {
                    case 'complete_questions':
                        // Se requer mundo específico, verifica
                        if (missionDef.targetWorld && missionDef.targetWorld !== options?.worldId) {
                            break;
                        }
                        // Incrementa progresso
                        newProgress += 1;
                        break;

                    case 'correct_streak':
                        // Usa o novo streak calculado
                        newProgress = newConsecutive;
                        break;

                    case 'earn_stars':
                        if (options?.starsEarned && options.starsEarned > 0) {
                            newProgress += options.starsEarned;
                        }
                        break;

                    // 'complete_world' e 'login_streak' são tratados separadamente ou já foram tratados
                }

                // Verifica se completou
                const isCompleted = newProgress >= missionDef.targetValue;

                return {
                    ...userMission,
                    progress: newProgress,
                    status: isCompleted ? 'completed' as const : 'active' as const,
                    completedAt: isCompleted ? new Date() : undefined
                };
            });

            const updated = {
                ...prev,
                activeMissions: updatedMissions,
                stats: {
                    ...prev.stats,
                    totalQuestionsCompleted: prev.stats.totalQuestionsCompleted + 1,
                    totalCorrectAnswers: passed ? prev.stats.totalCorrectAnswers + 1 : prev.stats.totalCorrectAnswers,
                    consecutiveCorrect: newConsecutive,
                    bestConsecutiveCorrect: newBestConsecutive,
                    weekendQuestionsCount: weekendCount,
                    lastWeekendDate: isWeekend ? todayStr : prev.stats.lastWeekendDate,
                },
            };
            saveGamification(updated);

            // Verifica conquistas de questões e acertos consecutivos
            checkQuestionAchievements(updated.stats.totalQuestionsCompleted, newConsecutive);

            // Verifica conquistas de fim de semana
            if (isWeekend) {
                checkWeekendAchievements(weekendCount);
            }

            return updated;
        });
    }, [recordDailyActivity, addXP, saveGamification, checkQuestionAchievements, checkTimeAchievements, checkSpeedAchievement, checkWeekendAchievements, dailyMissions, weeklyMissions]);

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
        checkTimeAchievements,
        checkSpeedAchievement,
        checkWeekendAchievements,
        checkBossAchievements,
        checkShopAchievements,
        checkMasteryAchievements,

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
        checkWorldAchievements,

        // Reload
        reload: loadGamification,
    };
}
