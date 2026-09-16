import { useState, useRef, useEffect, useCallback } from 'react';
import { useGamification } from '../../../context/GamificationContext';
import { useAuth } from '../../../hooks/useAuth';
import { PetAvatar } from './PetAvatar';
import { playSound } from '../../../utils/soundEffects';
import { useTranslation } from 'react-i18next';
import './PetHabitat.css';

export function PetHabitat() {
    const { t } = useTranslation('gamification');
    const { pet, feedPet } = useGamification();
    const { userData, isGuest } = useAuth();
    const [feeding, setFeeding] = useState(false);
    const [petting, setPetting] = useState(false);

    const feedingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pettingTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (feedingTimerRef.current) clearTimeout(feedingTimerRef.current);
            if (pettingTimerRef.current) clearTimeout(pettingTimerRef.current);
        };
    }, []);

    const isEgg = pet?.stage === 'egg';
    const currentLevelXP = Math.max(0, (pet?.xp || 0) % 50);
    const neededXP = 50;
    const remainingXP = Math.max(0, neededXP - currentLevelXP);
    const xpPercent = Math.min(100, Math.max(0, (currentLevelXP / neededXP) * 100));
    const clampedHunger = Math.min(100, Math.max(0, Math.round(pet?.hunger || 0)));

    const userBalance = userData?.balance || 0;
    const hasEnoughStars = userBalance >= 10;
    const isFull = clampedHunger >= 100;
    const canFeed = !isGuest && hasEnoughStars && !isFull;

    const handlePet = useCallback(() => {
        if (feeding || petting) return;
        setPetting(true);
        playSound('click');
        if (pettingTimerRef.current) clearTimeout(pettingTimerRef.current);
        pettingTimerRef.current = setTimeout(() => {
            setPetting(false);
        }, 850);
    }, [feeding, petting]);

    const handleFeed = useCallback(() => {
        if (isGuest) {
            playSound('click');
            return;
        }
        if (feeding) return;

        if (isFull) {
            handlePet();
            return;
        }

        if (!hasEnoughStars) {
            playSound('error');
            return;
        }

        setFeeding(true);
        const success = feedPet();
        if (success) {
            playSound('success');
            if (feedingTimerRef.current) clearTimeout(feedingTimerRef.current);
            feedingTimerRef.current = setTimeout(() => {
                setFeeding(false);
            }, 650);
        } else {
            setFeeding(false);
            playSound('error');
        }
    }, [isGuest, feeding, isFull, hasEnoughStars, feedPet, handlePet]);

    const handleAvatarClick = useCallback(() => {
        if (canFeed) {
            handleFeed();
        } else if (isFull) {
            handlePet();
        } else if (!hasEnoughStars && !isGuest) {
            playSound('error');
        } else {
            playSound('click');
        }
    }, [canFeed, handleFeed, isFull, handlePet, hasEnoughStars, isGuest]);

    if (!pet) return null;

    const xpTooltip = t('petHabitat.xpProgress', {
        defaultValue: 'XP: {{current}} / {{needed}} (Faltam {{remaining}} XP para o Nível {{next}})',
        current: currentLevelXP,
        needed: neededXP,
        remaining: remainingXP,
        next: pet.level + 1
    });

    const energyTitle = isEgg
        ? t('petHabitat.heatTitle', 'Calor do Ovo')
        : t('petHabitat.energyTitle', 'Energia do Pet');

    const energyStatusText = clampedHunger < 100
        ? (isEgg ? t('petHabitat.heatInstruction', 'Aqueça o ovo até chocar seu novo companheiro!') : t('petHabitat.feedInstruction', 'Alimente seu pet para ganhar XP extra!'))
        : (isEgg ? t('petHabitat.eggFull', 'Ovo totalmente aquecido!') : t('petHabitat.petFull', 'Pet totalmente alimentado!'));

    const energyTooltip = `${energyTitle}: ${clampedHunger}% (${energyStatusText})`;

    const getButtonText = () => {
        if (isGuest) return t('petHabitat.guestButton', 'Entrar para Cuidar 🔒');
        if (feeding) return isEgg ? t('petHabitat.heating', 'Aquecendo...') : t('petHabitat.eating', 'Comendo...');
        if (isFull) return isEgg ? t('petHabitat.eggFullButton', 'Ovo Aquecido ✨') : t('petHabitat.petFullButton', 'Pet Satisfeito ✨');
        return isEgg ? `${t('petHabitat.btnHeat', 'Aquecer Ovo')} (10 ⭐)` : `${t('petHabitat.btnFeed', 'Alimentar Pet')} (10 ⭐)`;
    };

    const getButtonTitle = () => {
        if (isGuest) return t('petHabitat.guestTooltip', 'Crie uma conta para chocar e alimentar seu pet!');
        if (isFull) return isEgg ? t('petHabitat.eggFull', 'Ovo totalmente aquecido!') : t('petHabitat.petFull', 'Pet totalmente alimentado!');
        if (!hasEnoughStars) return t('petHabitat.noStars', 'Você precisa de pelo menos 10 ⭐ para alimentar!');
        return isEgg ? t('petHabitat.titleHeat', 'Aquecer Ovo (-10 ⭐)') : t('petHabitat.titleFeed', 'Alimentar (-10 ⭐)');
    };

    const stageLabel = t(`petHabitat.stages.${pet.stage}`, { defaultValue: pet.stage });
    const moodLabel = t(`petHabitat.moods.${pet.mood}`, { defaultValue: pet.mood });
    const typeLabel = pet.stage !== 'egg' ? t(`petHabitat.types.${pet.type}`, { defaultValue: pet.type }) : null;

    return (
        <div className="pet-habitat">
            <div className="pet-habitat__header">
                <h3>
                    <span className="pet-habitat__icon" aria-hidden="true">🏠</span>
                    <span className="pet-habitat__title-text">{t('petHabitat.title', 'Habitat do Pet')}</span>
                </h3>
                <span className="pet-habitat__level">Lvl {pet.level}</span>
            </div>

            <div className={`pet-habitat__stage ${isFull ? 'pet-habitat__stage--full' : ''}`}>
                <PetAvatar
                    pet={pet}
                    size="medium"
                    onClick={handleAvatarClick}
                    isFeeding={feeding}
                    isPetting={petting}
                />
            </div>

            <div className="pet-habitat__info">
                <div className="pet-habitat__name" title={pet.name}>{pet.name}</div>
                <div className="pet-habitat__meta">
                    <span className="pet-badge pet-badge--stage">{stageLabel}</span>
                    {typeLabel && <span className="pet-badge pet-badge--type">{typeLabel}</span>}
                    <span className="pet-badge pet-badge--mood">{moodLabel}</span>
                </div>

                <div className="pet-habitat__bars">
                    <div className="pet-bar-container" title={xpTooltip}>
                        <div className="pet-bar-header">
                            <span className="pet-bar-title">
                                <span className="pet-bar-icon" aria-hidden="true">✨</span>
                                <span>XP</span>
                            </span>
                            <span className="pet-bar-value">{currentLevelXP}/{neededXP}</span>
                        </div>
                        <div
                            className="pet-bar"
                            role="progressbar"
                            aria-valuenow={currentLevelXP}
                            aria-valuemin={0}
                            aria-valuemax={neededXP}
                            aria-label={t('petHabitat.xpLabel', 'Progresso de XP')}
                            aria-valuetext={`${currentLevelXP} de ${neededXP} XP`}
                        >
                            <div className="pet-bar-fill pet-bar-fill--xp" style={{ width: `${xpPercent}%` }} />
                        </div>
                    </div>

                    <div className="pet-bar-container" title={energyTooltip}>
                        <div className="pet-bar-header">
                            <span className="pet-bar-title">
                                <span className="pet-bar-icon" aria-hidden="true">{isEgg ? "🔥" : "🍖"}</span>
                                <span>{energyTitle}</span>
                            </span>
                            <span className="pet-bar-value">{clampedHunger}%</span>
                        </div>
                        <div
                            className="pet-bar"
                            role="progressbar"
                            aria-valuenow={clampedHunger}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={isEgg ? t('petHabitat.heatLabel', 'Nível de Calor do Ovo') : t('petHabitat.energyLabel', 'Nível de Energia e Fome')}
                            aria-valuetext={`${clampedHunger}%`}
                        >
                            <div
                                className={`pet-bar-fill pet-bar-fill--hunger ${clampedHunger < 20 ? 'pet-bar-fill--critical' : ''}`}
                                style={{ width: `${clampedHunger}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                className={`pet-feed-btn ${isEgg ? 'pet-feed-btn--heat' : ''} ${feeding ? 'pet-feed-btn--feeding' : ''} ${isFull ? 'pet-feed-btn--full' : ''}`}
                onClick={handleFeed}
                disabled={!canFeed || feeding}
                title={getButtonTitle()}
            >
                {getButtonText()}
            </button>
        </div>
    );
}


