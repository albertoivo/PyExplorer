import type { UserData } from '../../../types/question';
import type { UserInventory, LevelInfo } from '../../../types/gamification';
import { SHOP_ITEMS } from '../../../data/gamificationData';
import { LevelBadge } from '../LevelBadge/LevelBadge';
import './GamificationHeader.css';

interface GamificationHeaderProps {
    userData: UserData | null;
    inventory: UserInventory;
    currentLevel: LevelInfo;
    totalXP: number;
    unlockedAchievementsCount: number;
    activeMissionsCount: number;
    streakCount: number;
    setActiveTab: (tab: 'overview' | 'achievements' | 'missions' | 'shop' | 'ranking') => void;
}

export function GamificationHeader({
    userData,
    inventory,
    currentLevel,
    totalXP,
    unlockedAchievementsCount,
    activeMissionsCount,
    streakCount,
    setActiveTab
}: GamificationHeaderProps) {
    return (
        <header className="gamification-header">
            <div className="gamification-header__user">
                <div className="gamification-header__avatar">
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
                <div className="gamification-header__user-info">
                    <h1 className="gamification-header__name">{userData?.displayName || 'Jogador'}</h1>
                    <LevelBadge level={currentLevel} currentXP={totalXP} showProgress />
                </div>
            </div>

            <div className="gamification-header__stats">
                <div
                    className="gamification-header__stat clickable"
                    onClick={() => setActiveTab('overview')}
                    title="Ver Visão Geral"
                >
                    <span className="gamification-header__stat-icon">⚡</span>
                    <span className="gamification-header__stat-value">{userData?.totalScore || 0}</span>
                    <span className="gamification-header__stat-label">Pontos</span>
                </div>
                <div
                    className="gamification-header__stat clickable"
                    onClick={() => setActiveTab('achievements')}
                    title="Ver Conquistas"
                >
                    <span className="gamification-header__stat-icon">🏅</span>
                    <span className="gamification-header__stat-value">{unlockedAchievementsCount}</span>
                    <span className="gamification-header__stat-label">Conquistas</span>
                </div>
                <div
                    className="gamification-header__stat clickable"
                    onClick={() => setActiveTab('missions')}
                    title="Ver Missões"
                >
                    <span className="gamification-header__stat-icon">📋</span>
                    <span className="gamification-header__stat-value">
                        {activeMissionsCount}
                    </span>
                    <span className="gamification-header__stat-label">Missões</span>
                </div>
                <div
                    className="gamification-header__stat clickable"
                    onClick={() => setActiveTab('overview')} // Streak is in Overview
                    title="Ver Streak"
                >
                    <span className="gamification-header__stat-icon">🔥</span>
                    <span className="gamification-header__stat-value">{streakCount}</span>
                    <span className="gamification-header__stat-label">Streak</span>
                </div>
            </div>
        </header>
    );
}
