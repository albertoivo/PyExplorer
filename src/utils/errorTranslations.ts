/**
 * Traduz mensagens de erro do Firebase para português.
 * Centralizado aqui para evitar problemas com Fast Refresh nos contextos.
 */
export function translateFirebaseError(message: string): string {
    const translations: Record<string, string> = {
        // Prevent username enumeration by using generic error messages
        'auth/user-not-found': 'Email ou senha incorretos',
        'auth/wrong-password': 'Email ou senha incorretos',
        'auth/invalid-credential': 'Email ou senha incorretos',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    };

    for (const [code, translation] of Object.entries(translations)) {
        if (message.includes(code)) {
            return translation;
        }
    }

    return message;
}
