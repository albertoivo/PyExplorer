import type { CSSProperties } from 'react';
import { memo } from 'react';
import type { World } from '../../types/question';
import type { WorldInfo } from '../../data/worlds';

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
    return (
        <div className="world-card-wrapper">
            <button
                className={`world-card ${unlocked ? 'world-card--unlocked' : 'world-card--locked'} ${isComplete ? 'world-card--complete' : ''}`}
                style={{ '--world-color': world.color } as CSSProperties}
                onClick={() => onClick(world)}
                disabled={!unlocked}
                aria-label={`Mundo ${index + 1}: ${world.name}. ${unlocked ? (isComplete ? 'Completo' : 'Disponível') : 'Bloqueado'}.${unlocked && total > 0 ? ` Progresso: ${percentage.toFixed(0)}%.` : ''}`}
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
                        🔒 Requer {world.requiredScore} ⚡ pts
                    </div>
                )}

                {isComplete && (
                    <div className="world-card__badge" title="Mundo 100% Concluído!">🏆</div>
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
                        📖 Nova Lição!
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
                            title="Ver Lição Explicativa"
                            aria-label="Ver Lição Explicativa"
                        >
                            <span aria-hidden="true">📖</span>
                        </button>
                    )}
                    <button
                        className="world-card__action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowFlashcards(world.id);
                        }}
                        title="Revisar com Flashcards"
                        aria-label="Revisar com Flashcards"
                    >
                        <span aria-hidden="true">📚</span>
                    </button>
                </div>
            )}
        </div>
    );
});
