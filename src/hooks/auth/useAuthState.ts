import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '../../firebase/auth';
import { saveUser, getUser } from '../../firebase/firestore';
import type { UserData } from '../../types/question';
import { readGuestData, GUEST_KEY } from '../../utils/auth/authUtils';
import { env } from '../../config/env';

export function useAuthState(
    setUser: Dispatch<SetStateAction<User | null>>,
    setUserData: Dispatch<SetStateAction<UserData | null>>,
    setIsGuest: Dispatch<SetStateAction<boolean>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) {
    useEffect(() => {
        if (env.IS_AUDIT_BOT) {
            setTimeout(() => {
                setUser(null);
                setUserData(null);
                setIsGuest(false);
                setLoading(false);
            }, 0);
            return;
        }

        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                setIsGuest(false);
                localStorage.removeItem(GUEST_KEY);
                try {
                    const data = await getUser(firebaseUser.uid);

                    if (data) {
                        let dataChanged = false;
                        if (data.balance === undefined) {
                            data.balance = data.totalScore || 0;
                            dataChanged = true;
                        }

                        if (dataChanged) {
                            await saveUser(data);
                        }
                    }

                    setUserData(data);
                } catch (err) {
                    console.error('Erro ao buscar dados do usuário:', err);
                }
            } else {
                const guestData = readGuestData();
                if (guestData) {
                    setIsGuest(true);
                    setUserData(guestData);
                } else {
                    setUserData(null);
                    setIsGuest(false);
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setUserData, setIsGuest, setLoading]);
}
