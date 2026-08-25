import { useCallback } from 'react';
import { signIn, signUp, resetPassword } from '../../firebase/auth';
import { saveUser } from '../../firebase/firestore';
import { createDefaultUserData } from '../../utils/auth/authUtils';
import { translateFirebaseError } from '../../utils/errorTranslations';
import type { UserData } from '../../types/question';

export function useEmailAuth(
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signIn(email.trim(), password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer login';
            setError(translateFirebaseError(message));
        } finally {
            setLoading(false);
        }
    }, [setError, setLoading]);

    const register = useCallback(async (email: string, password: string, displayName: string) => {
        setError(null);
        setLoading(true);
        try {
            const credential = await signUp(email.trim(), password, displayName.trim());

            // Cria documento do usuário no Firestore
            const newUserData = createDefaultUserData({
                uid: credential.user.uid,
                displayName: displayName.trim(),
                email: email.trim(),
            });

            await saveUser(newUserData);
            setUserData(newUserData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar conta';
            setError(translateFirebaseError(message));
        } finally {
            setLoading(false);
        }
    }, [setError, setLoading, setUserData]);

    const sendPasswordReset = useCallback(async (email: string) => {
        setError(null);
        try {
            await resetPassword(email.trim());
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao enviar email';
            setError(translateFirebaseError(message));
            throw err;
        }
    }, [setError]);

    return { login, register, sendPasswordReset };
}
