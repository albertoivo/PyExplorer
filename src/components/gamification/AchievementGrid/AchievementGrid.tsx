import { useState } from 'react';
import type { Achievement, AchievementCategory, AchievementRarity } from '../../../types/gamification';
import './AchievementGrid.css';

interface AchievementGridProps {
    achievements: Achievement[];
    unlockedIds: string[];
    onAchievementClick?: (achievement: Achievement) => void;
}

const CATEGORY_LABELS: Record<AchievementCategory, { name: string; icon: string }> = {
    learning: { name: 'Aprendizado', icon: '📚' },
    streak: { name: 'Consistência', icon: '🔥' },
    mastery: { name: 'Maestria', icon: '⭐' },
    social: { name: 'Social', icon: '👥' },
    special: { name: 'Especial', icon: '🎁' },
    boss: { name: 'Chefões', icon: '⚔️' },
    collection: { name: 'Coleção', icon: '💎' },
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
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
    const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

    const categories = Object.keys(CATEGORY_LABELS) as AchievementCategory[];

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
                    🏆 Conquistas
                    <span className="achievement-grid__count">{unlockedCount}/{totalVisible}</span>
                </h3>

                <div className="achievement-grid__filters">
                    <button
                        className={`achievement-grid__filter ${selectedCategory === 'all' ? 'achievement-grid__filter--active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        Todas
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`achievement-grid__filter ${selectedCategory === cat ? 'achievement-grid__filter--active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {CATEGORY_LABELS[cat].icon}
                        </button>
                    ))}
                </div>

                <label className="achievement-grid__toggle">
                    <input
                        type="checkbox"
                        checked={showUnlockedOnly}
                        onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                    />
                    <span>Só desbloqueadas</span>
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
                                <span className="achievement-card__name">{achievement.name}</span>
                                <span className="achievement-card__description">
                                    {isUnlocked ? achievement.description : achievement.condition}
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
                    <p>Nenhuma conquista encontrada</p>
                </div>
            )}
        </div>
    );
}

