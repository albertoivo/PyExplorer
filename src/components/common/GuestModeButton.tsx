import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

/** Adjetivos e substantivos divertidos para geração de nomes aleatórios */
const ADJECTIVES = ['Veloz', 'Esperto', 'Curioso', 'Valente', 'Sábio', 'Alegre'];
const NOUNS = ['Viajante', 'Explorador', 'Aventureiro', 'Cientista', 'Mago', 'Ninja'];

/**
 * Gera um nome aleatório divertido para convidados.
 */
function generateGuestName(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${noun} ${adj}`;
}

/**
 * Botão reutilizável para entrar como convidado.
 * Gera um nome aleatório divertido e navega para /game.
 */
export function GuestModeButton() {
    const { t } = useTranslation('auth');
    const { enterAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleGuestMode = () => {
        enterAsGuest(generateGuestName());
        navigate('/game', { replace: true });
    };

    return (
        <>
            <button
                type="button"
                className="auth-btn auth-btn--guest"
                onClick={handleGuestMode}
            >
                👤 {t('guestMode.playAsGuest', 'Jogar como Convidado')}
            </button>

            <p className="auth-guest-note">
                💡 {t('guestMode.guestNote', 'No modo convidado, seu progresso fica salvo apenas neste dispositivo')}
            </p>
        </>
    );
}
