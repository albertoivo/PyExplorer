import { collection, doc, getDoc, getDocs, setDoc, query, where, Timestamp, writeBatch, type DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { UserProgress, ProgressStatus } from '../../types/question';
import { updateUserScore } from './usersService';
import { LEADERBOARD_COLLECTION } from './leaderboardService';

const PROGRESS_COLLECTION = 'userProgress';
const USERS_COLLECTION = 'users';

/**
 * Gera o ID do documento de progresso
 */
export function getProgressDocId(uid: string, questionId: string): string {
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
        const dataToSave: Record<string, unknown> = {
            uid: progress.uid,
            questionId: progress.questionId,
            status: progress.status,
            score: progress.score,
            attempts: progress.attempts,
            stars: progress.stars,
            lastAttemptAt: progress.lastAttemptAt ? Timestamp.fromDate(progress.lastAttemptAt) : null,
        };

        // Inclui apenas se houver valor definido
        if (progress.bestTimeSeconds !== undefined) {
            dataToSave.bestTimeSeconds = progress.bestTimeSeconds;
        }

        // Só inclui userAnswer se não for undefined
        if (progress.userAnswer !== undefined) {
            dataToSave.userAnswer = progress.userAnswer;
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
