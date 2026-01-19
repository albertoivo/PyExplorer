import { QuestionDocument, UserProgress } from '../types/question';

/**
 * Checks if the Boss Battle should be unlocked.
 * A Boss Battle is unlocked when all non-boss questions in the current world are completed.
 *
 * This function is optimized to avoid O(N) allocations (filter) and multiple iterations.
 * It does a single pass over the questions.
 *
 * @param worldQuestions List of all questions in the current world
 * @param getQuestionProgress Function to retrieve progress for a question ID (must be O(1))
 * @returns boolean true if boss is unlocked
 */
export const isBossUnlocked = (
    worldQuestions: QuestionDocument[],
    getQuestionProgress: (id: string) => UserProgress | null
): boolean => {
    // If no questions, logic is trivial (but maybe shouldn't happen)
    if (!worldQuestions.length) return false;

    // We iterate once.
    // Logic: The boss is UNLOCKED if every question is EITHER (a boss battle) OR (completed).
    // If we find any question that is NOT a boss battle AND NOT completed, then boss is LOCKED.

    return worldQuestions.every(q => {
        if (q.type === 'boss_battle') return true; // Ignore other boss battles (if any)

        const progress = getQuestionProgress(q.id);
        return progress?.status === 'completed';
    });
};
