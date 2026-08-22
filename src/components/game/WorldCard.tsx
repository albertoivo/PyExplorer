import type { CSSProperties } from 'react';
import { memo } from 'react';
import type { World } from '../../types/question';
import type { WorldInfo } from '../../data/worlds';
import { useTranslation } from 'react-i18next';

interface WorldCardProps {
    world: WorldInfo;
    index: number;
    unlocked: boolean;
    completed: number;
    total: number;
    percentage: number;
    isComplete: boolean;
    hasTutorial: boolean;
    viewedTutorial: boolean;
    sagaBadge?: string;
    onClick: (world: WorldInfo) => void;
    onShowTutorial: (worldId: World) => void;
    onShowFlashcards: (worldId: World) => void;
}

export const WorldCard = memo(function WorldCard({
    world,
    index,
    unlocked,
    completed,
    total,
    percentage,
    isComplete,
    hasTutorial,
    viewedTutorial,
    sagaBadge,
    onClick,
    onShowTutorial,
    onShowFlashcards
}: WorldCardProps) {
    const { t } = useTranslation(['game', 'worlds']);
    return (
        <div className="world-card-wrapper">
            <button
                className={`world-card ${unlocked ? 'world-card--unlocked' : 'world-card--locked'} ${isComplete ? 'world-card--complete' : ''}`}
                style={{ '--world-color': world.color } as CSSProperties}
                onClick={() => onClick(world)}
                disabled={!unlocked}
                aria-label={t('game:worldCard.ariaLabel', { defaultValue: 'Mundo {{num}}: {{name}}. {{status}}.{{progress}}', 
                    num: index + 1,
                    name: t(`worlds:${world.id}.name`, world.name),
                    status: unlocked ? (isComplete ? t('game:status.completed', 'Completo') : t('game:status.available', 'Disponível')) : t('game:status.locked', 'Bloqueado'),
                    progress: unlocked && total > 0 ? t('game:worldCard.progressPrefix', { defaultValue: ' Progresso: {{pct}}%.',  pct: percentage.toFixed(0) }) : ''
                })}
            >
                <div className="world-card__top-bar">
                    <span className="world-card__number" aria-hidden="true">#{index + 1}</span>
                    {sagaBadge && (
                        <span className="world-card__saga-chip">{sagaBadge}</span>
                    )}
                </div>

                <div className="world-card__icon" aria-hidden="true">
                    {unlocked ? world.icon : '🔒'}
                </div>

                <h3 className="world-card__name">{t(`worlds:${world.id}.name`, world.name)}</h3>
                <p className="world-card__description">{t(`worlds:${world.id}.description`, world.description)}</p>

                {unlocked && total > 0 && (
                    <div className="world-card__progress">
                        <div className="world-card__progress-bar">
                            <div
                                className="world-card__progress-fill"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="world-card__progress-text">
                            {completed}/{total}
                        </span>
                    </div>
                )}

                {!unlocked && world.requiredScore && (
                    <div className="world-card__requirement">
                        🔒 {t('game:worldCard.requirement', { defaultValue: 'Requer {{score}} ⚡ pts',  score: world.requiredScore })}
                    </div>
                )}

                {isComplete && (
                    <div className="world-card__badge" title={t('game:worldCard.completedTooltip', 'Mundo 100% Concluído!')}>🏆</div>
                )}

                {/* Indicador de Boss - só falta 1 para completar */}
                {unlocked && !isComplete && total > 0 && completed === total - 1 && (
                    <div className="world-card__boss-badge">
                        👹 {t('game:worldCard.bossBattle', 'BOSS BATTLE!')}
                    </div>
                )}

                {/* Indicador de tutorial novo */}
                {unlocked && hasTutorial && !viewedTutorial && (
                    <div className="world-card__tutorial-badge">
                        ✨ {t('game:worldCard.newLesson', 'Nova Aula!')}
                    </div>
                )}
            </button>

            {/* Ações Rápidas (Flashcards e Tutorial) */}
            {unlocked && (
                <div className="world-card__quick-actions">
                    {hasTutorial && (
                        <button
                            className="world-card__quick-btn world-card__quick-btn--tutorial"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowTutorial(world.id);
                            }}
                            title={t('game:worldCard.viewLesson', 'Ver Aula Explicativa')}
                            aria-label={t('game:worldCard.viewLesson', 'Ver Aula Explicativa')}
                        >
                            📖
                        </button>
                    )}
                    <button
                        className="world-card__quick-btn world-card__quick-btn--flashcards"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowFlashcards(world.id);
                        }}
                        title={t('game:worldCard.reviewFlashcards', 'Revisar com Flashcards')}
                        aria-label={t('game:worldCard.reviewFlashcards', 'Revisar com Flashcards')}
                    >
                        📚
                    </button>
                </div>
            )}
        </div>
    );
});
