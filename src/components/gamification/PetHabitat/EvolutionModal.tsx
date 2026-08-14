import { useEffect } from 'react';
import { useGamification } from '../../../context/GamificationContext';
import { PetAvatar } from './PetAvatar';
import { useTranslation } from 'react-i18next';
import './EvolutionModal.css';

type ConfettiFn = (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { y: number };
    colors?: string[];
}) => void;

export function EvolutionModal() {
    const { t } = useTranslation('gamification');
    const { pet, dismissPetEvolution } = useGamification();

    useEffect(() => {
        if (pet?.justEvolved) {
            import('canvas-confetti').then((confettiModule) => {
                const confetti = (
                    'default' in confettiModule
                        ? confettiModule.default
                        : confettiModule
                ) as ConfettiFn;
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#9b59b6', '#2ecc71']
                });
            });
        }
    }, [pet?.justEvolved]);

    if (!pet?.justEvolved) return null;

    return (
        <div className="evolution-modal-overlay">
            <div
                className="evolution-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="evolution-modal-title"
            >
                <div className="evolution-modal__header">
                    <h2 id="evolution-modal-title">🎉 {t('evolution.title', 'Evolução!')} 🎉</h2>
                </div>

                <div className="evolution-modal__content">
                    <p>{t('evolution.description', 'Seu mascote evoluiu para o próximo estágio!')}</p>

                    <div className="evolution-modal__avatar">
                        <div className="evolution-glow"></div>
                        <PetAvatar pet={pet} size="large" />
                    </div>

                    <div className="evolution-modal__details">
                        <h3>{pet.name}</h3>
                        <p className="evolution-type">{t('evolution.type', { defaultValue: 'Tipo: {{type}}',  type: pet.type.toUpperCase() })}</p>
                    </div>
                </div>

                <div className="evolution-modal__actions">
                    <button className="evolution-modal__btn" onClick={dismissPetEvolution}>
                        {t('evolution.awesome', 'Incrível! 🚀')}
                    </button>
                    <button
                        className="evolution-modal__btn evolution-modal__btn--share"
                        onClick={() => {
                            const shareData = {
                                title: t('evolution.shareTitle', 'PyExplorer - Meu Mascote Evoluiu!'),
                                text: t('evolution.shareText', { defaultValue: 'Meu mascote {{name}} evoluiu para o tipo {{type}} no PyExplorer! Venha aprender Python jogando!',  name: pet.name, type: pet.type.toUpperCase() }),
                                url: window.location.origin
                            };
                            if (navigator.share) {
                                navigator.share(shareData).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                                alert(t('evolution.copied', 'Link copiado para a área de transferência!'));
                            }
                        }}
                    >
                        {t('evolution.share', 'Compartilhar 📤')}
                    </button>
                </div>
            </div>
        </div>
    );
}
