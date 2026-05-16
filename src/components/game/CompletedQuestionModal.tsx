import { useEffect, useRef, useState } from 'react';
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
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const [showSponsorCTA] = useState(() => {
        if (progress.stars === 3) {
            const lastSeen = localStorage.getItem('pyexplorer_sponsor_cta_shown');
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            if (!lastSeen || now - parseInt(lastSeen, 10) > oneDay) {
                localStorage.setItem('pyexplorer_sponsor_cta_shown', now.toString());
                return true;
            }
        }
        return false;
    });

    // Gerenciamento de foco e tecla Esc
    useEffect(() => {
        // Foca no botão de fechar ao abrir
        closeBtnRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="completed-modal-overlay" onClick={onClose}>
            <div
                className="completed-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="completed-modal-title"
            >
                <button
                    ref={closeBtnRef}
                    className="completed-modal__close"
                    onClick={onClose}
                    aria-label="Fechar modal"
                >
                    ✕
                </button>

                <div className="completed-modal__badge" aria-hidden="true">✓</div>

                <h2 id="completed-modal-title" className="completed-modal__title">
                    Questão Concluída!
                </h2>

                <p className="completed-modal__question-title">
                    {question.title}
                </p>

                <div className="completed-modal__stats">
                    <div className="completed-modal__stat">
                        <span className="completed-modal__stat-icon" aria-hidden="true">⭐</span>
                        <span className="completed-modal__stat-value">{progress.score}</span>
                        <span className="completed-modal__stat-label">pontos</span>
                    </div>
                    <div className="completed-modal__stat">
                        <span className="completed-modal__stat-icon" aria-hidden="true">🔄</span>
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
                        <span className="completed-modal__btn-icon" aria-hidden="true">📖</span>
                        Ver minha resposta
                    </button>

                    <button
                        className="completed-modal__btn completed-modal__btn--redo"
                        onClick={onRedo}
                    >
                        <span className="completed-modal__btn-icon" aria-hidden="true">🔄</span>
                        Refazer (para praticar)
                    </button>
                </div>

                <p className="completed-modal__hint">
                    💡 Refazer não dá pontos extras — é só para praticar!
                </p>

                {showSponsorCTA && (
                    <div className="completed-modal__sponsor-cta">
                        <h4>💖 Apoie o PyExplorer</h4>
                        <p>Seu filho(a) mandou muito bem! Ajude a manter este projeto educacional gratuito.</p>
                        <a 
                            href="https://github.com/sponsors/albertoivo" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="completed-modal__sponsor-link"
                        >
                            Patrocinar no GitHub
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompletedQuestionModal;
