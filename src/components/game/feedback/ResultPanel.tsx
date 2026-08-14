import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('game');
    const [showingExplanation, setShowingExplanation] = React.useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Foca no painel quando ele aparece para garantir acessibilidade
    useEffect(() => {
        if (panelRef.current) {
            panelRef.current.focus();
        }
    }, []);

    return (
        <div
            ref={panelRef}
            tabIndex={-1}
            role="alert"
            aria-label={success ? t('resultPanel.ariaSuccess', 'Resultado: Sucesso') : t('resultPanel.ariaError', 'Resultado: Tente novamente')}
            className={`result-panel ${success ? 'result-panel--success' : 'result-panel--error'}`}
            style={{ outline: 'none' }} // Remove outline visual mas mantém foco programático
        >
            <div className="result-panel__icon" aria-hidden="true">
                {success ? '🎉' : '💪'}
            </div>

            <h3 className="result-panel__title">
                {title || (success ? t('resultPanel.defaultSuccessTitle', 'Parabéns!') : t('resultPanel.defaultErrorTitle', 'Quase lá!'))}
            </h3>

            <p className="result-panel__message">{message}</p>

            {success && points !== undefined && points > 0 && (
                <div className="result-panel__points">
                    <span className="result-panel__points-icon" aria-hidden="true">⭐</span>
                    <span className="result-panel__points-value">+{points} {t('resultPanel.points', 'pontos')}</span>
                </div>
            )}

            {showExplanation && explanation && (
                <div className="result-panel__explanation-container">
                    <button
                        className="result-panel__explanation-toggle"
                        onClick={() => setShowingExplanation(!showingExplanation)}
                        aria-expanded={showingExplanation}
                    >
                        💡 {showingExplanation ? t('resultPanel.hideExplanation', 'Ocultar explicação') : t('resultPanel.showExplanation', 'Ver explicação')}
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
                        🔄 {t('resultPanel.retry', 'Tentar Novamente')}
                    </button>
                )}

                {onNext && (
                    <button className="result-panel__btn result-panel__btn--next" onClick={onNext}>
                        {success ? t('resultPanel.nextQuestion', 'Próxima Questão →') : t('resultPanel.skipQuestion', 'Pular Questão →')}
                    </button>
                )}
            </div>

            {/* Confetes para sucesso - puramente decorativo */}
            {success && (
                <div className="result-panel__confetti" aria-hidden="true">
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

// fallow-ignore-next-line unused-export
export default ResultPanel;
