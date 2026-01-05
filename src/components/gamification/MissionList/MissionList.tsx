import type { Mission, UserMission } from '../../../types/gamification';
import './MissionList.css';

interface MissionListProps {
    dailyMissions: Mission[];
    weeklyMissions: Mission[];
    userMissions: UserMission[];
    onClaim: (missionId: string) => void;
}

/**
 * Lista de missões diárias e semanais
 */
export function MissionList({ dailyMissions, weeklyMissions, userMissions, onClaim }: MissionListProps) {
    const getUserMission = (missionId: string) => userMissions.find(m => m.missionId === missionId);

    const renderMission = (mission: Mission) => {
        const userMission = getUserMission(mission.id);
        const progress = userMission?.progress || 0;
        const percentage = Math.min(100, (progress / mission.targetValue) * 100);
        const isCompleted = userMission?.status === 'completed';
        const isClaimed = userMission?.status === 'claimed';

        return (
            <div
                key={mission.id}
                className={`mission-card ${isCompleted ? 'mission-card--completed' : ''} ${isClaimed ? 'mission-card--claimed' : ''}`}
            >
                <div className="mission-card__icon">{mission.icon}</div>

                <div className="mission-card__content">
                    <div className="mission-card__header">
                        <span className="mission-card__title">{mission.title}</span>
                        <span className={`mission-card__type mission-card__type--${mission.type}`}>
                            {mission.type === 'daily' ? 'Diária' : 'Semanal'}
                        </span>
                    </div>

                    <p className="mission-card__description">{mission.description}</p>

                    <div className="mission-card__progress">
                        <div className="mission-card__progress-bar">
                            <div
                                className="mission-card__progress-fill"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="mission-card__progress-text">
                            {progress}/{mission.targetValue}
                        </span>
                    </div>
                </div>

                <div className="mission-card__rewards">
                    <span className="mission-card__reward">
                        <span className="mission-card__reward-icon">⭐</span>
                        <span>{mission.starsReward}</span>
                    </span>
                    <span className="mission-card__reward">
                        <span className="mission-card__reward-icon">✨</span>
                        <span>{mission.xpReward} XP</span>
                    </span>
                </div>

                {isCompleted && !isClaimed && (
                    <button
                        className="mission-card__claim-btn"
                        onClick={() => onClaim(mission.id)}
                    >
                        🎁 Resgatar!
                    </button>
                )}

                {isClaimed && (
                    <div className="mission-card__claimed-badge">
                        ✅ Resgatado
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mission-list">
            <section className="mission-list__section">
                <h3 className="mission-list__section-title">
                    <span className="mission-list__section-icon">📅</span>
                    Missões Diárias
                    <span className="mission-list__section-timer">Renova à meia-noite</span>
                </h3>
                <div className="mission-list__grid">
                    {dailyMissions.map(renderMission)}
                </div>
            </section>

            <section className="mission-list__section">
                <h3 className="mission-list__section-title">
                    <span className="mission-list__section-icon">📆</span>
                    Missões Semanais
                    <span className="mission-list__section-timer">Renova no domingo</span>
                </h3>
                <div className="mission-list__grid">
                    {weeklyMissions.map(renderMission)}
                </div>
            </section>
        </div>
    );
}

export default MissionList;
