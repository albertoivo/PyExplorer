import { useState, useEffect, useRef } from 'react';
import type { StoryEpisode } from '../../data/gamificationData';
import { useTranslation } from 'react-i18next';
import './StoryModal.css';

interface StoryModalProps {
    episode: StoryEpisode;
    onComplete: () => void;
}

export function StoryModal({ episode, onComplete }: StoryModalProps) {
    const { t } = useTranslation('game');
    const [step, setStep] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const nextBtnRef = useRef<HTMLButtonElement>(null);

    const currentDialogue = episode.dialogue[step];
    const isLastStep = step === episode.dialogue.length - 1;

    // Gerenciamento de foco e tecla Esc
    useEffect(() => {
        // Foca no botão "Próximo" ao abrir ou mudar de passo
        nextBtnRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onComplete();
                return;
            }

            // Focus trap simples
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete, step]); // Re-executa quando 'step' muda para refocar o botão

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setStep(prev => prev + 1);
        }
    };

    return (
        <div className="story-overlay">
            <div
                className="story-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="story-title"
                ref={modalRef}
            >
                <div className="story-header">
                    <h2 id="story-title" className="story-title">
                        {t(`story.${episode.worldId}_${episode.type}.title`, episode.title)}
                    </h2>
                    <span className="story-progress" aria-label={t('story.progressLabel', { defaultValue: 'Passo {{current}} de {{total}}',  current: step + 1, total: episode.dialogue.length })}>
                        {step + 1} / {episode.dialogue.length}
                    </span>
                </div>

                <div className="story-content">
                    <div
                        className="story-avatar"
                        role="img"
                        aria-label={t('story.avatarLabel', { defaultValue: 'Avatar de {{speaker}}',  speaker: currentDialogue.speaker })}
                    >
                        {currentDialogue.avatar || '🗣️'}
                    </div>
                    <div className="story-text-box" aria-live="polite">
                        <strong className="story-speaker">{t(`story.${episode.worldId}_${episode.type}.speaker_${step}`, currentDialogue.speaker)}</strong>
                        <p className="story-text">{t(`story.${episode.worldId}_${episode.type}.text_${step}`, currentDialogue.text)}</p>
                    </div>
                </div>

                <div className="story-footer">
                    <button className="story-skip-btn" onClick={onComplete}>
                        {t('story.skip', 'Pular')}
                    </button>
                    <button
                        className="story-next-btn"
                        onClick={handleNext}
                        ref={nextBtnRef}
                    >
                        {isLastStep ? t('story.startAdventure', 'Começar Aventura! 🚀') : t('story.next', 'Próximo ➡️')}
                    </button>
                </div>
            </div>
        </div>
    );
}
