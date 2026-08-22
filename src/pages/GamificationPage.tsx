import { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../hooks/useAuth';
import { SHOP_ITEMS } from '../data/gamificationData';
import { SEO } from '../components/common/SEO';
import {
    LevelBadge,
    StreakDisplay,
    AchievementGrid,
    MissionList,
    AvatarShop,
    PowerUpBar,
    Leaderboard,
} from '../components/gamification';
import { useTranslation } from 'react-i18next';
import './GamificationPage.css';

type GamificationTab = 'overview' | 'achievements' | 'missions' | 'shop' | 'ranking';

/**
 * Página de gamificação
 */
export function GamificationPage() {
    const { t } = useTranslation(['gamification', 'common']);
    const { userData } = useAuth();
    const {
        currentLevel,
        streak,
        achievements,
        unlockedAchievements,
        dailyMissions,
        weeklyMissions,
        activeMissions,
        inventory,
        buyShopItem,
        equipItem,
        userPowerUps,
        usePowerUp,
        buyPowerUp,
        gamification,
        userStars,
    } = useGamification();


    const [activeTab, setActiveTab] = useState<GamificationTab>('overview');

    const tabs: { id: GamificationTab; name: string; icon: string }[] = [
        { id: 'overview', name: t('tabs.overview', 'Visão Geral'), icon: '📊' },
        { id: 'achievements', name: t('tabs.achievements', 'Conquistas'), icon: '🏅' },
        { id: 'missions', name: t('tabs.missions', 'Missões'), icon: '📋' },
        { id: 'shop', name: t('tabs.shop', 'Loja'), icon: '🛒' },
        { id: 'ranking', name: t('tabs.ranking', 'Ranking'), icon: '👑' },
    ];

    return (
        <div className="gamification-page">
            <SEO
                title={t('seoTitle')}
                description={t('seoDescription')}
                noindex
            />

            {/* Header com nível e stats */}
            <header className="gamification-page__header">
                <div className="gamification-page__user">
                    <div className="gamification-page__avatar">
                        {(() => {
                            const equippedId = inventory.equippedAvatar || 'avatar_snake_green';
                            const equippedFrameId = inventory.equippedFrame;
                            const item = SHOP_ITEMS.find(i => i.id === equippedId);
                            const frameItem = equippedFrameId ? SHOP_ITEMS.find(i => i.id === equippedFrameId) : null;
                            const avatarIcon = item?.icon || '🐍';

                            if (frameItem?.color) {
                                const borderColor = frameItem.color === 'rainbow'
                                    ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
                                    : frameItem.color;
                                return (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        border: frameItem.color === 'rainbow' ? '4px solid transparent' : `4px solid ${borderColor}`,
                                        background: frameItem.color === 'rainbow' ? borderColor : 'transparent',
                                        backgroundClip: frameItem.color === 'rainbow' ? 'padding-box' : undefined,
                                    }}>
                                        <span style={{ fontSize: '60px', lineHeight: 1 }}>{avatarIcon}</span>
                                    </span>
                                );
                            }
                            return avatarIcon;
                        })()}
                    </div>
                    <div className="gamification-page__user-info">
                        <h1 className="gamification-page__name">{userData?.displayName || t('common:player')}</h1>
                        <LevelBadge level={currentLevel} currentXP={gamification.level.totalXP} showProgress />
                    </div>
                </div>

                <div className="gamification-page__stats">
                    <div
                        className="gamification-page__stat clickable"
                        onClick={() => setActiveTab('overview')}
                        title={t('tabs.overview')}
                    >
                        <span className="gamification-page__stat-icon">⚡</span>
                        <span className="gamification-page__stat-value">{userData?.totalScore || 0}</span>
                        <span className="gamification-page__stat-label">{t('stats.score')}</span>
                    </div>
                    <div
                        className="gamification-page__stat clickable"
                        onClick={() => setActiveTab('achievements')}
                        title={t('tabs.achievements')}
                    >
                        <span className="gamification-page__stat-icon">🏅</span>
                        <span className="gamification-page__stat-value">{unlockedAchievements.length}</span>
                        <span className="gamification-page__stat-label">{t('stats.achievements')}</span>
                    </div>
                    <div
                        className="gamification-page__stat clickable"
                        onClick={() => setActiveTab('missions')}
                        title={t('tabs.missions')}
                    >
                        <span className="gamification-page__stat-icon">📋</span>
                        <span className="gamification-page__stat-value">
                            {activeMissions.filter(m => m.status === 'active').length}
                        </span>
                        <span className="gamification-page__stat-label">{t('stats.missions')}</span>
                    </div>
                    <div
                        className="gamification-page__stat clickable"
                        onClick={() => setActiveTab('overview')} // Streak is in Overview
                        title={t('tabs.overview')}
                    >
                        <span className="gamification-page__stat-icon">🔥</span>
                        <span className="gamification-page__stat-value">{streak.currentStreak}</span>
                        <span className="gamification-page__stat-label">{t('stats.streak')}</span>
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
                            <h3 className="gamification-page__section-title">⚡ {t('powerups.title')}</h3>
                            <PowerUpBar
                                userPowerUps={userPowerUps}
                                userStars={userStars}
                                onUsePowerUp={usePowerUp}
                                onBuyPowerUp={buyPowerUp}
                            />
                        </div>

                        <div className="gamification-page__section">
                            <h3 className="gamification-page__section-title">📋 {t('missions.today')}</h3>
                            <div className="gamification-page__mini-missions">
                                {dailyMissions.slice(0, 2).map(mission => {
                                    const userMission = activeMissions.find(m => m.missionId === mission.id);
                                    const progress = userMission?.progress || 0;
                                    const percentage = (progress / mission.targetValue) * 100;

                                    return (
                                        <div key={mission.id} className="mini-mission">
                                            <span className="mini-mission__icon">{mission.icon}</span>
                                            <div className="mini-mission__info">
                                                <span className="mini-mission__title">{t(`missions.items.${mission.id}.title`, mission.title)}</span>
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
                                {t('missions.seeAll')} →
                            </button>
                        </div>

                        <div className="gamification-page__section">
                            <h3 className="gamification-page__section-title">🏅 {t('achievements.recent')}</h3>
                            <div className="gamification-page__recent-achievements">
                                {unlockedAchievements.slice(0, 4).map(achievement => (
                                    <div key={achievement.id} className="recent-achievement">
                                        <span className="recent-achievement__icon">{achievement.icon}</span>
                                        <span className="recent-achievement__name">{t(`achievements.items.${achievement.id}.name`, achievement.name)}</span>
                                    </div>
                                ))}
                                {unlockedAchievements.length === 0 && (
                                    <p className="gamification-page__empty">{t('achievements.empty')}</p>
                                )}
                            </div>
                            <button className="gamification-page__see-all" onClick={() => setActiveTab('achievements')}>
                                {t('achievements.seeAll')} →
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
                    />
                )}

                {activeTab === 'shop' && (
                    <AvatarShop
                        userStars={userStars}
                        userLevel={currentLevel.level}
                        inventory={inventory}
                        onBuy={buyShopItem}
                        onEquip={equipItem}
                    />
                )}

                {activeTab === 'ranking' && (
                    <Leaderboard
                        currentUserId={userData?.uid}
                    />
                )}
            </main>
        </div>
    );
}

