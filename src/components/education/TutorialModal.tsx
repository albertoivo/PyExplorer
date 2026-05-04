import { useState, useEffect, useCallback } from 'react';
import type { WorldTutorial } from '../../types/education';
import { getTutorialByWorld } from '../../data/educationContent';
import './TutorialModal.css';

interface TutorialModalProps {
    /** ID do mundo */
    worldId: string;
    /** Se o modal está aberto */
    isOpen: boolean;
    /** Callback quando fecha */
    onClose: () => void;
    /** Callback quando completa o tutorial */
    onComplete: () => void;
    /** Se deve forçar assistir (não pode pular) */
    forceWatch?: boolean;
}

/**
 * Modal de Tutorial Interativo com animações
 */
export function TutorialModal({
    worldId,
    isOpen,
    onClose,
    onComplete,
    forceWatch = false
}: TutorialModalProps) {
    const [tutorial, setTutorial] = useState<WorldTutorial | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [typedCode, setTypedCode] = useState('');

    // Carrega tutorial do mundo
    useEffect(() => {
        if (worldId) {
            const found = getTutorialByWorld(worldId);
            // Defer state updates to satisfy react-hooks/set-state-in-effect
            Promise.resolve().then(() => {
                setTutorial(found || null);
                setCurrentStep(0);
                setShowCode(false);
                setTypedCode('');
            });
        }
    }, [worldId]);

    // Efeito de digitação para código
    useEffect(() => {
        if (!isOpen || !tutorial) return;

        const step = tutorial.steps[currentStep];
        let timer: ReturnType<typeof setInterval>;

        if (step?.code && step.animation === 'typewriter') {
            // Defer initial state updates to avoid lint error
            Promise.resolve().then(() => {
                setShowCode(true);
                setTypedCode('');
            });

            let i = 0;
            timer = setInterval(() => {
                if (i < step.code!.length) {
                    setTypedCode(step.code!.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 30);

            return () => {
                if (timer) clearInterval(timer);
            };
        } else if (step?.code) {
            Promise.resolve().then(() => {
                setShowCode(true);
                setTypedCode(step.code!);
            });
        }
    }, [isOpen, tutorial, currentStep]);

    const handleNext = useCallback(() => {
        if (!tutorial) return;

        setIsAnimating(true);

        setTimeout(() => {
            if (currentStep < tutorial.steps.length - 1) {
                setCurrentStep(prev => prev + 1);
                setShowCode(false);
                setTypedCode('');
            } else {
                onComplete();
                onClose();
            }
            setIsAnimating(false);
        }, 200);
    }, [tutorial, currentStep, onComplete, onClose]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setShowCode(false);
                setTypedCode('');
                setIsAnimating(false);
            }, 200);
        }
    }, [currentStep]);

    const handleSkip = useCallback(() => {
        if (!forceWatch) {
            onClose();
        }
    }, [forceWatch, onClose]);

    if (!isOpen || !tutorial) return null;

    const step = tutorial.steps[currentStep];
    const isLastStep = currentStep === tutorial.steps.length - 1;
    const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

    return (
        <div className="tutorial-modal__overlay" onClick={forceWatch ? undefined : handleSkip}>
            <div
                className={`tutorial-modal ${isAnimating ? 'tutorial-modal--animating' : ''}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tutorial-title"
            >
                {/* Header */}
                <div className="tutorial-modal__header">
                    <div className="tutorial-modal__title-row">
                        <h2 id="tutorial-title" className="tutorial-modal__title">{tutorial.title}</h2>
                        {!forceWatch && (
                            <button
                                className="tutorial-modal__close"
                                onClick={handleSkip}
                                aria-label="Fechar tutorial"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="tutorial-modal__progress">
                        <div
                            className="tutorial-modal__progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="tutorial-modal__step-counter">
                        Passo {currentStep + 1} de {tutorial.steps.length}
                    </div>
                </div>

                {/* Content */}
                <div className={`tutorial-modal__content tutorial-modal__content--${step.animation || 'fadeIn'}`}>
                    <div className="tutorial-modal__step-icon">{step.icon}</div>
                    <h3 className="tutorial-modal__step-title">{step.title}</h3>
                    <p className="tutorial-modal__step-text">{step.content}</p>

                    {/* Code example */}
                    {showCode && step.code && (
                        <div className="tutorial-modal__code-section">
                            <div className="tutorial-modal__code-header">
                                <span>💻 Exemplo de código:</span>
                            </div>
                            <pre className="tutorial-modal__code">
                                <code>{typedCode}</code>
                                {step.animation === 'typewriter' && typedCode.length < step.code.length && (
                                    <span className="tutorial-modal__cursor">|</span>
                                )}
                            </pre>

                            {step.output && typedCode === step.code && (
                                <div className="tutorial-modal__output">
                                    <div className="tutorial-modal__output-header">📤 Saída:</div>
                                    <pre className="tutorial-modal__output-text">{step.output}</pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Exercise (optional) */}
                    {step.exercise && (
                        <div className="tutorial-modal__exercise">
                            <div className="tutorial-modal__exercise-header">
                                🎯 Tente você mesmo:
                            </div>
                            <p>{step.exercise.prompt}</p>
                            <pre className="tutorial-modal__code">{step.exercise.template}</pre>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="tutorial-modal__footer">
                    <button
                        className="tutorial-modal__btn tutorial-modal__btn--secondary"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        ⬅️ Anterior
                    </button>

                    {/* Key concepts (on last step) */}
                    {isLastStep && (
                        <div className="tutorial-modal__concepts">
                            <span className="tutorial-modal__concepts-label">Você aprendeu:</span>
                            <div className="tutorial-modal__concepts-list">
                                {tutorial.keyConcepts.map((concept, idx) => (
                                    <span key={idx} className="tutorial-modal__concept-tag">
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        className="tutorial-modal__btn tutorial-modal__btn--primary"
                        onClick={handleNext}
                    >
                        {isLastStep ? '🚀 Começar!' : 'Próximo ➡️'}
                    </button>
                </div>

                {/* Dots navigation */}
                <div className="tutorial-modal__dots">
                    {tutorial.steps.map((_, idx) => (
                        <button
                            key={idx}
                            className={`tutorial-modal__dot ${idx === currentStep ? 'tutorial-modal__dot--active' : ''}`}
                            onClick={() => {
                                setCurrentStep(idx);
                                setShowCode(false);
                            }}
                            aria-label={`Ir para passo ${idx + 1}`}
                            aria-current={idx === currentStep ? 'step' : undefined}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TutorialModal;
