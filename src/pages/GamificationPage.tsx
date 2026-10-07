import { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/common/SEO';
import {
    AchievementGrid,
    MissionList,
    AvatarShop,
    Leaderboard,
    GamificationHeader,
    GamificationOverview,
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
            <GamificationHeader
                userData={userData}
                inventory={inventory}
                currentLevel={currentLevel}
                totalXP={gamification.level.totalXP}
                unlockedAchievementsCount={unlockedAchievements.length}
                activeMissionsCount={activeMissions.filter(m => m.status === 'active').length}
                streakCount={streak.currentStreak}
                setActiveTab={setActiveTab}
            />

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
                    <GamificationOverview
                        streak={streak}
                        userPowerUps={userPowerUps}
                        userStars={userStars}
                        dailyMissions={dailyMissions}
                        activeMissions={activeMissions}
                        unlockedAchievements={unlockedAchievements}
                        usePowerUp={usePowerUp}
                        buyPowerUp={buyPowerUp}
                        setActiveTab={setActiveTab}
                    />
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
