import type { LevelInfo } from '../../../types/gamification';
import './LevelBadge.css';

interface LevelBadgeProps {
    level: LevelInfo;
    currentXP: number;
    showProgress?: boolean;
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
}

/**
 * Badge visual do nível do usuário
 */
export function LevelBadge({
    level,
    currentXP,
    showProgress = false,
    size = 'medium',
    onClick,
}: LevelBadgeProps) {
    const progress = level.maxXP === Infinity
        ? 100
        : ((currentXP - level.minXP) / (level.maxXP - level.minXP)) * 100;

    return (
        <div
            className={`level-badge level-badge--${size}`}
            style={{ '--level-color': level.color } as React.CSSProperties}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="level-badge__icon">{level.icon}</div>
            <div className="level-badge__info">
                <span className="level-badge__level">Nível {level.level}</span>
                <span className="level-badge__name">{level.name}</span>
            </div>

            {showProgress && (
                <div className="level-badge__progress">
                    <div className="level-badge__progress-bar">
                        <div
                            className="level-badge__progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="level-badge__progress-text">
                        {level.maxXP === Infinity ? 'MAX' : `${currentXP - level.minXP}/${level.maxXP - level.minXP} XP`}
                    </span>
                </div>
            )}
        </div>
    );
}

export default LevelBadge;
