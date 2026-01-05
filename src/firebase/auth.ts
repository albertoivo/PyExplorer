import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Cria uma nova conta de usuário com email e senha
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @param displayName - Nome de exibição (opcional)
 * @returns Promise com as credenciais do usuário
 */
export async function signUp(
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Atualiza o perfil com o nome de exibição, se fornecido
    if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
    }

    return userCredential;
}

/**
 * Faz login com email e senha
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Promise com as credenciais do usuário
 */
export async function signIn(
    email: string,
    password: string
): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Faz logout do usuário atual
 * @returns Promise vazia
 */
export async function logOut(): Promise<void> {
    return signOut(auth);
}

/**
 * Envia email de redefinição de senha
 * @param email - Email do usuário
 * @returns Promise vazia
 */
export async function resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
}

/**
 * Atualiza o nome de exibição do usuário
 * @param user - Usuário do Firebase
 * @param displayName - Novo nome de exibição
 * @returns Promise vazia
 */
export async function updateUserDisplayName(
    user: User,
    displayName: string
): Promise<void> {
    return updateProfile(user, { displayName });
}

/**
 * Registra um listener para mudanças no estado de autenticação
 * @param callback - Função chamada quando o estado muda
 * @returns Função para cancelar o listener
 */
export function subscribeToAuthChanges(
    callback: (user: User | null) => void
): () => void {
    return onAuthStateChanged(auth, callback);
}

/**
 * Obtém o usuário atualmente autenticado
 * @returns Usuário atual ou null
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}
