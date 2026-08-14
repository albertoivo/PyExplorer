import type { World, QuestionDocument, UserProgress } from '../../types/question';
import { QuestionCard } from './QuestionCard';
import { useTranslation } from 'react-i18next';

export interface WorldQuestionsViewProps {
    selectedWorld: World;
    worldName: string;
    sortedQuestions: QuestionDocument[];
    completedCount: number;
    totalCount: number;
    bossBattleUnlocked: boolean;
    getQuestionProgress: (questionId: string) => UserProgress | null;
    onBackToMap: () => void;
    onStartQuestion: (question: QuestionDocument) => void;
}

/**
 * Componente que renderiza a lista de questões de um mundo selecionado.
 */
export function WorldQuestionsView({
    worldName,
    sortedQuestions,
    completedCount,
    totalCount,
    bossBattleUnlocked,
    getQuestionProgress,
    onBackToMap,
    onStartQuestion,
}: WorldQuestionsViewProps) {
    const { t } = useTranslation('game');
    return (
        <div className="world-questions">
            <div className="world-questions__header">
                <button className="back-button" onClick={onBackToMap}>
                    ← {t('backToMap', 'Voltar ao Mapa')}
                </button>
                <h2 className="world-questions__title">{worldName}</h2>
                <div className="world-questions__stats">
                    {t('completedStats', { defaultValue: '{{completed}} / {{total}} completadas',  completed: completedCount, total: totalCount })}
                </div>
            </div>

            <div className="world-questions__list">
                {sortedQuestions.map((question, index) => {
                    const progress = getQuestionProgress(question.id);
                    let isLocked = false;

                    if (question.type === 'boss_battle' && !bossBattleUnlocked) {
                        isLocked = true;
                    }

                    return (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            index={index}
                            status={progress?.status || 'not_started'}
                            stars={progress?.stars || 0}
                            locked={isLocked}
                            onClick={onStartQuestion}
                        />
                    );
                })}
            </div>

            {sortedQuestions.length === 0 && (
                <div className="world-questions__empty">
                    <span className="world-questions__empty-icon">📭</span>
                    <p>{t('worldEmptyTitle', 'Este mundo ainda não tem questões.')}</p>
                    <p>{t('worldEmptyDesc', 'Em breve adicionaremos conteúdo aqui!')}</p>
                </div>
            )}
        </div>
    );
}
