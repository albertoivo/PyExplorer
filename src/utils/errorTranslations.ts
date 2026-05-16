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

/**
 * Analisa e categoriza erros comuns do Python para métricas educacionais.
 * Útil para detectar frustração (ex: erros de sintaxe repetidos).
 */
export function categorizePythonError(errorMessage: string): string {
    if (!errorMessage) return 'Unknown Error';
    
    // Extrai o tipo da exceção base (ex: SyntaxError: invalid syntax -> SyntaxError)
    const match = errorMessage.match(/^([a-zA-Z]+Error):/m);
    if (match) {
        const errorType = match[1];
        
        // Traduz/categoriza erros mais comuns para analytics
        switch (errorType) {
            case 'SyntaxError':
                return 'Erro de Sintaxe';
            case 'NameError':
                return 'Variável não Encontrada';
            case 'TypeError':
                return 'Erro de Tipo';
            case 'IndentationError':
                return 'Erro de Indentação';
            case 'IndexError':
                return 'Índice Fora dos Limites';
            default:
                return errorType;
        }
    }
    
    return 'Erro de Execução';
}
