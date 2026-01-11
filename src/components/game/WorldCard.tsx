import type { CSSProperties } from 'react';
import { memo } from 'react';
import type { World } from '../../types/question';

interface WorldInfo {
    id: World;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredScore?: number;
}

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
    onClick,
    onShowTutorial,
    onShowFlashcards
}: WorldCardProps) {
    return (
        <div className="world-card-wrapper">
            <button
                className={`world-card ${unlocked ? 'world-card--unlocked' : 'world-card--locked'} ${isComplete ? 'world-card--complete' : ''}`}
                style={{ '--world-color': world.color } as CSSProperties}
                onClick={() => onClick(world)}
                disabled={!unlocked}
            >
                <div className="world-card__number">{index + 1}</div>

                <div className="world-card__icon">
                    {unlocked ? world.icon : '🔒'}
                </div>

                <h3 className="world-card__name">{world.name}</h3>
                <p className="world-card__description">{world.description}</p>

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
                        🔒 Precisa de {world.requiredScore} ⭐
                    </div>
                )}

                {isComplete && (
                    <div className="world-card__badge">🏆</div>
                )}

                {/* Indicador de Boss - só falta 1 para completar */}
                {unlocked && !isComplete && total > 0 && completed === total - 1 && (
                    <div className="world-card__boss-badge">
                        👹 BOSS BATTLE!
                    </div>
                )}

                {/* Indicador de tutorial novo */}
                {unlocked && hasTutorial && !viewedTutorial && (
                    <div className="world-card__tutorial-badge">
                        📖 Nova lição!
                    </div>
                )}
            </button>

            {/* Botões de ações extras quando desbloqueado */}
            {unlocked && (
                <div className="world-card__actions">
                    {hasTutorial && (
                        <button
                            className="world-card__action-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowTutorial(world.id);
                            }}
                            title="Ver Tutorial"
                        >
                            📖
                        </button>
                    )}
                    <button
                        className="world-card__action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowFlashcards(world.id);
                        }}
                        title="Flashcards"
                    >
                        📚
                    </button>
                </div>
            )}
        </div>
    );
});
