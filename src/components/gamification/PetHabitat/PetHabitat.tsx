import { useState } from 'react';
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

    if (!pet) return null;

    const handleFeed = () => {
        if (isGuest) return;
        if (feeding) return;

        // Optimistic check
        if ((userData?.balance || 0) < 10) return;
        if (pet.hunger >= 100) return;

        setFeeding(true);
        const success = feedPet();
        if (success) {
            playSound('success');
            // Reset feeding state after animation logic if needed
            setTimeout(() => setFeeding(false), 500);
        } else {
            setFeeding(false);
        }
    };

    const xpPercent = (pet.xp % 50) * 2;
    const currentLevelXP = pet.xp % 50;
    const neededXP = 50;
    const remainingXP = neededXP - currentLevelXP;
    const xpTooltip = t('petHabitat.xpTooltip', { defaultValue: 'XP: {{current}} / {{needed}} (Faltam {{remaining}} XP para o Nível {{next}})',  current: currentLevelXP, needed: neededXP, remaining: remainingXP, next: pet.level + 1 });

    const isEgg = pet.stage === 'egg';
    const energyTitle = isEgg ? t('petHabitat.heatTitle', 'Aquecimento / Calor') : t('petHabitat.energyTitle', 'Fome / Energia');
    const energyTooltip = `${energyTitle}: ${pet.hunger}% (${pet.hunger < 100 ? (isEgg ? t('petHabitat.heatInstruction', 'Aqueça para aumentar o calor') : t('petHabitat.feedInstruction', 'Alimente o pet para encher')) : (isEgg ? t('petHabitat.eggFull', 'Ovo totalmente aquecido!') : t('petHabitat.petFull', 'Pet alimentado e cheio!'))})`;

    const canFeed = !isGuest && (userData?.balance || 0) >= 10 && pet.hunger < 100;

    const getButtonText = () => {
        if (isGuest) return t('petHabitat.guestButton', 'Faça login para interagir 🔒');
        if (feeding) return isEgg ? t('petHabitat.heating', 'Aquecendo...') : t('petHabitat.eating', 'Comendo...');
        return isEgg ? t('petHabitat.btnHeat', 'Aquecer Ovo (10 ⭐)') : t('petHabitat.btnFeed', 'Alimentar (10 ⭐)');
    };

    const getButtonTitle = () => {
        if (isGuest) return t('petHabitat.guestTooltip', 'Apenas usuários logados podem cuidar e alimentar o mascote.');
        if (canFeed) return isEgg ? t('petHabitat.titleHeat', 'Aquecer Ovo (-10 ⭐)') : t('petHabitat.titleFeed', 'Alimentar (-10 ⭐)');
        return t('petHabitat.noStarsFull', 'Sem estrelas suficientes ou cheio');
    };

    return (
        <div className="pet-habitat">
            <div className="pet-habitat__header">
                <h3>🏠 {t('petHabitat.title', 'Habitat')}</h3>
                <span className="pet-habitat__level">Lvl {pet.level}</span>
            </div>

            <div className="pet-habitat__stage">
                <PetAvatar pet={pet} size="medium" onClick={handleFeed} />
            </div>

            <div className="pet-habitat__info">
                <div className="pet-habitat__name">{pet.name}</div>
                <div className="pet-habitat__bars">
                    <div className="pet-bar-container" title={xpTooltip}>
                        <span className="pet-bar-icon">✨</span>
                        <div className="pet-bar">
                            <div className="pet-bar-fill pet-bar-fill--xp" style={{ width: `${xpPercent}%` }}></div>
                        </div>
                    </div>
                    <div className="pet-bar-container" title={energyTooltip}>
                        <span className="pet-bar-icon">{isEgg ? "🔥" : "🍖"}</span>
                        <div className="pet-bar">
                            <div className="pet-bar-fill pet-bar-fill--hunger" style={{ width: `${pet.hunger}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className="pet-feed-btn"
                onClick={handleFeed}
                disabled={!canFeed}
                title={getButtonTitle()}
            >
                {getButtonText()}
            </button>
        </div>
    );
}

