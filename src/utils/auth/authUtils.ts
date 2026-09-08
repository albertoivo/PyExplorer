import type { UserData, World } from '../../types/question';

export const GUEST_KEY = 'pyexplorer_guest';

/**
 * Cria um objeto UserData padrão para novos usuários.
 * Factory centralizada para evitar duplicação (usado em registro, Google popup e Google redirect).
 */
export function createDefaultUserData(overrides: {
    uid: string;
    displayName: string;
    email: string;
    avatar?: string;
}): UserData {
    return {
        uid: overrides.uid,
        displayName: overrides.displayName,
        email: overrides.email,
        avatar: overrides.avatar || 'default_avatar',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalScore: 0,
        balance: 0,
        unlockedWorlds: ['basic_commands' as World],
    };
}

/**
 * Lê e valida dados do convidado do localStorage.
 * Retorna null se não houver dados ou se estiverem corrompidos.
 */
export function readGuestData(): UserData | null {
    try {
        const raw = localStorage.getItem(GUEST_KEY);
        if (!raw) return null;

        const data = JSON.parse(raw);

        // Validação mínima: verifica que os campos essenciais existem
        if (
            typeof data.uid !== 'string' ||
            typeof data.displayName !== 'string'
        ) {
            // Dados corrompidos — limpa o localStorage
            localStorage.removeItem(GUEST_KEY);
            return null;
        }

        return data as UserData;
    } catch {
        // JSON inválido — limpa o localStorage
        localStorage.removeItem(GUEST_KEY);
        return null;
    }
}
