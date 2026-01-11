import type { QuestionDocument } from '../../types/question';
import type { UserProgress } from '../../types/question';
import './CompletedQuestionModal.css';

interface CompletedQuestionModalProps {
    question: QuestionDocument;
    progress: UserProgress;
    onViewAnswer: () => void;
    onRedo: () => void;
    onClose: () => void;
}

/**
 * Modal exibido quando o usuário clica em uma questão já completada.
 * Oferece opções: "Ver minha resposta" ou "Refazer para praticar".
 */
export function CompletedQuestionModal({
    question,
    progress,
    onViewAnswer,
    onRedo,
    onClose,
}: CompletedQuestionModalProps) {
    return (
        <div className="completed-modal-overlay" onClick={onClose}>
            <div className="completed-modal" onClick={e => e.stopPropagation()}>
                <button className="completed-modal__close" onClick={onClose}>
                    ✕
                </button>

                <div className="completed-modal__badge">✓</div>

                <h2 className="completed-modal__title">
                    Questão Concluída!
                </h2>

                <p className="completed-modal__question-title">
                    {question.title}
                </p>

                <div className="completed-modal__stats">
                    <div className="completed-modal__stat">
                        <span className="completed-modal__stat-icon">⭐</span>
                        <span className="completed-modal__stat-value">{progress.score}</span>
                        <span className="completed-modal__stat-label">pontos</span>
                    </div>
                    <div className="completed-modal__stat">
                        <span className="completed-modal__stat-icon">🔄</span>
                        <span className="completed-modal__stat-value">{progress.attempts}</span>
                        <span className="completed-modal__stat-label">tentativas</span>
                    </div>
                </div>

                <div className="completed-modal__actions">
                    <button
                        className="completed-modal__btn completed-modal__btn--view"
                        onClick={onViewAnswer}
                        disabled={!progress.userAnswer}
                        title={!progress.userAnswer ? 'Resposta não disponível' : undefined}
                    >
                        <span className="completed-modal__btn-icon">📖</span>
                        Ver minha resposta
                    </button>

                    <button
                        className="completed-modal__btn completed-modal__btn--redo"
                        onClick={onRedo}
                    >
                        <span className="completed-modal__btn-icon">🔄</span>
                        Refazer (para praticar)
                    </button>
                </div>

                <p className="completed-modal__hint">
                    💡 Refazer não dá pontos extras — é só para praticar!
                </p>
            </div>
        </div>
    );
}

export default CompletedQuestionModal;
