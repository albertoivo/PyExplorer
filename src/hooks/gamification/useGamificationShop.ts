import { useCallback } from 'react';
import type { UserGamification, Achievement, PowerUpType } from '../../types/gamification';
import type { UserData } from '../../types/question';
import { buyShopItemLogic, equipItemLogic, consumePowerUpLogic, buyPowerUpLogic, checkAndUnlockAchievements } from '../../utils/gamificationState';

interface UseGamificationShopProps {
    gamification: UserGamification;
    setGamification: React.Dispatch<React.SetStateAction<UserGamification>>;
    saveGamification: (data: UserGamification) => void;
    userData: UserData | null;
    updateUserData: (updates: Partial<UserData>) => void;
    safeAddAchievement: (achievement: Achievement) => void;
}

export function useGamificationShop({
    gamification,
    setGamification,
    saveGamification,
    userData,
    updateUserData,
    safeAddAchievement,
}: UseGamificationShopProps) {
    const buyShopItem = useCallback((itemId: string, price: number) => {
        const result = buyShopItemLogic(gamification, itemId, price, userData?.balance || 0);
        if (result.success) {
            const { newState: finalState, unlocked } = checkAndUnlockAchievements(result.newState, (userData?.balance || 0) - price);
            unlocked.forEach(a => safeAddAchievement(a));

            setGamification(finalState);
            saveGamification(finalState);
            updateUserData({ balance: (userData?.balance || 0) - price });
            return true;
        }
        return false;
    }, [gamification, userData, saveGamification, updateUserData, safeAddAchievement, setGamification]);

    const equipItem = useCallback((itemId: string, type: 'avatar' | 'frame' | 'title') => {
        setGamification(prev => {
            const newState = equipItemLogic(prev, itemId, type);
            saveGamification(newState);
            return newState;
        });
    }, [saveGamification, setGamification]);

    const usePowerUp = useCallback((powerUpType: PowerUpType) => {
        const result = consumePowerUpLogic(gamification, powerUpType);
        if (result.success) {
            setGamification(result.newState);
            saveGamification(result.newState);
            return true;
        }
        return false;
    }, [gamification, saveGamification, setGamification]);

    const buyPowerUp = useCallback((powerUpType: PowerUpType, price: number) => {
        const result = buyPowerUpLogic(gamification, powerUpType, price, userData?.balance || 0);
        if (result.success) {
            setGamification(result.newState);
            saveGamification(result.newState);
            updateUserData({ balance: (userData?.balance || 0) - price });
            return true;
        }
        return false;
    }, [gamification, userData, updateUserData, saveGamification, setGamification]);

    return {
        buyShopItem,
        equipItem,
        usePowerUp,
        buyPowerUp,
    };
}
