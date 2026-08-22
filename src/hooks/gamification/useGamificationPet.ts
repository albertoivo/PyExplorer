import { useCallback } from 'react';
import type { UserGamification } from '../../types/gamification';
import type { UserData } from '../../types/question';
import { feedPet, getInitialPet } from '../../utils/petLogic';

interface UseGamificationPetProps {
    gamification: UserGamification;
    setGamification: React.Dispatch<React.SetStateAction<UserGamification>>;
    saveGamification: (data: UserGamification) => void;
    userData: UserData | null;
    updateUserData: (updates: Partial<UserData>) => void;
}

export function useGamificationPet({
    gamification,
    setGamification,
    saveGamification,
    userData,
    updateUserData,
}: UseGamificationPetProps) {
    const feedPetCallback = useCallback(() => {
        const COST = 10;
        const balance = userData?.balance || 0;

        if (balance < COST) return false;

        const currentPet = gamification.pet || getInitialPet();
        if (currentPet.hunger >= 100) return false;

        const newPet = feedPet(currentPet);
        const newState = { ...gamification, pet: newPet };

        setGamification(newState);
        saveGamification(newState);
        updateUserData({ balance: balance - COST });
        return true;
    }, [gamification, userData, updateUserData, saveGamification, setGamification]);

    const dismissPetEvolutionCallback = useCallback(() => {
        if (!gamification.pet) return;
        const newPet = { ...gamification.pet, justEvolved: false };
        const newState = { ...gamification, pet: newPet };
        setGamification(newState);
        saveGamification(newState);
    }, [gamification, saveGamification, setGamification]);

    return {
        feedPet: feedPetCallback,
        dismissPetEvolution: dismissPetEvolutionCallback,
    };
}
