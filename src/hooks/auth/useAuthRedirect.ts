import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { checkRedirectResult } from '../../firebase/auth';
import { saveUser, getUser } from '../../firebase/firestore';
import { createDefaultUserData } from '../../utils/auth/authUtils';
import { translateFirebaseError } from '../../utils/errorTranslations';
import { env } from '../../config/env';

export function useAuthRedirect(
    setError: Dispatch<SetStateAction<string | null>>
) {
    useEffect(() => {
        if (env.IS_AUDIT_BOT) return;

        const handleRedirect = async () => {
            try {
                const credential = await checkRedirectResult();
                if (credential?.user) {
                    const firebaseUser = credential.user;
                    const existingData = await getUser(firebaseUser.uid);

                    if (!existingData) {
                        const newUserData = createDefaultUserData({
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName || 'Explorador',
                            email: firebaseUser.email || '',
                        });
                        await saveUser(newUserData);
                    }

                    if (window.location.origin !== new URL(env.APP_URL).origin) {
                        window.location.href = env.APP_URL;
                    }
                }
            } catch (err) {
                console.error("Erro no redirecionamento do Google:", err);
                const message = err instanceof Error ? err.message : 'Erro ao entrar com Google (Redirect)';
                setError(translateFirebaseError(message));
            }
        };

        handleRedirect();
    }, [setError]);
}
