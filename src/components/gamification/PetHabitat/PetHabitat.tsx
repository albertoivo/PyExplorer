import { useState } from 'react';
import { useGamification } from '../../../context/GamificationContext';
import { useAuth } from '../../../hooks/useAuth';
import { PetAvatar } from './PetAvatar';
import { playSound } from '../../../utils/soundEffects';
import './PetHabitat.css';

export function PetHabitat() {
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
    const xpTooltip = `XP: ${currentLevelXP} / ${neededXP} (Faltam ${remainingXP} XP para o Nível ${pet.level + 1})`;

    const isEgg = pet.stage === 'egg';
    const energyTitle = isEgg ? "Aquecimento / Calor" : "Fome / Energia";
    const energyTooltip = `${energyTitle}: ${pet.hunger}% (${pet.hunger < 100 ? (isEgg ? "Aqueça para aumentar o calor" : "Alimente o pet para encher") : (isEgg ? "Ovo totalmente aquecido!" : "Pet alimentado e cheio!")})`;

    const canFeed = !isGuest && (userData?.balance || 0) >= 10 && pet.hunger < 100;

    const getButtonText = () => {
        if (isGuest) return "Faça login para interagir 🔒";
        if (feeding) return isEgg ? "Aquecendo..." : "Comendo...";
        return isEgg ? "Aquecer Ovo (10 ⭐)" : "Alimentar (10 ⭐)";
    };

    const getButtonTitle = () => {
        if (isGuest) return "Apenas usuários logados podem cuidar e alimentar o mascote.";
        if (canFeed) return isEgg ? "Aquecer Ovo (-10 ⭐)" : "Alimentar (-10 ⭐)";
        return "Sem estrelas suficientes ou cheio";
    };

    return (
        <div className="pet-habitat">
            <div className="pet-habitat__header">
                <h3>🏠 Habitat</h3>
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

