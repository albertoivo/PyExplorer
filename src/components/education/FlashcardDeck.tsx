import { useState, useCallback, useMemo } from 'react';
// Types provided by educationContent '../../types/education';
import { getFlashcardsByWorld, FLASHCARDS } from '../../data/educationContent';
import './FlashcardDeck.css';

interface FlashcardDeckProps {
    /** ID do mundo (ou null para todos) */
    worldId?: string;
    /** Callback quando fecha */
    onClose: () => void;
}

/**
 * Deck de Flashcards para revisão
 */
export function FlashcardDeck({ worldId, onClose }: FlashcardDeckProps) {
    const cards = useMemo(() => {
        if (worldId) {
            return getFlashcardsByWorld(worldId);
        }
        return FLASHCARDS;
    }, [worldId]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
    const [reviewCards, setReviewCards] = useState<Set<string>>(new Set());
    const [isAnimating, setIsAnimating] = useState(false);

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    const handleFlip = useCallback(() => {
        if (!isAnimating) {
            setIsFlipped(prev => !prev);
        }
    }, [isAnimating]);

    const goToNext = useCallback((markAs?: 'known' | 'review') => {
        if (isAnimating || currentIndex >= cards.length - 1) return;

        if (markAs === 'known') {
            setKnownCards(prev => new Set(prev).add(currentCard.id));
            setReviewCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentCard.id);
                return newSet;
            });
        } else if (markAs === 'review') {
            setReviewCards(prev => new Set(prev).add(currentCard.id));
            setKnownCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentCard.id);
                return newSet;
            });
        }

        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
            setIsAnimating(false);
        }, 200);
    }, [isAnimating, currentIndex, cards.length, currentCard]);

    const goToPrevious = useCallback(() => {
        if (isAnimating || currentIndex === 0) return;

        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
            setIsAnimating(false);
        }, 200);
    }, [isAnimating, currentIndex]);

    const restartDeck = useCallback(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
        setReviewCards(new Set());
    }, []);

    if (cards.length === 0) {
        return (
            <div className="flashcard-deck__overlay" onClick={onClose}>
                <div className="flashcard-deck__empty" onClick={e => e.stopPropagation()}>
                    <span className="flashcard-deck__empty-icon">📚</span>
                    <p>Ainda não há flashcards para este mundo!</p>
                    <button className="flashcard-deck__btn" onClick={onClose}>
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    const isComplete = currentIndex >= cards.length;

    return (
        <div className="flashcard-deck__overlay" onClick={onClose}>
            <div className="flashcard-deck" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flashcard-deck__header">
                    <button className="flashcard-deck__close" onClick={onClose}>
                        ✕
                    </button>
                    <h2 className="flashcard-deck__title">📚 Flashcards</h2>
                    <div className="flashcard-deck__counter">
                        {currentIndex + 1} / {cards.length}
                    </div>
                </div>

                {/* Progress */}
                <div className="flashcard-deck__progress">
                    <div
                        className="flashcard-deck__progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flashcard-deck__stats">
                    <span className="flashcard-deck__stat flashcard-deck__stat--known">
                        ✅ {knownCards.size} sei
                    </span>
                    <span className="flashcard-deck__stat flashcard-deck__stat--review">
                        📝 {reviewCards.size} revisar
                    </span>
                </div>

                {/* Card */}
                {!isComplete ? (
                    <>
                        <div
                            className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''} ${isAnimating ? 'flashcard--animating' : ''}`}
                            onClick={handleFlip}
                        >
                            <div className="flashcard__inner">
                                {/* Front */}
                                <div className="flashcard__front">
                                    <span className="flashcard__emoji">{currentCard.emoji}</span>
                                    <p className="flashcard__question">{currentCard.question}</p>
                                    <span className="flashcard__hint-text">Toque para ver a resposta</span>

                                    <span className={`flashcard__difficulty flashcard__difficulty--${currentCard.difficulty}`}>
                                        {currentCard.difficulty === 'easy' && '🟢 Fácil'}
                                        {currentCard.difficulty === 'medium' && '🟡 Médio'}
                                        {currentCard.difficulty === 'hard' && '🔴 Difícil'}
                                    </span>
                                </div>

                                {/* Back */}
                                <div className="flashcard__back">
                                    <div className="flashcard__answer-label">Resposta:</div>
                                    <p className="flashcard__answer">{currentCard.answer}</p>

                                    {currentCard.codeExample && (
                                        <pre className="flashcard__code">{currentCard.codeExample}</pre>
                                    )}

                                    {currentCard.hint && (
                                        <p className="flashcard__extra-hint">💡 {currentCard.hint}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flashcard-deck__actions">
                            <button
                                className="flashcard-deck__action flashcard-deck__action--review"
                                onClick={() => goToNext('review')}
                                disabled={!isFlipped}
                            >
                                📝 Revisar
                            </button>

                            <button
                                className="flashcard-deck__action flashcard-deck__action--nav"
                                onClick={goToPrevious}
                                disabled={currentIndex === 0}
                            >
                                ⬅️
                            </button>

                            <button
                                className="flashcard-deck__action flashcard-deck__action--nav"
                                onClick={() => goToNext()}
                            >
                                ➡️
                            </button>

                            <button
                                className="flashcard-deck__action flashcard-deck__action--known"
                                onClick={() => goToNext('known')}
                                disabled={!isFlipped}
                            >
                                ✅ Sei!
                            </button>
                        </div>
                    </>
                ) : (
                    /* Completion */
                    <div className="flashcard-deck__complete">
                        <span className="flashcard-deck__complete-icon">🎉</span>
                        <h3>Parabéns!</h3>
                        <p>Você revisou todos os {cards.length} flashcards!</p>

                        <div className="flashcard-deck__final-stats">
                            <div className="flashcard-deck__final-stat">
                                <span className="flashcard-deck__final-stat-value">{knownCards.size}</span>
                                <span className="flashcard-deck__final-stat-label">Você sabe</span>
                            </div>
                            <div className="flashcard-deck__final-stat">
                                <span className="flashcard-deck__final-stat-value">{reviewCards.size}</span>
                                <span className="flashcard-deck__final-stat-label">Para revisar</span>
                            </div>
                        </div>

                        <div className="flashcard-deck__complete-actions">
                            <button
                                className="flashcard-deck__btn flashcard-deck__btn--secondary"
                                onClick={restartDeck}
                            >
                                🔄 Recomeçar
                            </button>
                            <button
                                className="flashcard-deck__btn flashcard-deck__btn--primary"
                                onClick={onClose}
                            >
                                ✨ Concluir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlashcardDeck;
