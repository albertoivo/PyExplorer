import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, limit, Timestamp, type DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { UserData, World } from '../../types/question';
import { getGamification } from './gamificationService';

export const LEADERBOARD_COLLECTION = 'leaderboard';
const GAMIFICATION_COLLECTION = 'gamification';

/**
 * Atualiza os dados públicos do usuário no leaderboard
 * @param userData - Dados completos do usuário
 * @param level - Nível opcional do usuário (se disponível). Se não fornecido, busca da gamificação.
 */
export async function updateLeaderboard(userData: UserData, level?: number): Promise<void> {
    // Admin não vai para o leaderboard
    if (userData.email === 'albertoivo@gmail.com') {
        return;
    }

    const docRef = doc(db, LEADERBOARD_COLLECTION, userData.uid);
    try {
        // Se nível não foi fornecido, tenta buscar da gamificação
        let resolvedLevel = level;
        if (resolvedLevel === undefined) {
            try {
                const gamification = await getGamification(userData.uid);
                resolvedLevel = gamification?.level?.level ?? 1;
            } catch {
                resolvedLevel = 1;
            }
        }

        const dataToUpdate: Record<string, unknown> = {
            uid: userData.uid,
            displayName: userData.displayName,
            avatar: userData.avatar,
            totalScore: userData.totalScore,
            level: resolvedLevel,
            updatedAt: Timestamp.now(),
        };

        // Salva apenas dados seguros/públicos
        await setDoc(docRef, dataToUpdate, { merge: true });
    } catch (err) {
        console.error('[DEBUG] FALHOU em updateLeaderboard:', err);
        throw err;
    }
}

/**
 * Busca os top usuários por pontuação
 * @param topN - Número máximo de usuários a retornar (default: 10)
 * @returns Array de usuários ordenados por pontuação decrescente
 */
export async function getTopUsers(topN: number = 10): Promise<(UserData & { level?: number })[]> {
    const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('totalScore', 'desc'),
        limit(topN)
    );
    const querySnapshot = await getDocs(q);

    // Mapeia os dados básicos do leaderboard
    const leaderboardUsers: (UserData & { level?: number })[] = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data() as DocumentData;
        return {
            uid: docSnap.id,
            displayName: data.displayName || 'Jogador',
            avatar: data.avatar || '🧑‍💻',
            totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
            level: typeof data.level === 'number' ? data.level : undefined,
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdAt: new Date(),
            email: '',
            balance: 0,
            unlockedWorlds: [] as World[],
        };
    });

    // Para usuários sem nível ou com nível 1, busca da coleção gamification
    const usersNeedingLevel = leaderboardUsers.filter(u => !u.level || u.level <= 1);

    if (usersNeedingLevel.length > 0) {
        // Busca os níveis da coleção gamification em paralelo
        const levelPromises = usersNeedingLevel.map(async (user) => {
            try {
                const gamificationDoc = await getDoc(doc(db, GAMIFICATION_COLLECTION, user.uid));
                if (gamificationDoc.exists()) {
                    const gamificationData = gamificationDoc.data();
                    const level = gamificationData?.level?.level;
                    if (typeof level === 'number' && level > 1) {
                        return { uid: user.uid, level };
                    }
                }
            } catch {
                // Silently ignore errors for individual users
            }
            return null;
        });

        const levelResults = await Promise.all(levelPromises);

        const writeBackPromises: Promise<void>[] = [];
        // Atualiza os níveis encontrados (runtime) e persiste no leaderboard para os próximos acessos
        levelResults.forEach(result => {
            if (result) {
                const user = leaderboardUsers.find(u => u.uid === result.uid);
                if (user) {
                    user.level = result.level;
                    const docRef = doc(db, LEADERBOARD_COLLECTION, result.uid);
                    writeBackPromises.push(setDoc(docRef, {
                        level: result.level,
                        updatedAt: Timestamp.now(),
                    }, { merge: true }));
                }
            }
        });

        if (writeBackPromises.length > 0) {
            await Promise.all(writeBackPromises);
        }
    }

    return leaderboardUsers;
}
