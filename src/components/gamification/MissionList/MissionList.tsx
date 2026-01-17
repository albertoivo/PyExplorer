import type { Mission, UserMission } from '../../../types/gamification';
import './MissionList.css';

import { ENDGAME_MISSIONS } from '../../../data/gamificationData';

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

    // Identify active endgame missions from userMissions that start with 'endgame_'
    const endgameUserMissions = userMissions.filter(m => m.missionId.startsWith('endgame_'));

    // Construct Mission objects for them
    const activeEndgameMissions: Mission[] = endgameUserMissions.map(um => {
        // Try to find matching definition
        // ID format: endgame_{objectiveType}_{index}
        const typePart = um.missionId.split('_')[1];
        const def = ENDGAME_MISSIONS.find(m => m.objectiveType === typePart || (typePart === 'improve' && m.objectiveType === 'improve_stars') || (typePart === 'syntax' && m.objectiveType === 'syntax_master'));

        if (def) {
            return {
                ...def,
                id: um.missionId
            };
        }
        // Fallback if not found (should not happen if data is consistent)
        return {
            id: um.missionId,
            type: 'endgame',
            title: 'Desafio Secreto',
            description: 'Complete este desafio especial',
            icon: '❓',
            objectiveType: 'speedrun', // fallback
            targetValue: 1,
            starsReward: 0,
            xpReward: 0
        };
    }).filter(m => m.title !== 'Desafio Secreto'); // Optional: filter out fallbacks if desired

    const renderMission = (mission: Mission) => {
        const userMission = getUserMission(mission.id);
        const progress = userMission?.progress || 0;
        const percentage = Math.min(100, (progress / mission.targetValue) * 100);
        const isCompleted = userMission?.status === 'completed';
        const isClaimed = userMission?.status === 'claimed';
        const typeLabel = mission.type === 'daily' ? 'Diária' : (mission.type === 'weekly' ? 'Semanal' : 'Mestre');
        const typeClass = mission.type;

        return (
            <div
                key={mission.id}
                className={`mission-card ${isCompleted ? 'mission-card--completed' : ''} ${isClaimed ? 'mission-card--claimed' : ''}`}
            >
                <div className="mission-card__icon">{mission.icon}</div>

                <div className="mission-card__content">
                    <div className="mission-card__header">
                        <span className="mission-card__title">{mission.title}</span>
                        <span className={`mission-card__type mission-card__type--${typeClass}`}>
                            {typeLabel}
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
            {activeEndgameMissions.length > 0 && (
                <section className="mission-list__section">
                    <h3 className="mission-list__section-title">
                        <span className="mission-list__section-icon">🏆</span>
                        Desafios de Mestre
                        <span className="mission-list__section-timer">Dificuldade Elevada</span>
                    </h3>
                    <div className="mission-list__grid">
                        {activeEndgameMissions.map(renderMission)}
                    </div>
                </section>
            )}

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
