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

    return (
        <div className="mission-notification">
            <div className="mission-notification__content">
                <div className="mission-notification__icon">🎯</div>
                <div className="mission-notification__text">
                    <h3>Missão Cumprida!</h3>
                    <p>{notification.title}</p>
                    <div className="mission-notification__rewards">
                        {notification.rewards.stars > 0 && <span>⭐ +{notification.rewards.stars}</span>}
                        {notification.rewards.xp > 0 && <span>✨ +{notification.rewards.xp} XP</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
