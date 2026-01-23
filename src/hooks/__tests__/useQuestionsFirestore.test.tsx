import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useQuestionsFirestore } from '../useQuestionsFirestore';
import { fetchAllQuestions, autoSyncQuestions } from '../../firebase/questionsService';
import type { QuestionDocument } from '../../types/question';

vi.mock('../../firebase/questionsService', () => ({
    fetchAllQuestions: vi.fn(),
    autoSyncQuestions: vi.fn(),
}));

describe('useQuestionsFirestore', () => {
    it('should optimize lookups with questionsByWorld', async () => {
        const mockQuestions: QuestionDocument[] = [
            { id: '1', world: 'basic_commands', title: 'Q1' } as any,
            { id: '2', world: 'basic_commands', title: 'Q2' } as any,
            { id: '3', world: 'loops', title: 'Q3' } as any,
        ];

        (fetchAllQuestions as any).mockResolvedValue(mockQuestions);
        (autoSyncQuestions as any).mockResolvedValue({ synced: true, message: 'Synced' });

        const { result } = renderHook(() => useQuestionsFirestore());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.questions).toHaveLength(3);

        // Verify questionsByWorld map
        expect(result.current.questionsByWorld.size).toBe(2);
        expect(result.current.questionsByWorld.get('basic_commands')).toHaveLength(2);
        expect(result.current.questionsByWorld.get('loops')).toHaveLength(1);

        // Verify getQuestionsByWorld (O(1) lookup)
        expect(result.current.getQuestionsByWorld('basic_commands')).toHaveLength(2);
        expect(result.current.getQuestionsByWorld('loops')).toHaveLength(1);
        expect(result.current.getQuestionsByWorld('conditions')).toHaveLength(0); // non-existent

        // Verify availableWorlds (O(W))
        expect(result.current.availableWorlds).toEqual(['basic_commands', 'loops']);
    });
});
