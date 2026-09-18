import { doc, getDoc, setDoc, Timestamp, type DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { UserData, World } from '../../types/question';
import { updateLeaderboard } from './leaderboardService';
import { getGamification } from './gamificationService';

const USERS_COLLECTION = 'users';

/**
 * Monta um objeto limpo de UserData para gravação no Firestore,
 * contendo apenas os campos permitidos pelas regras (hasOnly).
 * Usar setDoc SEM merge garante que campos legados são removidos.
 */
function buildCleanUserDoc(userData: UserData): Record<string, unknown> {
    const clean: Record<string, unknown> = {
        uid: userData.uid,
        displayName: userData.displayName,
        avatar: userData.avatar,
        email: userData.email,
        createdAt: userData.createdAt instanceof Date ? Timestamp.fromDate(userData.createdAt) : userData.createdAt,
        updatedAt: userData.updatedAt instanceof Date ? Timestamp.fromDate(userData.updatedAt) : userData.updatedAt,
        totalScore: userData.totalScore,
        balance: userData.balance,
        unlockedWorlds: userData.unlockedWorlds,
    };
    if (userData.lastLoginAt) {
        clean.lastLoginAt = Timestamp.fromDate(userData.lastLoginAt);
    }
    return clean;
}

/**
 * Cria ou atualiza dados do usuário.
 * Usa setDoc sem merge para remover campos legados e satisfazer hasOnly nas regras.
 */
export async function saveUser(userData: UserData): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userData.uid);
    await setDoc(docRef, buildCleanUserDoc(userData));
    await updateLeaderboard(userData);
}

/**
 * Busca dados do usuário
 * @param uid - ID do usuário
 * @returns Dados do usuário ou null
 */
export async function getUser(uid: string): Promise<UserData | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        return {
            ...data,
            uid: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate(),
        } as UserData;
    }
    return null;
}

/**
 * Atualiza a pontuação total do usuário
 * @param uid - ID do usuário
 * @param additionalScore - Pontos a adicionar
 */
export async function updateUserScore(uid: string, additionalScore: number): Promise<void> {
    const user = await getUser(uid);
    if (user) {
        const updatedUser = { ...user, totalScore: user.totalScore + additionalScore, updatedAt: new Date() };
        const docRef = doc(db, USERS_COLLECTION, uid);

        // Usa setDoc sem merge para garantir documento limpo (sem campos legados)
        await setDoc(docRef, buildCleanUserDoc(updatedUser));

        // Busca o nível atual da gamificação para sincronizar com o leaderboard
        const gamification = await getGamification(uid);
        const currentLevel = gamification?.level?.level || 1;
        await updateLeaderboard(updatedUser, currentLevel);
    }
}

/**
 * Desbloqueia um mundo para o usuário
 * @param uid - ID do usuário
 * @param world - Mundo a desbloquear
 */
// fallow-ignore-next-line unused-export
export async function unlockWorld(uid: string, world: World): Promise<void> {
    const user = await getUser(uid);
    if (user && !user.unlockedWorlds.includes(world)) {
        const updatedUser = {
            ...user,
            unlockedWorlds: [...user.unlockedWorlds, world],
            updatedAt: new Date(),
        };
        const docRef = doc(db, USERS_COLLECTION, uid);
        // Usa setDoc sem merge para garantir documento limpo (sem campos legados)
        await setDoc(docRef, buildCleanUserDoc(updatedUser));
    }
}
