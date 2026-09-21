import type { Achievement, Mission, UserMission, UserStreak, UserPowerUps, PowerUpType } from '../../../types/gamification';
import { StreakDisplay } from '../StreakDisplay/StreakDisplay';
import { PowerUpBar } from '../PowerUpBar/PowerUpBar';
import './GamificationOverview.css';

interface GamificationOverviewProps {
    streak: UserStreak;
    userPowerUps: UserPowerUps;
    userStars: number;
    dailyMissions: Mission[];
    activeMissions: UserMission[];
    unlockedAchievements: Achievement[];
    usePowerUp: (powerUpId: PowerUpType) => boolean;
    buyPowerUp: (powerUpId: PowerUpType, price: number) => boolean;
    setActiveTab: (tab: 'overview' | 'achievements' | 'missions' | 'shop' | 'ranking') => void;
}

export function GamificationOverview({
    streak,
    userPowerUps,
    userStars,
    dailyMissions,
    activeMissions,
    unlockedAchievements,
    usePowerUp,
    buyPowerUp,
    setActiveTab
}: GamificationOverviewProps) {
    return (
        <div className="gamification-overview">
            <div className="gamification-overview__section">
                <StreakDisplay streak={streak} />
            </div>

            <div className="gamification-overview__section">
                <h3 className="gamification-overview__section-title">⚡ Power-ups</h3>
                <PowerUpBar
                    userPowerUps={userPowerUps}
                    userStars={userStars}
                    onUsePowerUp={usePowerUp}
                    onBuyPowerUp={buyPowerUp}
                />
            </div>

            <div className="gamification-overview__section">
                <h3 className="gamification-overview__section-title">📋 Missões de Hoje</h3>
                <div className="gamification-overview__mini-missions">
                    {dailyMissions.slice(0, 2).map(mission => {
                        const userMission = activeMissions.find(m => m.missionId === mission.id);
                        const progress = userMission?.progress || 0;
                        const percentage = (progress / mission.targetValue) * 100;

                        return (
                            <div key={mission.id} className="mini-mission">
                                <span className="mini-mission__icon">{mission.icon}</span>
                                <div className="mini-mission__info">
                                    <span className="mini-mission__title">{mission.title}</span>
                                    <div className="mini-mission__bar">
                                        <div className="mini-mission__fill" style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                                <span className="mini-mission__progress">{progress}/{mission.targetValue}</span>
                            </div>
                        );
                    })}
                </div>
                <button className="gamification-overview__see-all" onClick={() => setActiveTab('missions')}>
                    Ver todas as missões →
                </button>
            </div>

            <div className="gamification-overview__section">
                <h3 className="gamification-overview__section-title">🏅 Últimas Conquistas</h3>
                <div className="gamification-overview__recent-achievements">
                    {unlockedAchievements.slice(0, 4).map(achievement => (
                        <div key={achievement.id} className="recent-achievement">
                            <span className="recent-achievement__icon">{achievement.icon}</span>
                            <span className="recent-achievement__name">{achievement.name}</span>
                        </div>
                    ))}
                    {unlockedAchievements.length === 0 && (
                        <p className="gamification-overview__empty">Nenhuma conquista ainda. Continue jogando!</p>
                    )}
                </div>
                <button className="gamification-overview__see-all" onClick={() => setActiveTab('achievements')}>
                    Ver todas as conquistas →
                </button>
            </div>
        </div>
    );
}
