import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserGamification, Achievement } from '../../types/gamification';
import type { UserData } from '../../types/question';
import {
    checkDailyAndWeeklyReset,
    applyStreakUpdate,
    migrateLegacyStreak,
    normalizeGamificationForRules,
    removePetField,
    checkAndUnlockAchievements,
    ensureEndgameMissions,
} from '../../utils/gamificationState';
import { calculateStreak } from '../../utils/gamificationUtils';
import { checkPetStatus, getInitialPet } from '../../utils/petLogic';
import { getGamification, saveGamificationData } from '../../firebase/firestore';

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

export async function saveGamificationWithFallback(uid: string, data: UserGamification): Promise<void> {
    const normalized = normalizeGamificationForRules(data);
    try {
        await saveGamificationData(uid, normalized);
    } catch (error) {
        if (!isPermissionDeniedError(error)) throw error;
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

interface UseGamificationStoreProps {
    userData: UserData | null;
    isGuest: boolean;
    updateUserData: (updates: Partial<UserData>) => void;
    gamification: UserGamification;
    setGamification: React.Dispatch<React.SetStateAction<UserGamification>>;
    safeAddAchievement: (achievement: Achievement) => void;
    setMissionNotification: React.Dispatch<React.SetStateAction<{ title: string, rewards: { stars: number, xp: number } } | null>>;
    getInitialGamification: () => UserGamification;
}

export function useGamificationStore({
    userData,
    isGuest,
    updateUserData,
    gamification,
    setGamification,
    safeAddAchievement,
    setMissionNotification,
    getInitialGamification,
}: UseGamificationStoreProps) {
    const [loading, setLoading] = useState(true);

    const userDataRef = useRef(userData);
    useEffect(() => {
        userDataRef.current = userData;
    }, [userData]);

    const saveGamification = useCallback((data: UserGamification) => {
        if (!data || !data.level || !data.stats) return;

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

        const { newState: stateWithAchievements, unlocked } = checkAndUnlockAchievements(finalState, currentBalance);
        if (unlocked.length > 0) {
            finalState = stateWithAchievements;
            hasChanges = true;
            unlocked.forEach(a => safeAddAchievement(a));
        }

        const { newState: stateWithMissions, changed: missionsChanged } = ensureEndgameMissions(finalState);
        if (missionsChanged) {
            finalState = stateWithMissions;
            hasChanges = true;
        }

        if (hasChanges) {
            setGamification(finalState);
            saveGamification(finalState);
            if (finalState.level.totalXP !== currentState.level.totalXP) {
                updateUserData({ totalScore: finalState.level.totalXP });
            }
        }
    }, [saveGamification, safeAddAchievement, updateUserData, setGamification]);

    const achievementCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

                    const legacyUser = currentUserData as typeof currentUserData & LegacyStreakUserFields;
                    const legacyMigration = migrateLegacyStreak(finalData, legacyUser.streak, legacyUser.longestStreak, legacyUser.lastActiveDate);
                    if (legacyMigration.changed) {
                        finalData = legacyMigration.newState;
                        hasUpdates = true;
                    }

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

                    if (!finalData.pet) {
                        finalData.pet = getInitialPet();
                        hasUpdates = true;
                    } else {
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

                    if (achievementCheckTimeoutRef.current) {
                        clearTimeout(achievementCheckTimeoutRef.current);
                    }

                    achievementCheckTimeoutRef.current = setTimeout(() => {
                        if (userDataRef.current?.uid === currentUserData.uid) {
                            runGamificationChecks(finalData, currentUserData.balance || 0);
                        }
                    }, 100);
                } else {
                    const initial = getInitialGamification();
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
    }, [isGuest, runGamificationChecks, setGamification, setMissionNotification, getInitialGamification]);

    const hasLoadedRef = useRef<string | null>(null);
    useEffect(() => {
        const userId = userData?.uid || (isGuest ? 'guest' : null);
        if (userId && hasLoadedRef.current !== userId) {
            hasLoadedRef.current = userId;
            loadGamification();
        }
    }, [userData?.uid, isGuest, loadGamification]);

    return { loading, saveGamification };
}
