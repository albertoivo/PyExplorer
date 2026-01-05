import React from 'react';
import './ResultPanel.css';

interface ResultPanelProps {
    /** Se o resultado é positivo (passou) */
    success: boolean;
    /** Título do painel */
    title?: string;
    /** Mensagem principal */
    message: string;
    /** Explicação detalhada (opcional) */
    explanation?: string;
    /** Pontos ganhos (opcional) */
    points?: number;
    /** Callback para tentar novamente */
    onRetry?: () => void;
    /** Callback para próxima questão */
    onNext?: () => void;
    /** Se mostra botão de ver explicação */
    showExplanation?: boolean;
}

/**
 * Painel de resultado após responder uma questão
 */
export function ResultPanel({
    success,
    title,
    message,
    explanation,
    points,
    onRetry,
    onNext,
    showExplanation = true,
}: ResultPanelProps) {
    const [showingExplanation, setShowingExplanation] = React.useState(false);

    return (
        <div className={`result-panel ${success ? 'result-panel--success' : 'result-panel--error'}`}>
            <div className="result-panel__icon">
                {success ? '🎉' : '💪'}
            </div>

            <h3 className="result-panel__title">
                {title || (success ? 'Parabéns!' : 'Quase lá!')}
            </h3>

            <p className="result-panel__message">{message}</p>

            {success && points !== undefined && points > 0 && (
                <div className="result-panel__points">
                    <span className="result-panel__points-icon">⭐</span>
                    <span className="result-panel__points-value">+{points} pontos</span>
                </div>
            )}

            {showExplanation && explanation && (
                <div className="result-panel__explanation-container">
                    <button
                        className="result-panel__explanation-toggle"
                        onClick={() => setShowingExplanation(!showingExplanation)}
                    >
                        💡 {showingExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                    </button>

                    {showingExplanation && (
                        <div className="result-panel__explanation">
                            {explanation}
                        </div>
                    )}
                </div>
            )}

            <div className="result-panel__actions">
                {!success && onRetry && (
                    <button className="result-panel__btn result-panel__btn--retry" onClick={onRetry}>
                        🔄 Tentar Novamente
                    </button>
                )}

                {onNext && (
                    <button className="result-panel__btn result-panel__btn--next" onClick={onNext}>
                        {success ? 'Próxima Questão →' : 'Pular Questão →'}
                    </button>
                )}
            </div>

            {/* Confetes para sucesso */}
            {success && (
                <div className="result-panel__confetti">
                    {[...Array(12)].map((_, i) => (
                        <span key={i} className="confetti" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
                            {['🌟', '✨', '🎊', '🎈', '💫'][i % 5]}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ResultPanel;
