import { useState, useCallback, useMemo } from 'react';
import type { HintLevel, QuestionHints } from '../../types/education';
import { getHintsForQuestion } from '../../data/educationContent';
import { useAuth } from '../../hooks/useAuth';
import './ProgressiveHints.css';

interface ProgressiveHintsProps {
    /** ID da questão */
    questionId: string;
    /** Explicação da questão (usada para gerar dicas padrão) */
    explanation: string;
    /** Dicas já reveladas */
    revealedHints?: HintLevel[];
    /** Callback quando uma dica é revelada */
    onHintRevealed: (level: HintLevel, cost: number) => void;
    /** Versão compacta */
    compact?: boolean;
}

/**
 * Componente de Dicas Progressivas (3 níveis)
 * Nível 1: Gratuito
 * Nível 2: Custa 5 estrelas
 * Nível 3: Custa 10 estrelas
 */
export function ProgressiveHints({
    questionId,
    explanation,
    revealedHints = [],
    onHintRevealed,
    compact = false,
}: ProgressiveHintsProps) {
    const { userData } = useAuth();
    const [localRevealed, setLocalRevealed] = useState<HintLevel[]>(revealedHints);
    const [showConfirm, setShowConfirm] = useState<HintLevel | null>(null);
    const [animatingHint, setAnimatingHint] = useState<HintLevel | null>(null);

    const hints: QuestionHints = useMemo(() => {
        return getHintsForQuestion(questionId, explanation);
    }, [questionId, explanation]);

    const userStars = userData?.totalScore ?? 0;

    const isRevealed = useCallback((level: HintLevel) => {
        return localRevealed.includes(level);
    }, [localRevealed]);

    const canReveal = useCallback((level: HintLevel) => {
        // Nível 1 é sempre gratuito
        if (level === 1) return true;

        // Níveis 2 e 3 requerem revelar o anterior
        if (level === 2 && !isRevealed(1)) return false;
        if (level === 3 && !isRevealed(2)) return false;

        // Verifica se tem estrelas suficientes
        const hint = hints.hints[level - 1];
        return userStars >= hint.cost;
    }, [isRevealed, hints, userStars]);

    const revealHint = useCallback((level: HintLevel, cost: number) => {
        setShowConfirm(null);
        setAnimatingHint(level);

        setTimeout(() => {
            setLocalRevealed(prev => [...prev, level]);
            onHintRevealed(level, cost);
            setAnimatingHint(null);
        }, 300);
    }, [onHintRevealed]);

    const handleRevealClick = useCallback((level: HintLevel) => {
        if (isRevealed(level)) return;
        if (!canReveal(level)) return;

        const hint = hints.hints[level - 1];

        // Se a dica tem custo, pede confirmação
        if (hint.cost > 0) {
            setShowConfirm(level);
        } else {
            // Dica gratuita - revela direto
            revealHint(level, 0);
        }
    }, [isRevealed, canReveal, hints, revealHint]);

    const cancelReveal = useCallback(() => {
        setShowConfirm(null);
    }, []);

    const getHintIcon = (level: HintLevel) => {
        switch (level) {
            case 1: return '💡';
            case 2: return '🔍';
            case 3: return '🎯';
        }
    };

    const getHintLabel = (level: HintLevel) => {
        switch (level) {
            case 1: return 'Dica Básica';
            case 2: return 'Dica Média';
            case 3: return 'Resposta Completa';
        }
    };

    if (compact) {
        return (
            <div className="hints hints--compact">
                <div className="hints__compact-row">
                    {[1, 2, 3].map(level => {
                        const hint = hints.hints[level - 1];
                        const revealed = isRevealed(level as HintLevel);
                        const canShow = canReveal(level as HintLevel);

                        return (
                            <button
                                key={level}
                                className={`hints__compact-btn ${revealed ? 'hints__compact-btn--revealed' : ''} ${!canShow && !revealed ? 'hints__compact-btn--disabled' : ''}`}
                                onClick={() => handleRevealClick(level as HintLevel)}
                                disabled={revealed || (!revealed && !canShow)}
                                title={revealed ? hint.text : getHintLabel(level as HintLevel)}
                            >
                                {getHintIcon(level as HintLevel)}
                                {!revealed && hint.cost > 0 && (
                                    <span className="hints__compact-cost">{hint.cost}⭐</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Revealed hints in compact mode */}
                {localRevealed.length > 0 && (
                    <div className="hints__compact-revealed">
                        {localRevealed.map(level => (
                            <div key={level} className="hints__compact-hint">
                                {getHintIcon(level)} {hints.hints[level - 1].text}
                            </div>
                        ))}
                    </div>
                )}

                {/* Confirm dialog */}
                {showConfirm && (
                    <div className="hints__confirm">
                        <p>Revelar por {hints.hints[showConfirm - 1].cost}⭐?</p>
                        <button onClick={() => revealHint(showConfirm, hints.hints[showConfirm - 1].cost)}>✓</button>
                        <button onClick={cancelReveal}>✕</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="hints">
            <div className="hints__header">
                <span className="hints__icon">💡</span>
                <span className="hints__title">Precisa de ajuda?</span>
                <span className="hints__stars">⭐ {userStars}</span>
            </div>

            <div className="hints__levels">
                {[1, 2, 3].map(level => {
                    const hint = hints.hints[level - 1];
                    const revealed = isRevealed(level as HintLevel);
                    const canShow = canReveal(level as HintLevel);
                    const isAnimating = animatingHint === level;

                    return (
                        <div
                            key={level}
                            className={`hints__level ${revealed ? 'hints__level--revealed' : ''} ${isAnimating ? 'hints__level--animating' : ''}`}
                        >
                            {/* Level indicator */}
                            <div className="hints__level-header">
                                <span className="hints__level-icon">{getHintIcon(level as HintLevel)}</span>
                                <span className="hints__level-label">{getHintLabel(level as HintLevel)}</span>
                                <span className={`hints__level-cost ${hint.cost === 0 ? 'hints__level-cost--free' : ''}`}>
                                    {hint.cost === 0 ? 'Grátis' : `${hint.cost}⭐`}
                                </span>
                            </div>

                            {/* Content or button */}
                            {revealed ? (
                                <div className="hints__level-content">
                                    <p>{hint.text}</p>
                                </div>
                            ) : (
                                <button
                                    className={`hints__reveal-btn ${!canShow ? 'hints__reveal-btn--disabled' : ''}`}
                                    onClick={() => handleRevealClick(level as HintLevel)}
                                    disabled={!canShow}
                                >
                                    {canShow ? 'Revelar Dica' :
                                        level > 1 && !isRevealed((level - 1) as HintLevel)
                                            ? 'Revele a dica anterior primeiro'
                                            : `Você precisa de ${hint.cost}⭐`}
                                </button>
                            )}

                            {/* Progress dots */}
                            <div className="hints__level-progress">
                                {[1, 2, 3].map(dot => (
                                    <span
                                        key={dot}
                                        className={`hints__dot ${dot <= level ? 'hints__dot--filled' : ''} ${isRevealed(dot as HintLevel) ? 'hints__dot--revealed' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Confirmation modal */}
            {showConfirm && (
                <div className="hints__confirm-overlay" onClick={cancelReveal}>
                    <div className="hints__confirm-modal" onClick={e => e.stopPropagation()}>
                        <span className="hints__confirm-icon">{getHintIcon(showConfirm)}</span>
                        <h4>Revelar {getHintLabel(showConfirm)}?</h4>
                        <p>
                            Esta dica custa <strong>{hints.hints[showConfirm - 1].cost}⭐</strong>
                        </p>
                        <p className="hints__confirm-balance">
                            Saldo atual: {userStars}⭐ → Após: {userStars - hints.hints[showConfirm - 1].cost}⭐
                        </p>
                        <div className="hints__confirm-actions">
                            <button
                                className="hints__confirm-btn hints__confirm-btn--cancel"
                                onClick={cancelReveal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="hints__confirm-btn hints__confirm-btn--confirm"
                                onClick={() => revealHint(showConfirm, hints.hints[showConfirm - 1].cost)}
                            >
                                Revelar por {hints.hints[showConfirm - 1].cost}⭐
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

