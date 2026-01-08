import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { MOCK_QUESTIONS } from '../data/mockQuestions';
import type { QuestionDocument, TestCase } from '../types/question';

const QUESTIONS_COLLECTION = 'questions';

/**
 * Sanitiza dados para o Firestore (converte nested arrays para JSON strings)
 * O Firestore não suporta arrays aninhados, então serializamos os inputs complexos
 */
function sanitizeForFirestore(question: QuestionDocument): Record<string, unknown> {
    const { id, ...data } = question;

    // Se tem testes, serializa inputs que são arrays
    if (data.tests && Array.isArray(data.tests)) {
        data.tests = data.tests.map(test => ({
            ...test,
            // Serializa input se for array (para evitar nested arrays)
            input: Array.isArray(test.input) ? JSON.stringify(test.input) : test.input,
            inputSerialized: Array.isArray(test.input),
        }));
    }

    return data as Record<string, unknown>;
}

/**
 * Desserializa dados vindos do Firestore
 */
function deserializeFromFirestore(data: Record<string, unknown>, id: string): QuestionDocument {
    const question = { ...data, id } as QuestionDocument;

    // Desserializa inputs que foram serializados
    if (question.tests && Array.isArray(question.tests)) {
        question.tests = question.tests.map((test: TestCase & { inputSerialized?: boolean }) => {
            if (test.inputSerialized && typeof test.input === 'string') {
                const { inputSerialized, ...rest } = test;
                return { ...rest, input: JSON.parse(test.input as string) };
            }
            const { inputSerialized, ...rest } = test;
            return rest;
        });
    }

    return question;
}

/**
 * Popula o Firestore com as questões mock
 * Esta função deve ser chamada apenas uma vez para inicializar o banco
 */
export async function seedQuestions(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        // Verifica se já existem questões no Firestore
        const existingDocs = await getDocs(collection(db, QUESTIONS_COLLECTION));

        if (!existingDocs.empty) {
            console.log(`Firestore já contém ${existingDocs.size} questões. Pulando seed.`);
            return { success: true, count: existingDocs.size };
        }

        // Usa batch para operações em lote (mais eficiente)
        const batch = writeBatch(db);

        for (const question of MOCK_QUESTIONS) {
            const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
            const sanitizedData = sanitizeForFirestore(question);
            batch.set(docRef, sanitizedData);
        }

        await batch.commit();

        console.log(`✅ ${MOCK_QUESTIONS.length} questões inseridas no Firestore com sucesso!`);
        return { success: true, count: MOCK_QUESTIONS.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro ao popular Firestore:', message);
        return { success: false, count: 0, error: message };
    }
}

/**
 * Busca todas as questões do Firestore
 * Retorna as questões mock como fallback se houver erro
 */
export async function fetchAllQuestions(): Promise<QuestionDocument[]> {
    try {
        const querySnapshot = await getDocs(collection(db, QUESTIONS_COLLECTION));

        if (querySnapshot.empty) {
            console.log('Firestore vazio, usando questões locais');
            return MOCK_QUESTIONS;
        }

        const questions = querySnapshot.docs.map(docSnap =>
            deserializeFromFirestore(docSnap.data(), docSnap.id)
        );

        console.log(`📚 ${questions.length} questões carregadas do Firestore`);
        return questions;
    } catch (error) {
        console.warn('Erro ao buscar questões do Firestore, usando fallback local:', error);
        return MOCK_QUESTIONS;
    }
}

/**
 * Atualiza uma questão existente no Firestore
 */
export async function updateQuestion(question: QuestionDocument): Promise<void> {
    const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
    const sanitizedData = sanitizeForFirestore(question);
    await setDoc(docRef, sanitizedData, { merge: true });
}

/**
 * Adiciona uma nova questão ao Firestore
 */
export async function addQuestion(question: QuestionDocument): Promise<void> {
    const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
    const sanitizedData = sanitizeForFirestore(question);
    await setDoc(docRef, sanitizedData);
}

/**
 * Força o re-seed (deleta tudo e insere de novo)
 * ⚠️ Use com cuidado! Isso apaga todas as questões existentes.
 */
export async function forceSeedQuestions(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        // Deleta todas as questões existentes primeiro
        const existingDocs = await getDocs(collection(db, QUESTIONS_COLLECTION));
        const deleteBatch = writeBatch(db);

        existingDocs.docs.forEach(docSnap => {
            deleteBatch.delete(doc(db, QUESTIONS_COLLECTION, docSnap.id));
        });

        await deleteBatch.commit();
        console.log(`🗑️ ${existingDocs.size} questões antigas deletadas`);

        // Agora insere as novas
        const insertBatch = writeBatch(db);

        for (const question of MOCK_QUESTIONS) {
            const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
            const sanitizedData = sanitizeForFirestore(question);
            insertBatch.set(docRef, sanitizedData);
        }

        await insertBatch.commit();

        console.log(`✅ ${MOCK_QUESTIONS.length} questões inseridas no Firestore com sucesso!`);
        return { success: true, count: MOCK_QUESTIONS.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro ao popular Firestore:', message);
        return { success: false, count: 0, error: message };
    }
}

