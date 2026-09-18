import { doc, getDoc, setDoc, Timestamp, type DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { UserGamification, UserAchievement, UserMission } from '../../types/gamification';
import { getUser } from './usersService';
import { updateLeaderboard, LEADERBOARD_COLLECTION } from './leaderboardService';

const GAMIFICATION_COLLECTION = 'gamification';

/**
 * Valida os dados de gamificação antes de salvar
 * (Validação runtime para complementar as Firestore Rules que não validam arrays profundos)
 */
export function validateGamificationData(data: UserGamification): void {
    if (!data.level || typeof data.level.level !== 'number') {
        throw new Error('Dados de nível inválidos');
    }

    if (!Array.isArray(data.achievements)) {
        throw new Error('Achievements deve ser um array');
    }

    data.achievements.forEach((a, i) => {
        if (!a.achievementId || typeof a.achievementId !== 'string') {
            throw new Error(`Achievement [${i}] inválido: ID ausente`);
        }
        if (!(a.unlockedAt instanceof Date)) {
            throw new Error(`Achievement [${i}] inválido: Data inválida`);
        }
    });

    if (!Array.isArray(data.activeMissions)) {
        throw new Error('ActiveMissions deve ser um array');
    }

    data.activeMissions.forEach((m, i) => {
        if (!m.missionId || typeof m.missionId !== 'string') {
            throw new Error(`Mission [${i}] inválida: ID ausente`);
        }
        if (!(m.expiresAt instanceof Date)) {
            throw new Error(`Mission [${i}] inválida: Data de expiração inválida`);
        }
    });
}

/**
 * Salva os dados de gamificação do usuário
 * @param uid - ID do usuário
 * @param data - Dados de gamificação
 */
export async function saveGamificationData(uid: string, data: UserGamification): Promise<void> {
    // Validação runtime prévia
    validateGamificationData(data);

    const docRef = doc(db, GAMIFICATION_COLLECTION, uid);

    // Converte datas para Timestamp do Firestore
    const firestoreData = {
        ...data,
        achievements: data.achievements.map(a => ({
            ...a,
            unlockedAt: Timestamp.fromDate(a.unlockedAt),
        })),
        activeMissions: data.activeMissions.map(m => ({
            ...m,
            expiresAt: Timestamp.fromDate(m.expiresAt),
            completedAt: m.completedAt ? Timestamp.fromDate(m.completedAt) : null,
        })),
        updatedAt: Timestamp.now(),
    };

    // Importante: escreve o documento completo (sem merge) para remover campos legados
    // que podem violar regras com hasOnly(...) e causar permission-denied.
    await setDoc(docRef, firestoreData);

    // Sincroniza o nível no leaderboard
    // Busca dados do usuário para garantir que o leaderboard tenha todos os campos
    try {
        const user = await getUser(uid);
        if (user) {
            // Se o usuário existe, atualiza o leaderboard com todos os dados
            await updateLeaderboard(user, data.level.level);
        } else {
            // Fallback: apenas atualiza o nível se não conseguir buscar o usuário
            const leaderboardRef = doc(db, LEADERBOARD_COLLECTION, uid);
            await setDoc(leaderboardRef, {
                level: data.level.level,
                updatedAt: Timestamp.now(),
            }, { merge: true });
        }
    } catch (err) {
        console.warn('Erro ao sincronizar nível no leaderboard:', err);
        // Não falha o saveGamification se o leaderboard falhar
    }
}

/**
 * Busca os dados de gamificação do usuário
 * @param uid - ID do usuário
 * @returns Dados de gamificação ou null
 */
export async function getGamification(uid: string): Promise<UserGamification | null> {
    const docRef = doc(db, GAMIFICATION_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();

        // Converte Timestamps de volta para Date
        return {
            ...data,
            achievements: (data.achievements || []).map((a: DocumentData) => ({
                ...a,
                unlockedAt: a.unlockedAt instanceof Timestamp ? a.unlockedAt.toDate() : new Date(a.unlockedAt),
            })) as UserAchievement[],
            activeMissions: (data.activeMissions || []).map((m: DocumentData) => ({
                ...m,
                expiresAt: m.expiresAt instanceof Timestamp ? m.expiresAt.toDate() : new Date(m.expiresAt),
                completedAt: m.completedAt instanceof Timestamp ? m.completedAt.toDate() : (m.completedAt ? new Date(m.completedAt) : undefined),
            })) as UserMission[],
        } as UserGamification;
    }

    return null;
}
