import { useEffect, useState } from 'react';
import type { Achievement, LevelInfo } from '../../../types/gamification';
import './GamificationToast.css';

interface AchievementToastProps {
    achievement: Achievement;
    onClose: () => void;
}

/**
 * Toast de conquista desbloqueada
 */
export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Anima entrada
        setTimeout(() => setIsVisible(true), 100);

        // Auto-fecha após 5 segundos
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            className={`toast toast--achievement ${isVisible ? 'toast--visible' : ''}`}
            role="status"
            aria-live="polite"
        >
            <div className="toast__glow" />

            <div className="toast__icon">{achievement.icon}</div>

            <div className="toast__content">
                <span className="toast__label">🏆 Conquista Desbloqueada!</span>
                <span className="toast__title">{achievement.name}</span>
                <span className="toast__description">{achievement.description}</span>
            </div>

            <div className="toast__rewards">
                <span className="toast__reward">+{achievement.xpReward} XP</span>
                {achievement.starsReward > 0 && (
                    <span className="toast__reward">+{achievement.starsReward} ⭐</span>
                )}
            </div>

            <button className="toast__close" onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }}>
                ✕
            </button>
        </div>
    );
}

interface LevelUpToastProps {
    level: LevelInfo;
    onClose: () => void;
}

/**
 * Toast de level up
 */
export function LevelUpToast({ level, onClose }: LevelUpToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 6000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`toast toast--levelup ${isVisible ? 'toast--visible' : ''}`}
            style={{ '--level-color': level.color } as React.CSSProperties}
            role="status"
            aria-live="assertive"
        >
            <div className="toast__glow toast__glow--levelup" />

            <div className="toast__icon toast__icon--levelup">{level.icon}</div>

            <div className="toast__content">
                <span className="toast__label">⬆️ LEVEL UP!</span>
                <span className="toast__title">Nível {level.level}</span>
                <span className="toast__description">{level.name}</span>
            </div>

            {level.rewards && (
                <div className="toast__rewards">
                    {level.rewards.stars && (
                        <span className="toast__reward">+{level.rewards.stars} ⭐</span>
                    )}
                </div>
            )}

            <button className="toast__close" onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }}>
                ✕
            </button>

            {/* Confetes */}
            <div className="toast__confetti">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="confetti-piece" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
                        {['🎉', '✨', '🌟', '💫', '🎊'][i % 5]}
                    </span>
                ))}
            </div>
        </div>
    );
}

/**
 * Container para múltiplos toasts
 */
interface ToastContainerProps {
    achievements: Achievement[];
    levelUp: LevelInfo | null;
    onDismissAchievement: (id: string) => void;
    onDismissLevelUp: () => void;
}

export function GamificationToastContainer({
    achievements,
    levelUp,
    onDismissAchievement,
    onDismissLevelUp,
}: ToastContainerProps) {
    return (
        <div className="toast-container">
            {levelUp && (
                <LevelUpToast level={levelUp} onClose={onDismissLevelUp} />
            )}
            {achievements.map(achievement => (
                <AchievementToast
                    key={achievement.id}
                    achievement={achievement}
                    onClose={() => onDismissAchievement(achievement.id)}
                />
            ))}
        </div>
    );
}

export default GamificationToastContainer;
