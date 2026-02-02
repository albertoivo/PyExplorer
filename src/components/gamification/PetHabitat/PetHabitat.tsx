import { useState } from 'react';
import { useGamification } from '../../../context/GamificationContext';
import { useAuth } from '../../../hooks/useAuth';
import { PetAvatar } from './PetAvatar';
import { playSound } from '../../../utils/soundEffects';
import './PetHabitat.css';

export function PetHabitat() {
    const { pet, feedPet } = useGamification();
    const { userData } = useAuth();
    const [feeding, setFeeding] = useState(false);

    if (!pet) return null;

    const handleFeed = () => {
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
    const canFeed = (userData?.balance || 0) >= 10 && pet.hunger < 100;

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
                    <div className="pet-bar-container" title="XP / Evolução">
                        <span className="pet-bar-icon">✨</span>
                        <div className="pet-bar">
                            <div className="pet-bar-fill pet-bar-fill--xp" style={{ width: `${xpPercent}%` }}></div>
                        </div>
                    </div>
                    <div className="pet-bar-container" title="Fome / Energia">
                        <span className="pet-bar-icon">🍖</span>
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
                title={canFeed ? "Alimentar (-10 ⭐)" : "Sem estrelas ou cheio"}
            >
                {feeding ? "Comendo..." : "Alimentar (10 ⭐)"}
            </button>
        </div>
    );
}
