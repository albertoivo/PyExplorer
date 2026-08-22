import { useState, useCallback, useMemo } from 'react';
import type {
    UserGamification,
    Achievement,
    LevelInfo,
} from '../types/gamification';
import { useAuth } from './useAuth';
import { getInitialGamification } from '../utils/gamificationState';
import { useGamificationStore } from './gamification/useGamificationStore';
import { useGamificationShop } from './gamification/useGamificationShop';
import { useGamificationPet } from './gamification/useGamificationPet';
import { useGamificationMissions } from './gamification/useGamificationMissions';
import { useGamificationCore } from './gamification/useGamificationCore';

export function useGamification() {
    const { userData, isGuest, updateUserData } = useAuth();

    // Root state
    const [gamification, setGamification] = useState<UserGamification>(getInitialGamification);
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
    const [showLevelUp, setShowLevelUp] = useState<LevelInfo | null>(null);
    const [missionNotification, setMissionNotification] = useState<{ title: string, rewards: { stars: number, xp: number } } | null>(null);

    const safeAddAchievement = useCallback((achievement: Achievement) => {
        setNewAchievements(prev => {
            if (prev.some(a => a.id === achievement.id)) return prev;
            return [...prev, achievement];
        });
    }, []);

    // Load/Save logic via sub-hook
    const { loading, saveGamification } = useGamificationStore({
        userData,
        isGuest,
        updateUserData,
        gamification,
        setGamification,
        safeAddAchievement,
        setMissionNotification,
        getInitialGamification,
    });

    // Shop, Items, and PowerUps via sub-hook
    const { buyShopItem, equipItem, usePowerUp, buyPowerUp } = useGamificationShop({
        gamification,
        setGamification,
        saveGamification,
        userData,
        updateUserData,
        safeAddAchievement,
    });

    // Pet logic via sub-hook
    const { feedPet, dismissPetEvolution } = useGamificationPet({
        gamification,
        setGamification,
        saveGamification,
        userData,
        updateUserData,
    });

    // Missions logic via sub-hook
    const { dailyMissions, weeklyMissions, claimMissionReward } = useGamificationMissions({
        gamification,
        setGamification,
        saveGamification,
        userData,
        updateUserData,
        setShowLevelUp,
        safeAddAchievement,
    });

    // Core logic via sub-hook
    const {
        recordQuestionCompleted,
        checkWorldAchievements,
        markAchievementSeen,
        dismissLevelUp,
        dismissMissionNotification,
        currentLevel,
        levelProgress,
        achievements,
        unlockedAchievements,
    } = useGamificationCore({
        gamification,
        setGamification,
        saveGamification,
        userData,
        updateUserData,
        setShowLevelUp,
        setMissionNotification,
        safeAddAchievement,
        setNewAchievements,
    });

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
        feedPet,
        dismissPetEvolution,
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
        feedPet,
        dismissPetEvolution,
        userData?.balance
    ]);
}
