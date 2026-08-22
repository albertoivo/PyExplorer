import { useCallback, useMemo } from 'react';
import type { UserGamification, Achievement, LevelInfo } from '../../types/gamification';
import type { UserData } from '../../types/question';
import { recordQuestionLogic, checkWorldAchievementsLogic, checkAndUnlockAchievements, markAchievementSeenLogic } from '../../utils/gamificationState';
import { getLevelFromXP, getLevelProgress, ACHIEVEMENTS } from '../../data/gamificationData';

interface UseGamificationCoreProps {
    gamification: UserGamification;
    setGamification: React.Dispatch<React.SetStateAction<UserGamification>>;
    saveGamification: (data: UserGamification) => void;
    userData: UserData | null;
    updateUserData: (updates: Partial<UserData>) => void;
    setShowLevelUp: React.Dispatch<React.SetStateAction<LevelInfo | null>>;
    setMissionNotification: React.Dispatch<React.SetStateAction<{ title: string, rewards: { stars: number, xp: number } } | null>>;
    safeAddAchievement: (achievement: Achievement) => void;
    setNewAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

export function useGamificationCore({
    gamification,
    setGamification,
    saveGamification,
    userData,
    updateUserData,
    setShowLevelUp,
    setMissionNotification,
    safeAddAchievement,
    setNewAchievements,
}: UseGamificationCoreProps) {
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

        const totalStarsToAdd = starsEarned + (missionRewards?.stars || 0);

        if (totalStarsToAdd > 0 || newState.level.totalXP !== gamification.level.totalXP) {
            updateUserData({
                balance: (userData?.balance || 0) + totalStarsToAdd,
                totalScore: newState.level.totalXP
            });
        }

        if (levelUp) {
            setShowLevelUp(levelUp);
        }

        const newBalance = (userData?.balance || 0) + totalStarsToAdd;
        const { newState: stateWithAchievements, unlocked } = checkAndUnlockAchievements(newState, newBalance);
        const finalState = stateWithAchievements;
        unlocked.forEach(a => safeAddAchievement(a));

        if (completedMissionTitles && completedMissionTitles.length > 0) {
            completedMissionTitles.forEach(title => {
                setMissionNotification({
                    title,
                    rewards: missionRewards
                });
            });
        }

        setGamification(finalState);
        saveGamification(finalState);
    }, [gamification, userData, updateUserData, saveGamification, safeAddAchievement, setGamification, setShowLevelUp, setMissionNotification]);

    const checkWorldAchievements = useCallback((worldId?: string, questionsCompleted?: number, totalQuestions?: number, mistakes: number = 0) => {
        const {
            newState,
            hasUpdates,
            unlockedAchievements,
            completedMissions,
            missionRewards,
            levelUp
        } = checkWorldAchievementsLogic(
            gamification,
            userData?.balance || 0,
            worldId,
            questionsCompleted,
            totalQuestions,
            mistakes
        );

        if (hasUpdates) {
            unlockedAchievements.forEach(a => safeAddAchievement(a));

            if (completedMissions.length > 0) {
                updateUserData({
                    balance: (userData?.balance || 0) + missionRewards.stars,
                    totalScore: newState.level.totalXP
                });

                if (levelUp) setShowLevelUp(levelUp);

                completedMissions.forEach(m => {
                    setMissionNotification({
                        title: m,
                        rewards: { stars: missionRewards.stars, xp: missionRewards.xp }
                    });
                });
            }

            setGamification(newState);
            saveGamification(newState);
        }
    }, [gamification, saveGamification, safeAddAchievement, updateUserData, userData, setGamification, setShowLevelUp, setMissionNotification]);

    const markAchievementSeen = useCallback((achievementId: string) => {
        const newState = markAchievementSeenLogic(gamification, achievementId);
        setGamification(newState);
        saveGamification(newState);
        setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
    }, [gamification, saveGamification, setGamification, setNewAchievements]);

    const dismissLevelUp = useCallback(() => setShowLevelUp(null), [setShowLevelUp]);
    const dismissMissionNotification = useCallback(() => setMissionNotification(null), [setMissionNotification]);

    const currentLevel = useMemo(() => getLevelFromXP(gamification.level.totalXP), [gamification.level.totalXP]);
    const levelProgress = useMemo(() => getLevelProgress(gamification.level.totalXP), [gamification.level.totalXP]);
    const achievements = useMemo(() => ACHIEVEMENTS, []);
    const unlockedAchievements = useMemo(() => {
        return gamification.achievements
            .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
            .filter(Boolean) as Achievement[];
    }, [gamification.achievements]);

    return {
        recordQuestionCompleted,
        checkWorldAchievements,
        markAchievementSeen,
        dismissLevelUp,
        dismissMissionNotification,
        currentLevel,
        levelProgress,
        achievements,
        unlockedAchievements,
    };
}
