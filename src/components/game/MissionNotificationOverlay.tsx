export interface MissionNotification {
    title: string;
    rewards: {
        stars: number;
        xp: number;
    };
}

export interface MissionNotificationOverlayProps {
    notification: MissionNotification | null;
}

/**
 * Componente overlay para notificação de missões cumpridas.
 */
export function MissionNotificationOverlay({ notification }: MissionNotificationOverlayProps) {
    if (!notification) return null;

    const isShield = notification.title.includes('🛡️');

    return (
        <div className="mission-notification">
            <div className="mission-notification__content" style={isShield ? { border: '3px solid #667eea', background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a40 100%)' } : undefined}>
                <div className="mission-notification__icon">{isShield ? '🛡️' : '🎯'}</div>
                <div className="mission-notification__text">
                    <h3>{isShield ? 'Escudo de Streak!' : 'Missão Cumprida!'}</h3>
                    <p>{notification.title}</p>
                    {(notification.rewards.stars > 0 || notification.rewards.xp > 0) && (
                        <div className="mission-notification__rewards">
                            {notification.rewards.stars > 0 && <span>⭐ +{notification.rewards.stars}</span>}
                            {notification.rewards.xp > 0 && <span>✨ +{notification.rewards.xp} XP</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
