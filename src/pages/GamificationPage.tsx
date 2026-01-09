import { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../hooks/useAuth';
import {
    LevelBadge,
    StreakDisplay,
    AchievementGrid,
    MissionList,
    AvatarShop,
    Leaderboard,
    PowerUpBar,
    GamificationToastContainer,
} from '../components/gamification';
import type { LeaderboardEntry } from '../types/gamification';
import './GamificationPage.css';

type GamificationTab = 'overview' | 'achievements' | 'missions' | 'shop' | 'ranking';

/**
 * Página de gamificação
 */
export function GamificationPage() {
    const { userData } = useAuth();
    const {
        currentLevel,
        streak,
        achievements,
        unlockedAchievements,
        newAchievements,
        markAchievementSeen,
        dailyMissions,
        weeklyMissions,
        activeMissions,
        claimMissionReward,
        inventory,
        buyShopItem,
        equipItem,
        userPowerUps,
        usePowerUp,
        buyPowerUp,
        showLevelUp,
        dismissLevelUp,
        gamification,
    } = useGamification();

    const [activeTab, setActiveTab] = useState<GamificationTab>('overview');

    // Mock leaderboard data (em produção, viria do Firestore)
    const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, uid: '1', displayName: 'PythonMaster', avatar: '🐍', score: 5420, level: 12 },
        { rank: 2, uid: '2', displayName: 'CodeNinja', avatar: '🥷', score: 4850, level: 11 },
        { rank: 3, uid: '3', displayName: 'ByteKid', avatar: '🤖', score: 4200, level: 10 },
        { rank: 4, uid: '4', displayName: 'LoopMaster', avatar: '🔄', score: 3800, level: 9 },
        { rank: 5, uid: '5', displayName: 'FuncGuru', avatar: '✨', score: 3500, level: 9 },
        { rank: 6, uid: userData?.uid || '6', displayName: userData?.displayName || 'Você', avatar: '🎮', score: userData?.totalScore || 0, level: currentLevel.level, isCurrentUser: true },
    ].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

    const tabs: { id: GamificationTab; name: string; icon: string }[] = [
        { id: 'overview', name: 'Visão Geral', icon: '📊' },
        { id: 'achievements', name: 'Conquistas', icon: '🏆' },
        { id: 'missions', name: 'Missões', icon: '📋' },
        { id: 'shop', name: 'Loja', icon: '🛒' },
        { id: 'ranking', name: 'Ranking', icon: '🏅' },
    ];

    return (
        <div className="gamification-page">
            {/* Toast de notificações */}
            <GamificationToastContainer
                achievements={newAchievements}
                levelUp={showLevelUp}
                onDismissAchievement={markAchievementSeen}
                onDismissLevelUp={dismissLevelUp}
            />

            {/* Header com nível e stats */}
            <header className="gamification-page__header">
                <div className="gamification-page__user">
                    <div className="gamification-page__avatar">
                        {inventory.equippedAvatar === 'avatar_snake_green' ? '🐍' : '🎮'}
                    </div>
                    <div className="gamification-page__user-info">
                        <h1 className="gamification-page__name">{userData?.displayName || 'Jogador'}</h1>
                        <LevelBadge level={currentLevel} currentXP={gamification.level.totalXP} showProgress />
                    </div>
                </div>

                <div className="gamification-page__stats">
                    <div className="gamification-page__stat">
                        <span className="gamification-page__stat-icon">⭐</span>
                        <span className="gamification-page__stat-value">{userData?.totalScore || 0}</span>
                        <span className="gamification-page__stat-label">Estrelas</span>
                    </div>
                    <div className="gamification-page__stat">
                        <span className="gamification-page__stat-icon">🏆</span>
                        <span className="gamification-page__stat-value">{unlockedAchievements.length}</span>
                        <span className="gamification-page__stat-label">Conquistas</span>
                    </div>
                    <div className="gamification-page__stat">
                        <span className="gamification-page__stat-icon">🔥</span>
                        <span className="gamification-page__stat-value">{streak.currentStreak}</span>
                        <span className="gamification-page__stat-label">Streak</span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <nav className="gamification-page__tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`gamification-page__tab ${activeTab === tab.id ? 'gamification-page__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="gamification-page__tab-icon">{tab.icon}</span>
                        <span className="gamification-page__tab-name">{tab.name}</span>
                    </button>
                ))}
            </nav>

            {/* Conteúdo */}
            <main className="gamification-page__content">
                {activeTab === 'overview' && (
                    <div className="gamification-page__overview">
                        <div className="gamification-page__section">
                            <StreakDisplay streak={streak} />
                        </div>

                        <div className="gamification-page__section">
                            <h3 className="gamification-page__section-title">⚡ Power-ups</h3>
                            <PowerUpBar
                                userPowerUps={userPowerUps}
                                userStars={userData?.totalScore || 0}
                                onUsePowerUp={usePowerUp}
                                onBuyPowerUp={buyPowerUp}
                            />
                        </div>

                        <div className="gamification-page__section">
                            <h3 className="gamification-page__section-title">📋 Missões de Hoje</h3>
                            <div className="gamification-page__mini-missions">
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
                            <button className="gamification-page__see-all" onClick={() => setActiveTab('missions')}>
                                Ver todas as missões →
                            </button>
                        </div>

                        <div className="gamification-page__section">
                            <h3 className="gamification-page__section-title">🏆 Últimas Conquistas</h3>
                            <div className="gamification-page__recent-achievements">
                                {unlockedAchievements.slice(0, 4).map(achievement => (
                                    <div key={achievement.id} className="recent-achievement">
                                        <span className="recent-achievement__icon">{achievement.icon}</span>
                                        <span className="recent-achievement__name">{achievement.name}</span>
                                    </div>
                                ))}
                                {unlockedAchievements.length === 0 && (
                                    <p className="gamification-page__empty">Nenhuma conquista ainda. Continue jogando!</p>
                                )}
                            </div>
                            <button className="gamification-page__see-all" onClick={() => setActiveTab('achievements')}>
                                Ver todas as conquistas →
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <AchievementGrid
                        achievements={achievements}
                        unlockedIds={unlockedAchievements.map(a => a.id)}
                    />
                )}

                {activeTab === 'missions' && (
                    <MissionList
                        dailyMissions={dailyMissions}
                        weeklyMissions={weeklyMissions}
                        userMissions={activeMissions}
                        onClaim={claimMissionReward}
                    />
                )}

                {activeTab === 'shop' && (
                    <AvatarShop
                        userStars={userData?.balance || 0}
                        userLevel={currentLevel.level}
                        inventory={inventory}
                        onBuy={buyShopItem}
                        onEquip={equipItem}
                    />
                )}

                {activeTab === 'ranking' && (
                    <Leaderboard
                        entries={mockLeaderboard}
                        currentUserId={userData?.uid}
                    />
                )}
            </main>
        </div>
    );
}

export default GamificationPage;
