import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { COMPLETE_QUESTIONS as ALL_QUESTIONS } from '../data/completeQuestions';
import type { QuestionDocument, TestCase } from '../types/question';

const QUESTIONS_COLLECTION = 'questions';

/**
 * Sanitiza dados para o Firestore (converte nested arrays para JSON strings)
 * O Firestore não suporta arrays aninhados, então serializamos os inputs complexos
 */
function sanitizeForFirestore(question: QuestionDocument): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { inputSerialized, ...rest } = test;
                return { ...rest, input: JSON.parse(test.input as string) };
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { inputSerialized, ...rest } = test;
            return rest;
        });
    }

    return question;
}

/**
 * Sincroniza automaticamente as questões se houver diferenças
 * Compara a quantidade e IDs das questões locais vs Firestore
 */
export async function autoSyncQuestions(): Promise<{ synced: boolean; count: number; message: string }> {
    try {
        const localCount = ALL_QUESTIONS.length;
        const localIds = new Set(ALL_QUESTIONS.map(q => q.id));

        // Busca questões existentes
        const existingDocs = await getDocs(collection(db, QUESTIONS_COLLECTION));


        // Questões que precisam ser removidas (estão no Firestore mas não no código)
        const toRemove = existingDocs.docs.filter(d => !localIds.has(d.id));

        // Simplificação: Sempre atualiza TODAS as questões locais para garantir que mudanças de conteúdo
        // sejam refletidas (ex: mudança no enunciado ou testes).
        // Isso cobre tanto ADIÇÃO quanto ATUALIZAÇÃO.
        const toUpsert = ALL_QUESTIONS;

        console.log(`🔄 Sincronizando: ${toUpsert.length} questões para atualizar/inserir, -${toRemove.length} removidas`);

        // Usa batch para operações em lote (limite de 500 por batch)
        const BATCH_SIZE = 450; // Margem de segurança

        // Processa upserts em batches
        for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = toUpsert.slice(i, i + BATCH_SIZE);

            for (const question of chunk) {
                const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
                const sanitizedData = sanitizeForFirestore(question);
                batch.set(docRef, sanitizedData); // Sobrescreve dados
            }

            await batch.commit();
        }

        // Remove questões obsoletas
        for (let i = 0; i < toRemove.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = toRemove.slice(i, i + BATCH_SIZE);

            for (const docSnap of chunk) {
                batch.delete(doc(db, QUESTIONS_COLLECTION, docSnap.id));
            }

            await batch.commit();
        }

        const message = `Sincronizado: ${toUpsert.length} atualizadas/verificadas, ${toRemove.length > 0 ? `-${toRemove.length} removidas` : ''}`.trim();
        console.log(`✅ ${message}`);

        return { synced: true, count: localCount, message };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro ao sincronizar:', message);
        return { synced: false, count: 0, message: `Erro: ${message}` };
    }
}

/**
 * Popula o Firestore com as questões (primeira vez)
 * Se já existem questões, usa autoSync para atualizar
 */
export async function seedQuestions(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        // Usa o auto-sync ao invés da lógica antiga
        const result = await autoSyncQuestions();
        return { success: true, count: result.count };
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
            return ALL_QUESTIONS;
        }

        const questions = querySnapshot.docs.map(docSnap =>
            deserializeFromFirestore(docSnap.data(), docSnap.id)
        );

        console.log(`📚 ${questions.length} questões carregadas do Firestore`);
        return questions;
    } catch (error) {
        console.warn('Erro ao buscar questões do Firestore, usando fallback local:', error);
        return ALL_QUESTIONS;
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

        for (const question of ALL_QUESTIONS) {
            const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
            const sanitizedData = sanitizeForFirestore(question);
            insertBatch.set(docRef, sanitizedData);
        }

        await insertBatch.commit();

        console.log(`✅ ${ALL_QUESTIONS.length} questões inseridas no Firestore com sucesso!`);
        return { success: true, count: ALL_QUESTIONS.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('❌ Erro ao popular Firestore:', message);
        return { success: false, count: 0, error: message };
    }
}

