import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { QuestionDocument, World, Difficulty } from '../types/question';

// Re-exports from services to maintain backward compatibility
export { getUser, saveUser, updateUserScore, unlockWorld } from './services/usersService';
export { getProgress, saveProgress, getUserProgress, updateProgress, updateProgressBatch } from './services/progressService';
export { getGamification, saveGamificationData } from './services/gamificationService';
export { getTopUsers } from './services/leaderboardService';

// ============================================
// SERVIÇO DE QUESTÕES
// ============================================

const QUESTIONS_COLLECTION = 'questions';

/**
 * Busca uma questão pelo ID
 * @param questionId - ID da questão
 * @returns Questão ou null se não encontrada
 */
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
export async function getQuestionsByWorld(world: World): Promise<QuestionDocument[]> {
    return getQuestions({ world });
}
