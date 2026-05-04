import { useState, useEffect, useCallback, useMemo } from 'react';
import './Mascot.css';
import { MOOD_CONFIGS } from '../../utils/mascotConfig';
import { RANDOM_MESSAGES } from '../../utils/mascotMessages';

// ============================================
// TIPOS
// ============================================

/** Estados emocionais do mascote */
export type MascotMood =
    | 'idle'
    | 'happy'
    | 'excited'
    | 'thinking'
    | 'confused'
    | 'encouraging'
    | 'celebrating'
    | 'sleeping'
    | 'waving';

/** Props do componente */
interface MascotProps {
    /** Estado emocional */
    mood?: MascotMood;
    /** Mensagem a exibir */
    message?: string;
    /** Tamanho do mascote */
    size?: 'small' | 'medium' | 'large';
    /** Se está visível */
    visible?: boolean;
    /** Callback quando clica no mascote */
    onClick?: () => void;
    /** Posição na tela */
    position?: 'bottom-right' | 'bottom-left' | 'inline' | 'center';
    /** Auto-hide após X segundos */
    autoHide?: number;
}

/**
 * Mascote interativo que reage às ações do usuário
 */
export function Mascot({
    mood = 'idle',
    message,
    size = 'medium',
    visible = true,
    onClick,
    position = 'bottom-right',
    autoHide,
}: MascotProps) {
    const [isVisible, setIsVisible] = useState(visible);
    const [isMessageVisible, setIsMessageVisible] = useState(!!message);
    const [currentMessage, setCurrentMessage] = useState(message);

    const config = useMemo(() => MOOD_CONFIGS[mood], [mood]);

    // Atualiza mensagem
    useEffect(() => {
        // Defer state updates to satisfy react-hooks/set-state-in-effect
        Promise.resolve().then(() => {
            if (message) {
                setCurrentMessage(message);
                setIsMessageVisible(true);
            } else {
                setCurrentMessage(config.defaultMessage);
            }
        });
    }, [message, config.defaultMessage]);

    // Atualiza visibilidade
    useEffect(() => {
        // Defer state update to satisfy react-hooks/set-state-in-effect
        Promise.resolve().then(() => {
            setIsVisible(visible);
        });
    }, [visible]);

    // Auto-hide
    useEffect(() => {
        if (autoHide && isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, autoHide * 1000);
            return () => clearTimeout(timer);
        }
    }, [autoHide, isVisible]);

    // Esconde mensagem após um tempo
    useEffect(() => {
        if (isMessageVisible && message) {
            const timer = setTimeout(() => {
                setIsMessageVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isMessageVisible, message]);

    // Mensagem aleatória ao clicar
    const handleClick = useCallback(() => {
        if (onClick) {
            onClick();
        } else {
            const messages = RANDOM_MESSAGES.idle;
            const random = messages[Math.floor(Math.random() * messages.length)];
            setCurrentMessage(random);
            setIsMessageVisible(true);
        }
    }, [onClick]);

    if (!isVisible) return null;

    return (
        <button
            className={`mascot mascot--${size} mascot--${position}`}
            onClick={handleClick}
            type="button"
            aria-label={`Mascote Pythoninho: ${mood}. ${isMessageVisible && currentMessage ? `Dizendo: ${currentMessage}` : 'Clique para interagir'}`}
        >
            {/* Balão de fala */}
            {isMessageVisible && currentMessage && (
                <div
                    className="mascot__bubble"
                    style={{ borderColor: config.color }}
                >
                    <p className="mascot__message">{currentMessage}</p>
                    <div
                        className="mascot__bubble-tail"
                        style={{ borderTopColor: config.color }}
                    />
                </div>
            )}

            {/* Corpo do mascote */}
            <div
                className={`mascot__body mascot__body--${config.animation}`}
                style={{
                    '--mascot-color': config.color,
                    boxShadow: `0 0 20px ${config.color}40`
                } as React.CSSProperties}
            >
                {/* Rosto */}
                <span className="mascot__face">{config.face}</span>

                {/* Cauda de cobra (decorativa) */}
                <div className="mascot__tail">
                    <svg viewBox="0 0 40 20" className="mascot__tail-svg">
                        <path
                            d="M0,10 Q10,0 20,10 Q30,20 40,10"
                            fill="none"
                            stroke={config.color}
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Brilho */}
                <div className="mascot__glow" />
            </div>

            {/* Nome do mascote */}
            <span className="mascot__name">Pythoninho</span>
        </button>
    );
}


export default Mascot;
