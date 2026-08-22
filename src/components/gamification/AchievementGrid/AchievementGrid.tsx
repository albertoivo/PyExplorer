import { useState } from 'react';
import type { Achievement, AchievementCategory, AchievementRarity } from '../../../types/gamification';
import { useTranslation } from 'react-i18next';
import './AchievementGrid.css';

interface AchievementGridProps {
    achievements: Achievement[];
    unlockedIds: string[];
    onAchievementClick?: (achievement: Achievement) => void;
}

const CATEGORY_KEYS: Record<AchievementCategory, { key: string; icon: string }> = {
    learning: { key: 'achievementGrid.categories.learning', icon: '📚' },
    streak: { key: 'achievementGrid.categories.streak', icon: '🔥' },
    mastery: { key: 'achievementGrid.categories.mastery', icon: '⭐' },
    social: { key: 'achievementGrid.categories.social', icon: '👥' },
    special: { key: 'achievementGrid.categories.special', icon: '🎁' },
    boss: { key: 'achievementGrid.categories.boss', icon: '⚔️' },
    collection: { key: 'achievementGrid.categories.collection', icon: '💎' },
};

const RARITY_COLORS: Record<AchievementRarity, string> = {
    common: '#a0aec0',
    rare: '#63b3ed',
    epic: '#9f7aea',
    legendary: '#ffd700',
};

/**
 * Grid de conquistas com filtro por categoria
 */
export function AchievementGrid({ achievements, unlockedIds, onAchievementClick }: AchievementGridProps) {
    const { t } = useTranslation('gamification');
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
    const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

    const categories = Object.keys(CATEGORY_KEYS) as AchievementCategory[];

    const filteredAchievements = achievements.filter(a => {
        if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
        if (showUnlockedOnly && !unlockedIds.includes(a.id)) return false;
        if (a.hidden && !unlockedIds.includes(a.id)) return false;
        return true;
    });

    const unlockedCount = achievements.filter(a => unlockedIds.includes(a.id)).length;
    const totalVisible = achievements.filter(a => !a.hidden || unlockedIds.includes(a.id)).length;

    return (
        <div className="achievement-grid">
            <div className="achievement-grid__header">
                <h3 className="achievement-grid__title">
                    🏆 {t('achievementGrid.title', 'Conquistas')}
                    <span className="achievement-grid__count">{unlockedCount}/{totalVisible}</span>
                </h3>

                <div className="achievement-grid__filters">
                    <button
                        className={`achievement-grid__filter ${selectedCategory === 'all' ? 'achievement-grid__filter--active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        {t('achievementGrid.filterAll', 'Todas')}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`achievement-grid__filter ${selectedCategory === cat ? 'achievement-grid__filter--active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                            title={t(CATEGORY_KEYS[cat].key as unknown as string)}
                        >
                            {CATEGORY_KEYS[cat].icon}
                        </button>
                    ))}
                </div>

                <label className="achievement-grid__toggle">
                    <input
                        type="checkbox"
                        checked={showUnlockedOnly}
                        onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                    />
                    <span>{t('achievementGrid.unlockedOnly', 'Só desbloqueadas')}</span>
                </label>
            </div>

            <div className="achievement-grid__list">
                {filteredAchievements.map(achievement => {
                    const isUnlocked = unlockedIds.includes(achievement.id);
                    return (
                        <button
                            key={achievement.id}
                            className={`achievement-card ${isUnlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
                            style={{ '--rarity-color': RARITY_COLORS[achievement.rarity] } as React.CSSProperties}
                            onClick={() => onAchievementClick?.(achievement)}
                        >
                            <div className="achievement-card__icon">
                                {isUnlocked ? achievement.icon : '🔒'}
                            </div>
                            <div className="achievement-card__info">
                                <span className="achievement-card__name">{t(`achievements.items.${achievement.id}.name`, achievement.name)}</span>
                                <span className="achievement-card__description">
                                    {isUnlocked ? t(`achievements.items.${achievement.id}.description`, achievement.description) : t(`achievements.items.${achievement.id}.condition`, achievement.condition)}
                                </span>
                            </div>
                            <div className="achievement-card__rarity">
                                <span className={`achievement-card__rarity-dot achievement-card__rarity-dot--${achievement.rarity}`} />
                            </div>
                            {isUnlocked && (
                                <div className="achievement-card__reward">
                                    +{achievement.xpReward} XP
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {filteredAchievements.length === 0 && (
                <div className="achievement-grid__empty">
                    <span className="achievement-grid__empty-icon">🎯</span>
                    <p>{t('achievementGrid.empty', 'Nenhuma conquista encontrada')}</p>
                </div>
            )}
        </div>
    );
}

