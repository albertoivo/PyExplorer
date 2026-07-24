import { useState, useCallback, useMemo, memo } from 'react';
import type { World } from '../../types/question';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import { TutorialModal, FlashcardDeck } from '../education';
import { getTutorialByWorld } from '../../data/educationContent';
import { WORLDS, SAGAS } from '../../data/worlds';
import type { WorldInfo } from '../../data/worlds';
import { StoryModal } from './StoryModal';
import { WorldCard } from './WorldCard';
import { SagaTabs } from './SagaTabs';
import { SagaBanner } from './SagaBanner';
import { STORY_CHAPTERS, type StoryEpisode } from '../../data/gamificationData';
import './WorldMap.css';

const VIEWED_TUTORIALS_KEY = 'pyexplorer_viewed_tutorials';
const VIEWED_STORIES_KEY = 'pyexplorer_viewed_stories';

interface WorldMapProps {
    onSelectWorld: (world: World) => void;
    worldProgress?: Map<World, { completed: number; total: number }>;
}

export const WorldMap = memo(function WorldMap({ onSelectWorld, worldProgress }: WorldMapProps) {
    const { userData } = useAuth();
    const { gamification } = useGamification();
    const userScore = userData?.totalScore || 0;
    const effectiveScore = Math.max(userScore, gamification?.level?.totalXP || 0);
    const unlockedWorlds = useMemo(() => userData?.unlockedWorlds || ['basic_commands'], [userData?.unlockedWorlds]);

    // Aba de Saga selecionada ('all' | 'saga_1' | 'saga_2' | 'saga_3' | 'saga_4')
    const [selectedSagaId, setSelectedSagaId] = useState<string>('all');

    // Estados para modais e tutoriais
    const [showTutorial, setShowTutorial] = useState<World | null>(null);
    const [showFlashcards, setShowFlashcards] = useState<World | null>(null);
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
    const [activeStory, setActiveStory] = useState<StoryEpisode | null>(null);
    const [pendingWorldNavigation, setPendingWorldNavigation] = useState<World | null>(null);

    const [viewedTutorials, setViewedTutorials] = useState<World[]>(() => {
        try {
            const viewed = localStorage.getItem(VIEWED_TUTORIALS_KEY);
            return viewed ? JSON.parse(viewed) : [];
        } catch {
            return [];
        }
    });

    const [viewedStories, setViewedStories] = useState<string[]>(() => {
        try {
            const viewed = localStorage.getItem(VIEWED_STORIES_KEY);
            return viewed ? JSON.parse(viewed) : [];
        } catch {
            return [];
        }
    });

    const isWorldUnlocked = useCallback((world: WorldInfo): boolean => {
        if (!world.requiredScore) return true;
        if (unlockedWorlds.includes(world.id)) return true;

        const progress = worldProgress?.get(world.id);
        if (progress && progress.completed > 0) return true;

        return effectiveScore >= world.requiredScore;
    }, [unlockedWorlds, effectiveScore, worldProgress]);

    const getWorldStatus = useCallback((world: WorldInfo) => {
        const progress = worldProgress?.get(world.id);
        if (!progress) return { completed: 0, total: 0, percentage: 0 };

        return {
            ...progress,
            percentage: progress.total > 0 ? (progress.completed / progress.total) * 100 : 0,
        };
    }, [worldProgress]);

    // Cálculo das estatísticas por Saga
    const sagaStats = useMemo(() => {
        const stats = new Map<string, { completed: number; total: number; percentage: number; unlockedCount: number }>();

        for (const saga of SAGAS) {
            let totalSagaQuestions = 0;
            let completedSagaQuestions = 0;
            let unlockedCount = 0;

            for (const worldId of saga.worldIds) {
                const worldObj = WORLDS.find(w => w.id === worldId);
                if (!worldObj) continue;

                if (isWorldUnlocked(worldObj)) {
                    unlockedCount++;
                }

                const status = worldProgress?.get(worldId);
                if (status) {
                    totalSagaQuestions += status.total;
                    completedSagaQuestions += status.completed;
                }
            }

            const percentage = totalSagaQuestions > 0 ? (completedSagaQuestions / totalSagaQuestions) * 100 : 0;
            stats.set(saga.id, {
                completed: completedSagaQuestions,
                total: totalSagaQuestions,
                percentage,
                unlockedCount,
            });
        }

        return stats;
    }, [worldProgress, isWorldUnlocked]);

    // Sagas filtradas para exibição
    const displayedSagas = useMemo(() => {
        if (selectedSagaId === 'all') return SAGAS;
        return SAGAS.filter(s => s.id === selectedSagaId);
    }, [selectedSagaId]);

    const hasViewedTutorial = useCallback((worldId: World): boolean => {
        return viewedTutorials.includes(worldId);
    }, [viewedTutorials]);

    const markTutorialViewed = useCallback((worldId: World) => {
        setViewedTutorials(prev => {
            if (prev.includes(worldId)) return prev;
            const newList = [...prev, worldId];
            try {
                localStorage.setItem(VIEWED_TUTORIALS_KEY, JSON.stringify(newList));
            } catch { /* ignore */ }
            return newList;
        });
    }, []);

    const hasViewedStory = useCallback((worldId: string, type: 'intro' | 'outro'): boolean => {
        return viewedStories.includes(`${worldId}_${type}`);
    }, [viewedStories]);

    const markStoryViewed = useCallback((worldId: string, type: 'intro' | 'outro') => {
        const key = `${worldId}_${type}`;
        setViewedStories(prev => {
            if (prev.includes(key)) return prev;
            const newList = [...prev, key];
            try {
                localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(newList));
            } catch { /* ignore */ }
            return newList;
        });
    }, []);

    const handleStoryComplete = useCallback(() => {
        if (!activeStory) return;

        markStoryViewed(activeStory.worldId, activeStory.type);
        setActiveStory(null);

        if (activeStory.type === 'intro' && pendingWorldNavigation) {
            const worldId = pendingWorldNavigation;
            setPendingWorldNavigation(null);

            const hasTutorial = getTutorialByWorld(worldId);
            const alreadyViewedTutorial = hasViewedTutorial(worldId);

            if (hasTutorial && !alreadyViewedTutorial) {
                setSelectedWorld(worldId);
                setShowTutorial(worldId);
            } else {
                onSelectWorld(worldId);
            }
        }
    }, [activeStory, markStoryViewed, pendingWorldNavigation, hasViewedTutorial, onSelectWorld]);

    const handleWorldClick = useCallback((world: WorldInfo) => {
        if (!isWorldUnlocked(world)) return;

        const introStory = STORY_CHAPTERS.find(s => s.worldId === world.id && s.type === 'intro');
        const viewedIntro = hasViewedStory(world.id, 'intro');

        if (introStory && !viewedIntro) {
            setPendingWorldNavigation(world.id);
            setActiveStory(introStory);
            return;
        }

        const hasTutorial = getTutorialByWorld(world.id);
        const alreadyViewed = hasViewedTutorial(world.id);

        if (hasTutorial && !alreadyViewed) {
            setSelectedWorld(world.id);
            setShowTutorial(world.id);
        } else {
            onSelectWorld(world.id);
        }
    }, [hasViewedTutorial, onSelectWorld, isWorldUnlocked, hasViewedStory]);

    const handleTutorialComplete = useCallback(() => {
        if (showTutorial) {
            markTutorialViewed(showTutorial);
        }
        if (selectedWorld) {
            onSelectWorld(selectedWorld);
        }
        setShowTutorial(null);
        setSelectedWorld(null);
    }, [showTutorial, selectedWorld, markTutorialViewed, onSelectWorld]);

    const handleTutorialClose = useCallback(() => {
        if (showTutorial) {
            markTutorialViewed(showTutorial);
        }
        setShowTutorial(null);
        setSelectedWorld(null);
    }, [showTutorial, markTutorialViewed]);

    const handleShowTutorial = useCallback((worldId: World) => {
        setShowTutorial(worldId);
    }, []);

    const handleShowFlashcards = useCallback((worldId: World) => {
        setShowFlashcards(worldId);
    }, []);

    /* eslint-disable react-hooks/exhaustive-deps */
    useMemo(() => {
        if (!worldProgress) return;

        for (const world of WORLDS) {
            const status = worldProgress.get(world.id);
            if (status && status.completed === status.total && status.total > 0) {
                const outroStory = STORY_CHAPTERS.find(s => s.worldId === world.id && s.type === 'outro');
                if (outroStory && !hasViewedStory(world.id, 'outro')) {
                    if (!showTutorial && !activeStory) {
                        setActiveStory(outroStory);
                        break;
                    }
                }
            }
        }
    }, [worldProgress, hasViewedStory]);
    /* eslint-enable react-hooks/exhaustive-deps */

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
