import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGamification } from '../../../context/GamificationContext';
import { PetAvatar } from './PetAvatar';
import './EvolutionModal.css';

export function EvolutionModal() {
    const { pet, dismissPetEvolution } = useGamification();

    useEffect(() => {
        if (pet?.justEvolved) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#9b59b6', '#2ecc71']
            });
        }
    }, [pet?.justEvolved]);

    if (!pet?.justEvolved) return null;

    return (
        <div className="evolution-modal-overlay">
            <div className="evolution-modal">
                <div className="evolution-modal__header">
                    <h2>🎉 Evolução! 🎉</h2>
                </div>

                <div className="evolution-modal__content">
                    <p>Seu mascote evoluiu para o próximo estágio!</p>

                    <div className="evolution-modal__avatar">
                        <div className="evolution-glow"></div>
                        <PetAvatar pet={pet} size="large" />
                    </div>

                    <div className="evolution-modal__details">
                        <h3>{pet.name}</h3>
                        <p className="evolution-type">Tipo: {pet.type.toUpperCase()}</p>
                    </div>
                </div>

                <button className="evolution-modal__btn" onClick={dismissPetEvolution}>
                    Incrível! 🚀
                </button>
            </div>
        </div>
    );
}
