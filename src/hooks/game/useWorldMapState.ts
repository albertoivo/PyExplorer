import { useState, useCallback, useMemo, useEffect } from 'react';
import type { World } from '../../types/question';
import { useLocalStorage } from '../useLocalStorage';
import { getTutorialByWorld } from '../../data/educationContent';
import { WORLDS, SAGAS } from '../../data/worlds';
import type { WorldInfo } from '../../data/worlds';
import { STORY_CHAPTERS, type StoryEpisode } from '../../data/gamificationData';
import { calculateSagaStats } from '../../utils/game/sagaLogic';

const VIEWED_TUTORIALS_KEY = 'pyexplorer_viewed_tutorials';
const VIEWED_STORIES_KEY = 'pyexplorer_viewed_stories';

interface UseWorldMapStateProps {
    onSelectWorld: (world: World) => void;
    worldProgress?: Map<World, { completed: number; total: number }>;
    effectiveScore: number;
    unlockedWorlds: string[];
}

export function useWorldMapState({ onSelectWorld, worldProgress, effectiveScore, unlockedWorlds }: UseWorldMapStateProps) {
    const [selectedSagaId, setSelectedSagaId] = useState<string>('all');
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

    const sagaStats = useMemo(() => {
        return calculateSagaStats(SAGAS, WORLDS, worldProgress, isWorldUnlocked);
    }, [worldProgress, isWorldUnlocked]);

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

    useEffect(() => {
        if (!worldProgress) return;

        let storyToActivate: StoryEpisode | null = null;
        for (const world of WORLDS) {
            const status = worldProgress.get(world.id);
            if (status && status.completed === status.total && status.total > 0) {
                const outroStory = STORY_CHAPTERS.find(s => s.worldId === world.id && s.type === 'outro');
                if (outroStory && !hasViewedStory(world.id, 'outro')) {
                    if (!showTutorial && !activeStory) {
                        storyToActivate = outroStory;
                        break;
                    }
                }
            }
        }

        if (storyToActivate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveStory(storyToActivate);
        }
    }, [worldProgress, hasViewedStory, showTutorial, activeStory]);

    return {
        selectedSagaId, setSelectedSagaId,
        showTutorial, setShowTutorial,
        showFlashcards, setShowFlashcards,
        selectedWorld, setSelectedWorld,
        activeStory, setActiveStory,
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
        handleShowFlashcards
    };
}
