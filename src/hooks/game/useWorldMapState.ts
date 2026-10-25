import { useState, useCallback, useMemo, useEffect } from 'react';
import type { World } from '../../types/question';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import { getTutorialByWorld } from '../../data/educationContent';
import { WORLDS, SAGAS } from '../../data/worlds';
import type { WorldInfo } from '../../data/worlds';
import { STORY_CHAPTERS, type StoryEpisode } from '../../data/gamificationData';
import { calculateSagaStats } from '../../utils/game/sagaLogic';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const VIEWED_TUTORIALS_KEY = 'pyexplorer_viewed_tutorials';
const VIEWED_STORIES_KEY = 'pyexplorer_viewed_stories';

export function useWorldMapState(
    onSelectWorld: (world: World) => void,
    worldProgress?: Map<World, { completed: number; total: number }>
) {
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

    const [viewedTutorials, setViewedTutorials] = useLocalStorage<World[]>(VIEWED_TUTORIALS_KEY, []);
    const [viewedStories, setViewedStories] = useLocalStorage<string[]>(VIEWED_STORIES_KEY, []);

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
        return calculateSagaStats(SAGAS, WORLDS, worldProgress, isWorldUnlocked);
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
            return [...prev, worldId];
        });
    }, [setViewedTutorials]);

    const hasViewedStory = useCallback((worldId: string, type: 'intro' | 'outro'): boolean => {
        return viewedStories.includes(`${worldId}_${type}`);
    }, [viewedStories]);

    const markStoryViewed = useCallback((worldId: string, type: 'intro' | 'outro') => {
        const key = `${worldId}_${type}`;
        setViewedStories(prev => {
            if (prev.includes(key)) return prev;
            return [...prev, key];
        });
    }, [setViewedStories]);

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

    // Exibe a história de encerramento quando o mundo é completado 100%
    useEffect(() => {
        if (!worldProgress) return;

        let pendingOutroStory: StoryEpisode | undefined;

        for (const world of WORLDS) {
            const status = worldProgress.get(world.id);
            if (status && status.completed === status.total && status.total > 0) {
                const outroStory = STORY_CHAPTERS.find(s => s.worldId === world.id && s.type === 'outro');
                if (outroStory && !hasViewedStory(world.id, 'outro')) {
                    if (!showTutorial && !activeStory) {
                        pendingOutroStory = outroStory;
                        break;
                    }
                }
            }
        }

        if (pendingOutroStory) {
            setTimeout(() => {
                setActiveStory(pendingOutroStory!);
            }, 0);
        }
    }, [worldProgress, hasViewedStory, showTutorial, activeStory]);

    return {
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
    };
}
