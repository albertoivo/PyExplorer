import { memo } from 'react';
import type { World } from '../../types/question';
import { TutorialModal, FlashcardDeck } from '../education';
import { getTutorialByWorld } from '../../data/educationContent';
import { WORLDS, SAGAS } from '../../data/worlds';
import { StoryModal } from './StoryModal';
import { WorldCard } from './WorldCard';
import { SagaTabs } from './SagaTabs';
import { SagaBanner } from './SagaBanner';
import { useWorldMapState } from '../../hooks/game/useWorldMapState';
import './WorldMap.css';

interface WorldMapProps {
    onSelectWorld: (world: World) => void;
    worldProgress?: Map<World, { completed: number; total: number }>;
}

export const WorldMap = memo(function WorldMap({ onSelectWorld, worldProgress }: WorldMapProps) {
    const {
        effectiveScore,
        selectedSagaId,
        setSelectedSagaId,
        showTutorial,
        showFlashcards,
        selectedWorld,
        activeStory,
        isWorldUnlocked,
        getWorldStatus,
        sagaStats,
        displayedSagas,
        hasViewedTutorial,
        handleStoryComplete,
        handleWorldClick,
        handleTutorialComplete,
        handleTutorialClose,
        handleShowTutorial,
        handleShowFlashcards,
        setShowFlashcards
    } = useWorldMapState(onSelectWorld, worldProgress);

    return (
        <div className="world-map">
            {/* Header com estilo épico */}
            <div className="world-map__header">
                <h2 className="world-map__title">🗺️ A Jornada do Desenvolvedor</h2>
                <p className="world-map__subtitle">
                    Explore as 4 Sagas Épicas, resolva desafios e torne-se um Mestre em Python!
                </p>

                <div className="world-map__stats-bar">
                    <div className="world-map__score" title="Pontuação acumulada em todas as questões">
                        <span className="world-map__score-icon">⚡</span>
                        <span className="world-map__score-value">{effectiveScore} Pontos XP</span>
                    </div>
                </div>

                {/* Componente de Abas de Saga */}
                <SagaTabs
                    sagas={SAGAS}
                    selectedSagaId={selectedSagaId}
                    sagaStats={sagaStats}
                    onSelectSaga={setSelectedSagaId}
                />
            </div>

            {/* Conteúdo das Sagas */}
            <div className="world-map__sagas-container">
                {displayedSagas.map(saga => {
                    const sagaWorldObjs = WORLDS.filter(w => w.sagaId === saga.id);
                    const st = sagaStats.get(saga.id);

                    return (
                        <section
                            key={saga.id}
                            className="world-map__saga-section"
                        >
                            {/* Componente de Banner Épico da Saga */}
                            <SagaBanner
                                saga={saga}
                                completedQuestions={st?.completed || 0}
                                totalQuestions={st?.total || 0}
                                percentage={st?.percentage || 0}
                            />

                            {/* Grid de Mundos desta Saga */}
                            <div className="world-map__grid">
                                {sagaWorldObjs.map(world => {
                                    const indexInAll = WORLDS.findIndex(w => w.id === world.id);
                                    const unlocked = isWorldUnlocked(world);
                                    const status = getWorldStatus(world);
                                    const isComplete = status.percentage === 100;
                                    const hasTutorial = !!getTutorialByWorld(world.id);
                                    const viewedTutorial = hasViewedTutorial(world.id);

                                    return (
                                        <WorldCard
                                            key={world.id}
                                            world={world}
                                            index={indexInAll}
                                            unlocked={unlocked}
                                            completed={status.completed}
                                            total={status.total}
                                            percentage={status.percentage}
                                            isComplete={isComplete}
                                            hasTutorial={hasTutorial}
                                            viewedTutorial={viewedTutorial}
                                            sagaBadge={saga.badge}
                                            onClick={handleWorldClick}
                                            onShowTutorial={handleShowTutorial}
                                            onShowFlashcards={handleShowFlashcards}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Modais */}
            {showTutorial && (
                <TutorialModal
                    worldId={showTutorial}
                    isOpen={true}
                    onClose={handleTutorialClose}
                    onComplete={handleTutorialComplete}
                    forceWatch={selectedWorld !== null && !hasViewedTutorial(showTutorial)}
                />
            )}

            {showFlashcards && (
                <FlashcardDeck
                    worldId={showFlashcards}
                    onClose={() => setShowFlashcards(null)}
                />
            )}

            {activeStory && (
                <StoryModal
                    episode={activeStory}
                    onComplete={handleStoryComplete}
                />
            )}
        </div>
    );
});
