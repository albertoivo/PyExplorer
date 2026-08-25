import { useCallback } from 'react';
import { signInWithGoogle, signInWithGoogleRedirect } from '../../firebase/auth';
import { saveUser, getUser } from '../../firebase/firestore';
import { createDefaultUserData } from '../../utils/auth/authUtils';
import { translateFirebaseError } from '../../utils/errorTranslations';
import { env } from '../../config/env';
import type { UserData } from '../../types/question';

export function useGoogleAuth(
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
    const loginWithGoogle = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            // Se for dispositivo móvel, usa redirecionamento direto, senão usa popup
            // Fallback: se o popup falhar com popup-closed-by-user, tenta redirecionamento

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                await signInWithGoogleRedirect();
                return; // a página será redirecionada
            }

            const credential = await signInWithGoogle();
            const firebaseUser = credential.user;

            // Verifica se o usuário já tem dados no Firestore
            const existingData = await getUser(firebaseUser.uid);

            if (!existingData) {
                // Se não tiver, cria um novo registro (fluxo de cadastro)
                const newUserData = createDefaultUserData({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || 'Explorador',
                    email: firebaseUser.email || '',
                });

                await saveUser(newUserData);
                setUserData(newUserData);
            } else {
                // Se já tiver, apenas atualiza o estado local
                setUserData(existingData);
            }

            // Garante que estamos na URL correta
            if (window.location.origin !== new URL(env.APP_URL).origin) {
                window.location.href = env.APP_URL;
            }

        } catch (err: unknown) {
            // Se for popup fechado (frequente no mobile), cai no redirect
            const errorCode = (err as { code?: string })?.code;
            if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
                try {
                    await signInWithGoogleRedirect();
                    return; // a página será redirecionada
                } catch (redirectErr) {
                    console.error('Falha também no redirect:', redirectErr);
                }
            }

            const message = err instanceof Error ? err.message : 'Erro ao entrar com Google';
            setError(translateFirebaseError(message));
            setLoading(false);
        }
    }, [setError, setLoading, setUserData]);

    return { loginWithGoogle };
}
