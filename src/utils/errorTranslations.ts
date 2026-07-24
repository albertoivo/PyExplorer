/**
 * Traduz mensagens de erro do Firebase para português.
 * Centralizado aqui para evitar problemas com Fast Refresh nos contextos.
 *
 * Usa regex para extrair o código de erro (ex: "auth/user-not-found")
 * e lookup direto O(1) em vez de loop O(n) sobre todas as traduções.
 */
export function translateFirebaseError(message: string): string {
    const translations: Record<string, string> = {
        // Login — mensagens genéricas para prevenir username enumeration
        'auth/user-not-found': 'Email ou senha incorretos',
        'auth/wrong-password': 'Email ou senha incorretos',
        'auth/invalid-credential': 'Email ou senha incorretos',
        'auth/invalid-login-credentials': 'Email ou senha incorretos',

        // Cadastro
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',

        // Rate limiting e segurança
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/user-disabled': 'Esta conta foi desativada. Entre em contato conosco',
        'auth/requires-recent-login': 'Sessão expirada. Faça login novamente',
        'auth/operation-not-allowed': 'Este método de login não está habilitado',

        // Rede
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',

        // Google / OAuth
        'auth/popup-blocked': 'Pop-up bloqueado pelo navegador. Permita pop-ups e tente novamente',
        'auth/popup-closed-by-user': 'Login cancelado. Tente novamente',
        'auth/cancelled-popup-request': 'Login cancelado. Tente novamente',
        'auth/account-exists-with-different-credential': 'Já existe uma conta com esse email usando outro método de login',
        'auth/credential-already-in-use': 'Essa credencial já está associada a outra conta',
    };

    // Extrai o código do Firebase da mensagem (ex: "Firebase: Error (auth/invalid-email).")
    const codeMatch = message.match(/auth\/[\w-]+/);
    if (codeMatch) {
        const code = codeMatch[0];
        if (code in translations) {
            return translations[code];
        }
    }

    // Fallback: tenta match por substring (para mensagens sem formato padrão)
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
