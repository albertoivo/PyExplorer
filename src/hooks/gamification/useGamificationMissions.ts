import { useCallback, useMemo } from 'react';
import type { UserGamification, Achievement, LevelInfo } from '../../types/gamification';
import type { UserData } from '../../types/question';
import { claimMissionRewardLogic, hydrateMissions, checkAndUnlockAchievements } from '../../utils/gamificationState';

interface UseGamificationMissionsProps {
    gamification: UserGamification;
    setGamification: React.Dispatch<React.SetStateAction<UserGamification>>;
    saveGamification: (data: UserGamification) => void;
    userData: UserData | null;
    updateUserData: (updates: Partial<UserData>) => void;
    setShowLevelUp: React.Dispatch<React.SetStateAction<LevelInfo | null>>;
    safeAddAchievement: (achievement: Achievement) => void;
}

export function useGamificationMissions({
    gamification,
    setGamification,
    saveGamification,
    userData,
    updateUserData,
    setShowLevelUp,
    safeAddAchievement,
}: UseGamificationMissionsProps) {
    const { daily: dailyMissions, weekly: weeklyMissions } = useMemo(() => {
        return hydrateMissions(gamification.activeMissions || []);
    }, [gamification.activeMissions]);

    const claimMissionReward = useCallback((missionId: string) => {
        const { success, newState, rewards, levelUp } = claimMissionRewardLogic(gamification, missionId);
        if (success) {
            updateUserData({
                balance: (userData?.balance || 0) + rewards.stars,
                totalScore: newState.level.totalXP
            });

            const newBalance = (userData?.balance || 0) + rewards.stars;
            const { newState: finalState, unlocked } = checkAndUnlockAchievements(newState, newBalance);
            unlocked.forEach(a => safeAddAchievement(a));

            if (levelUp) setShowLevelUp(levelUp);
            setGamification(finalState);
            saveGamification(finalState);
        }
    }, [gamification, userData, updateUserData, saveGamification, safeAddAchievement, setGamification, setShowLevelUp]);

    return {
        dailyMissions,
        weeklyMissions,
        claimMissionReward,
    };
}
