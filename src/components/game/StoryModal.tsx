import { useState } from 'react';
import type { StoryEpisode } from '../../data/gamificationData';
import './StoryModal.css';

interface StoryModalProps {
    episode: StoryEpisode;
    onComplete: () => void;
}

export function StoryModal({ episode, onComplete }: StoryModalProps) {
    const [step, setStep] = useState(0);

    const currentDialogue = episode.dialogue[step];
    const isLastStep = step === episode.dialogue.length - 1;

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
            >
                <div className="story-header">
                    <h2 id="story-title" className="story-title">
                        {episode.title}
                    </h2>
                    <span className="story-progress">
                        {step + 1} / {episode.dialogue.length}
                    </span>
                </div>

                <div className="story-content">
                    <div
                        className="story-avatar"
                        role="img"
                        aria-label={`Avatar de ${currentDialogue.speaker}`}
                    >
                        {currentDialogue.avatar || '🗣️'}
                    </div>
                    <div className="story-text-box" aria-live="polite">
                        <strong className="story-speaker">{currentDialogue.speaker}</strong>
                        <p className="story-text">{currentDialogue.text}</p>
                    </div>
                </div>

                <div className="story-footer">
                    <button className="story-skip-btn" onClick={onComplete}>
                        Pular
                    </button>
                    <button className="story-next-btn" onClick={handleNext}>
                        {isLastStep ? 'Começar Aventura! 🚀' : 'Próximo ➡️'}
                    </button>
                </div>
            </div>
        </div>
    );
}
