import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import type { UserData, World } from '../../types/question';
import { GUEST_KEY } from '../../utils/auth/authUtils';

export function useGuestAuth(
    setUserData: Dispatch<SetStateAction<UserData | null>>,
    setIsGuest: Dispatch<SetStateAction<boolean>>
) {
    const enterAsGuest = useCallback((displayName: string) => {
        const guestData: UserData = {
            uid: 'guest_' + Date.now(),
            displayName,
            email: '',
            avatar: 'guest_avatar',
            createdAt: new Date(),
            updatedAt: new Date(),
            totalScore: 0,
            balance: 0,
            unlockedWorlds: ['basic_commands' as World],
        };

        localStorage.setItem(GUEST_KEY, JSON.stringify(guestData));
        setUserData(guestData);
        setIsGuest(true);
    }, [setUserData, setIsGuest]);

    return { enterAsGuest };
}
