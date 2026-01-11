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

const USERS_COLLECTION = 'users';

/**
 * Cria ou atualiza dados do usuário
 * @param userData - Dados do usuário
 */
export async function saveUser(userData: UserData): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userData.uid);
    await setDoc(docRef, {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        updatedAt: Timestamp.fromDate(userData.updatedAt),
    }, { merge: true });
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
        const docRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(docRef, {
            totalScore: user.totalScore + additionalScore,
            updatedAt: Timestamp.now(),
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
    await setDoc(docRef, {
        ...progress,
        lastAttemptAt: progress.lastAttemptAt ? Timestamp.fromDate(progress.lastAttemptAt) : null,
    }, { merge: true });
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
 */
export async function updateProgress(
    uid: string,
    questionId: string,
    passed: boolean,
    score: number = 0
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
        attempts: newAttempts,
        lastAttemptAt: new Date(),
    });

    // Se passou, atualiza pontuação total do usuário
    if (passed && score > 0 && (!existing || existing.score < score)) {
        const additionalScore = score - (existing?.score || 0);
        await updateUserScore(uid, additionalScore);
    }
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
        collection(db, USERS_COLLECTION),
        orderBy('totalScore', 'desc'),
        limit(topN)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data() as DocumentData;
        return {
            ...data,
            uid: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserData;
    });
}

