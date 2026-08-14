import { useState, useCallback, useMemo } from 'react';
import type { HintLevel, QuestionHints } from '../../types/education';
import type { PowerUpType } from '../../types/gamification';
import { getHintsForQuestion } from '../../data/educationContent';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
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
    /** Power-up ativo */
    activePowerUp?: PowerUpType | null;
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
    activePowerUp,
}: ProgressiveHintsProps) {
    const { t } = useTranslation('game');
    const { userData } = useAuth();
    const [showConfirm, setShowConfirm] = useState<HintLevel | null>(null);
    const [animatingHint, setAnimatingHint] = useState<HintLevel | null>(null);

    const effectiveRevealed = useMemo(() => {
        const set = new Set<HintLevel>(revealedHints);
        if (activePowerUp === 'extra_hint') {
            set.add(1);
            set.add(2);
        }
        return Array.from(set);
    }, [revealedHints, activePowerUp]);

    const hints: QuestionHints = useMemo(() => {
        const base = getHintsForQuestion(questionId, explanation);
        if (activePowerUp === 'extra_hint') {
            return {
                ...base,
                hints: base.hints.map((h, idx) => {
                    if (idx === 1) {
                        return { ...h, cost: 0, text: t('hints.extraHintPrefix', '🌟 [Dica Extra do Mestre Python]: ') + h.text };
                    }
                    return h;
                }) as QuestionHints['hints']
            };
        }
        return base;
    }, [questionId, explanation, activePowerUp]);

    const userStars = userData?.totalScore ?? 0;

    const isRevealed = useCallback((level: HintLevel) => {
        return effectiveRevealed.includes(level);
    }, [effectiveRevealed]);

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
            case 1: return t('hints.basicHint', 'Dica Básica');
            case 2: return t('hints.mediumHint', 'Dica Média');
            case 3: return t('hints.fullAnswer', 'Resposta Completa');
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
                {effectiveRevealed.length > 0 && (
                    <div className="hints__compact-revealed">
                        {effectiveRevealed.map(level => (
                            <div key={level} className="hints__compact-hint">
                                {getHintIcon(level)} {hints.hints[level - 1].text}
                            </div>
                        ))}
                    </div>
                )}

                {/* Confirm dialog */}
                {showConfirm && (
                    <div className="hints__confirm">
                        <p>{t('hints.revealCompactConfirm', { defaultValue: 'Revelar por {{cost}}⭐?',  cost: hints.hints[showConfirm - 1].cost })}</p>
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
                <span className="hints__title">{t('hints.needHelp', 'Precisa de ajuda?')}</span>
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
                                    {hint.cost === 0 ? t('hints.free', 'Grátis') : `${hint.cost}⭐`}
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
                                    {canShow ? t('hints.revealBtn', 'Revelar Dica') :
                                        level > 1 && !isRevealed((level - 1) as HintLevel)
                                            ? t('hints.revealPreviousFirst', 'Revele a dica anterior primeiro')
                                            : t('hints.needStars', { defaultValue: 'Você precisa de {{cost}}⭐',  cost: hint.cost })}
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

            {showConfirm && (
                <div className="hints__confirm-overlay" onClick={cancelReveal}>
                    <div className="hints__confirm-modal" onClick={e => e.stopPropagation()}>
                        <span className="hints__confirm-icon">{getHintIcon(showConfirm)}</span>
                        <h4>{t('hints.revealConfirmTitle', { defaultValue: 'Revelar {{label}}?',  label: getHintLabel(showConfirm) })}</h4>
                        <p>
                            {t('hints.revealConfirmDesc', 'Esta dica custa')} <strong>{hints.hints[showConfirm - 1].cost}⭐</strong>
                        </p>
                        <p className="hints__confirm-balance">
                            {t('hints.balanceCurrent', 'Saldo atual:')} {userStars}⭐ → {t('hints.balanceAfter', 'Após:')} {userStars - hints.hints[showConfirm - 1].cost}⭐
                        </p>
                        <div className="hints__confirm-actions">
                            <button
                                className="hints__confirm-btn hints__confirm-btn--cancel"
                                onClick={cancelReveal}
                            >
                                {t('hints.cancel', 'Cancelar')}
                            </button>
                            <button
                                className="hints__confirm-btn hints__confirm-btn--confirm"
                                onClick={() => revealHint(showConfirm, hints.hints[showConfirm - 1].cost)}
                            >
                                {t('hints.revealForStars', { defaultValue: 'Revelar por {{cost}}⭐',  cost: hints.hints[showConfirm - 1].cost })}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

