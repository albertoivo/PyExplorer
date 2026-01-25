import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    writeBatch,
    deleteField,
} from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type {
    QuestionDocument,
    UserData,
    UserProgress,
    World,
    Difficulty,
    ProgressStatus,
} from '../types/question';
import type { UserGamification, UserAchievement, UserMission } from '../types/gamification';

// ============================================
// SERVIÇO DE QUESTÕES
// ============================================

const QUESTIONS_COLLECTION = 'questions';

/**
 * Busca uma questão pelo ID
 * @param questionId - ID da questão
 * @returns Questão ou null se não encontrada
 */
export async function getQuestion(questionId: string): Promise<QuestionDocument | null> {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as QuestionDocument;
    }
    return null;
}

/**
 * Busca questões com filtros
 * @param filters - Filtros opcionais (mundo, dificuldade, limite)
 * @returns Array de questões
 */
export async function getQuestions(filters?: {
    world?: World;
    difficulty?: Difficulty;
    limitCount?: number;
}): Promise<QuestionDocument[]> {
    const constraints: QueryConstraint[] = [];

    if (filters?.world) {
        constraints.push(where('world', '==', filters.world));
    }
    if (filters?.difficulty) {
        constraints.push(where('difficulty', '==', filters.difficulty));
    }
    constraints.push(orderBy('difficulty'));
    if (filters?.limitCount) {
        constraints.push(limit(filters.limitCount));
    }

    const q = query(collection(db, QUESTIONS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as QuestionDocument[];
}

/**
 * Busca questões de um mundo específico
 * @param world - Mundo/tema
 * @returns Array de questões do mundo
 */
export async function getQuestionsByWorld(world: World): Promise<QuestionDocument[]> {
    return getQuestions({ world });
}

// ============================================
// SERVIÇO DE USUÁRIOS
// ============================================

// ============================================
// SERVIÇO DE USUÁRIOS
// ============================================

const USERS_COLLECTION = 'users';
const LEADERBOARD_COLLECTION = 'leaderboard';

/**
 * Atualiza os dados públicos do usuário no leaderboard
 * @param userData - Dados completos do usuário
 */
async function updateLeaderboard(userData: UserData): Promise<void> {
    // Admin não vai para o leaderboard
    if (userData.email === 'albertoivo@gmail.com') {
        return;
    }

    const docRef = doc(db, LEADERBOARD_COLLECTION, userData.uid);
    try {
        // Salva apenas dados seguros/públicos
        await setDoc(docRef, {
            uid: userData.uid,
            displayName: userData.displayName,
            avatar: userData.avatar,
            totalScore: userData.totalScore,
            updatedAt: Timestamp.now(),
        }, { merge: true });
    } catch (err) {
        console.error('[DEBUG] FALHOU em updateLeaderboard:', err);
        throw err;
    }
}

/**
 * Cria ou atualiza dados do usuário
 * @param userData - Dados do usuário
 */
export async function saveUser(userData: UserData): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userData.uid);

    await setDoc(docRef, {
        ...userData,
        // Explicitly delete deprecated fields to satisfy strict hasOnly rules
        streak: deleteField(),
        longestStreak: deleteField(),
        lastActiveDate: deleteField(),
        inventory: deleteField(),
        equippedAvatar: deleteField(),
        createdAt: Timestamp.fromDate(userData.createdAt),
        updatedAt: Timestamp.fromDate(userData.updatedAt),
        ...(userData.lastLoginAt ? { lastLoginAt: Timestamp.fromDate(userData.lastLoginAt) } : {}),
    }, { merge: true });

    // Sincroniza com leaderboard
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
        const newScore = user.totalScore + additionalScore;
        const docRef = doc(db, USERS_COLLECTION, uid);

        try {
            await updateDoc(docRef, {
                totalScore: newScore,
                updatedAt: Timestamp.now(),
            });
        } catch (err) {
            console.error('[DEBUG] FALHOU ao atualizar users:', err);
            throw err;
        }

        // Atualiza leaderboard com o novo score
        await updateLeaderboard({
            ...user,
            totalScore: newScore
        });
    }
}

/**
 * Desbloqueia um mundo para o usuário
 * @param uid - ID do usuário
 * @param world - Mundo a desbloquear
 */
export async function unlockWorld(uid: string, world: World): Promise<void> {
    const user = await getUser(uid);
    if (user && !user.unlockedWorlds.includes(world)) {
        const docRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(docRef, {
            unlockedWorlds: [...user.unlockedWorlds, world],
            updatedAt: Timestamp.now(),
        });
    }
}

// ============================================
// SERVIÇO DE PROGRESSO
// ============================================

const PROGRESS_COLLECTION = 'userProgress';

/**
 * Gera o ID do documento de progresso
 */
function getProgressDocId(uid: string, questionId: string): string {
    return `${uid}_${questionId}`;
}

/**
 * Salva ou atualiza o progresso do usuário em uma questão
 * @param progress - Dados do progresso
 */
export async function saveProgress(progress: UserProgress): Promise<void> {
    const docId = getProgressDocId(progress.uid, progress.questionId);
    const docRef = doc(db, PROGRESS_COLLECTION, docId);
    try {
        // Filtra campos undefined pois Firestore não aceita undefined
        const dataToSave = {
            uid: progress.uid,
            questionId: progress.questionId,
            status: progress.status,
            score: progress.score,
            attempts: progress.attempts,
            stars: progress.stars,
            bestTimeSeconds: progress.bestTimeSeconds,
            lastAttemptAt: progress.lastAttemptAt ? Timestamp.fromDate(progress.lastAttemptAt) : null,
        };

        // Só inclui userAnswer se não for undefined
        if (progress.userAnswer !== undefined) {
            (dataToSave as Record<string, unknown>).userAnswer = progress.userAnswer;
        }

        await setDoc(docRef, dataToSave, { merge: true });
    } catch (err) {
        console.error('[DEBUG] FALHOU em saveProgress:', err);
        throw err;
    }
}

/**
 * Busca o progresso do usuário em uma questão
 * @param uid - ID do usuário
 * @param questionId - ID da questão
 * @returns Progresso ou null
 */
export async function getProgress(uid: string, questionId: string): Promise<UserProgress | null> {
    const docId = getProgressDocId(uid, questionId);
    const docRef = doc(db, PROGRESS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        return {
            ...data,
            lastAttemptAt: data.lastAttemptAt?.toDate() || null,
        } as UserProgress;
    }
    return null;
}

/**
 * Busca todo o progresso do usuário
 * @param uid - ID do usuário
 * @returns Array de progressos
 */
export async function getUserProgress(uid: string): Promise<UserProgress[]> {
    const q = query(
        collection(db, PROGRESS_COLLECTION),
        where('uid', '==', uid)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
            ...data,
            lastAttemptAt: data.lastAttemptAt?.toDate() || null,
        } as UserProgress;
    });
}

/**
 * Atualiza o progresso de uma questão após uma tentativa
 * @param uid - ID do usuário
 * @param questionId - ID da questão
 * @param passed - Se a tentativa foi bem-sucedida
 * @param score - Pontuação obtida (se passou)
 * @param userAnswer - Resposta do usuário (código, índice, booleano, etc.)
 * @param stars - Rating de estrelas (0-3)
 * @param bestTimeSeconds - Melhor tempo de resposta
 */
export async function updateProgress(
    uid: string,
    questionId: string,
    passed: boolean,
    score: number = 0,
    userAnswer?: unknown,
    stars?: 0 | 1 | 2 | 3,
    bestTimeSeconds?: number
): Promise<void> {
    const existing = await getProgress(uid, questionId);

    const newStatus: ProgressStatus = passed ? 'completed' : 'in_progress';
    const newAttempts = (existing?.attempts || 0) + 1;
    const newScore = passed ? Math.max(existing?.score || 0, score) : (existing?.score || 0);

    await saveProgress({
        uid,
        questionId,
        status: newStatus,
        score: newScore,
        stars: stars ?? existing?.stars ?? 0,
        attempts: newAttempts,
        bestTimeSeconds: bestTimeSeconds ?? existing?.bestTimeSeconds,
        lastAttemptAt: new Date(),
        // Salva resposta apenas se passou, senão preserva a anterior
        userAnswer: passed && userAnswer !== undefined
            ? userAnswer as UserProgress['userAnswer']
            : existing?.userAnswer,
    });

    // Se passou, atualiza pontuação total do usuário
    if (passed && score > 0 && (!existing || existing.score < score)) {
        const additionalScore = score - (existing?.score || 0);
        await updateUserScore(uid, additionalScore);
    }
}

/**
 * Atualiza o progresso de múltiplas questões em lote (batch)
 * Ideal para sincronização offline
 */
export async function updateProgressBatch(
    uid: string,
    items: { questionId: string; passed: boolean; score: number }[]
): Promise<void> {
    const batch = writeBatch(db);
    let totalScoreToAdd = 0;

    // Precisamos buscar o progresso atual de todos os itens para calcular diff de score
    // Como batch.get() não existe, temos que fazer leituras paralelas
    // Isso é aceitável pois é uma operação de sincronização menos frequente
    const progressPromises = items.map(item => getProgress(uid, item.questionId));
    const currentProgresses = await Promise.all(progressPromises);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const existing = currentProgresses[i];

        const docId = getProgressDocId(uid, item.questionId);
        const docRef = doc(db, PROGRESS_COLLECTION, docId);

        const newStatus: ProgressStatus = item.passed ? 'completed' : 'in_progress';
        const newAttempts = (existing?.attempts || 0) + 1;
        const newScore = item.passed ? Math.max(existing?.score || 0, item.score) : (existing?.score || 0);

        batch.set(docRef, {
            uid,
            questionId: item.questionId,
            status: newStatus,
            score: newScore,
            attempts: newAttempts,
            lastAttemptAt: Timestamp.now(),
        }, { merge: true });

        // Calcula score adicional
        if (item.passed && item.score > 0 && (!existing || existing.score < item.score)) {
            totalScoreToAdd += item.score - (existing?.score || 0);
        }
    }

    // Se houve ganho de pontos, atualiza o usuário também
    if (totalScoreToAdd > 0) {
        // Precisamos ler o usuário atual para atualizar o score total no batch
        // Ou podemos apenas fazer um updateDoc separado se preferir
        // Para manter consistência, vamos ler e usar o batch
        const userRef = doc(db, USERS_COLLECTION, uid);
        const leaderboardRef = doc(db, LEADERBOARD_COLLECTION, uid);

        // Nota: Em um batch real, idealmente leríamos o user antes, mas como já fizemos leituras acima,
        // vamos simplificar usando increment do Firestore se possível, mas como não importamos increment,
        // vamos fazer uma leitura extra do user.
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const newTotalScore = (userData.totalScore || 0) + totalScoreToAdd;

            batch.update(userRef, {
                totalScore: newTotalScore,
                updatedAt: Timestamp.now()
            });

            // Atualiza leaderboard
            batch.set(leaderboardRef, {
                uid: uid,
                displayName: userData.displayName,
                avatar: userData.avatar,
                totalScore: newTotalScore,
                updatedAt: Timestamp.now(),
            }, { merge: true });
        }
    }

    await batch.commit();
}

// ============================================
// SERVIÇO DE GAMIFICAÇÃO
// ============================================

const GAMIFICATION_COLLECTION = 'gamification';

/**
 * Salva os dados de gamificação do usuário
 * @param uid - ID do usuário
 * @param data - Dados de gamificação
 */
export async function saveGamificationData(uid: string, data: UserGamification): Promise<void> {
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

    await setDoc(docRef, firestoreData, { merge: true });
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

// ============================================
// SERVIÇO DE LEADERBOARD
// ============================================

/**
 * Busca os top usuários por pontuação
 * @param topN - Número máximo de usuários a retornar (default: 10)
 * @returns Array de usuários ordenados por pontuação decrescente
 */
export async function getTopUsers(topN: number = 10): Promise<UserData[]> {
    const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('totalScore', 'desc'),
        limit(topN)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data() as DocumentData;

        // Mapeia explicitamente para garantir que o TS reconheça os campos
        const userData: UserData = {
            uid: docSnap.id,
            displayName: data.displayName || 'Jogador',
            avatar: data.avatar || '🧑‍💻',
            totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,

            // Campos de data
            updatedAt: data.updatedAt?.toDate() || new Date(),
            createdAt: new Date(), // Leaderboard não precisa saber a data real de criação

            // Campos dummy para satisfazer a interface UserData (não usados no Leaderboard)
            email: '',
            balance: 0,
            unlockedWorlds: [],
        };

        return userData;
    });
}

