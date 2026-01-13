import { useState, useCallback, useMemo } from 'react';
import type { World } from '../../types/question';
import { useAuth } from '../../hooks/useAuth';
import { TutorialModal, FlashcardDeck } from '../education';
import { getTutorialByWorld } from '../../data/educationContent';
import { StoryModal } from './StoryModal';
import { WorldCard } from './WorldCard';
import { STORY_CHAPTERS, type StoryEpisode } from '../../data/gamificationData';
import './WorldMap.css';

interface WorldInfo {
    id: World;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredScore?: number;
}

// Definição dos mundos do jogo
// Ordem pedagógica correta: básico → variáveis → números → decisões → repetições → funções → listas → strings
const WORLDS: WorldInfo[] = [
    {
        id: 'basic_commands',
        name: 'Primeiros Passos',
        description: 'Aprenda a dar os primeiros comandos em Python!',
        icon: '🚀',
        color: '#00d9ff',
    },
    {
        id: 'variables',
        name: 'Mundo das Variáveis',
        description: 'Guarde informações em caixinhas mágicas!',
        icon: '📦',
        color: '#667eea',
        requiredScore: 30,
    },
    {
        id: 'numbers',
        name: 'Números Mágicos',
        description: 'Faça cálculos incríveis como um mago da matemática!',
        icon: '🔢',
        color: '#9f7aea',
        requiredScore: 60,
    },
    {
        id: 'conditions',
        name: 'Terra das Decisões',
        description: 'Faça escolhas e crie caminhos diferentes!',
        icon: '🔀',
        color: '#f093fb',
        requiredScore: 100,
    },
    {
        id: 'loops',
        name: 'Ilha da Repetição',
        description: 'Repita comandos como um feiticeiro!',
        icon: '🔄',
        color: '#48bb78',
        requiredScore: 150,
    },
    {
        id: 'functions',
        name: 'Vale das Funções',
        description: 'Crie suas próprias magias reutilizáveis!',
        icon: '✨',
        color: '#ed8936',
        requiredScore: 200,
    },
    {
        id: 'lists',
        name: 'Floresta das Listas',
        description: 'Organize muitas coisas numa única lista!',
        icon: '📜',
        color: '#fc8181',
        requiredScore: 260,
    },
    {
        id: 'strings',
        name: 'Reino das Palavras',
        description: 'Manipule textos e crie histórias!',
        icon: '📝',
        color: '#fbd38d',
        requiredScore: 320,
    },
    {
        id: 'user_input',
        name: 'Templo do Oráculo',
        description: 'Aprenda a conversar com o usuário!',
        icon: '🔮',
        color: '#d69e2e',
        requiredScore: 380,
    },
    {
        id: 'dictionaries',
        name: 'Biblioteca Secreta',
        description: 'Guarde segredos em dicionários!',
        icon: '📚',
        color: '#9b2c2c',
        requiredScore: 440,
    },
    {
        id: 'error_handling',
        name: 'Fortaleza dos Bugs',
        description: 'Proteja seu código contra erros!',
        icon: '🛡️',
        color: '#4a5568',
        requiredScore: 500,
    },
];

// Chave para guardar tutoriais vistos
const VIEWED_TUTORIALS_KEY = 'pyexplorer_viewed_tutorials';
const VIEWED_STORIES_KEY = 'pyexplorer_viewed_stories';

interface WorldMapProps {
    onSelectWorld: (world: World) => void;
    worldProgress?: Map<World, { completed: number; total: number }>;
}

/**
 * Mapa de mundos do jogo
 */
export function WorldMap({ onSelectWorld, worldProgress }: WorldMapProps) {
    const { userData } = useAuth();
    const userScore = userData?.totalScore || 0;
    const unlockedWorlds = useMemo(() => userData?.unlockedWorlds || ['basic_commands'], [userData?.unlockedWorlds]);

    // Estado para tutorial, flashcards e história
    const [showTutorial, setShowTutorial] = useState<World | null>(null);
    const [showFlashcards, setShowFlashcards] = useState<World | null>(null);
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
    const [activeStory, setActiveStory] = useState<StoryEpisode | null>(null);
    const [pendingWorldNavigation, setPendingWorldNavigation] = useState<World | null>(null);

    // Estado local para dados do localStorage (evita leituras síncronas no render)
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
        // O primeiro mundo está sempre desbloqueado
        if (!world.requiredScore) return true;

        // Verifica se está na lista de mundos desbloqueados
        if (unlockedWorlds.includes(world.id)) return true;

        // Verifica se tem pontuação suficiente
        return userScore >= world.requiredScore;
    }, [unlockedWorlds, userScore]);

    const getWorldStatus = useCallback((world: WorldInfo) => {
        const progress = worldProgress?.get(world.id);
        if (!progress) return { completed: 0, total: 0, percentage: 0 };

        return {
            ...progress,
            percentage: progress.total > 0 ? (progress.completed / progress.total) * 100 : 0,
        };
    }, [worldProgress]);

    // Verifica se já viu o tutorial desse mundo
    const hasViewedTutorial = useCallback((worldId: World): boolean => {
        return viewedTutorials.includes(worldId);
    }, [viewedTutorials]);

    // Marca tutorial como visto
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

    // Check if story is viewed
    const hasViewedStory = useCallback((worldId: string, type: 'intro' | 'outro'): boolean => {
        return viewedStories.includes(`${worldId}_${type}`);
    }, [viewedStories]);

    // Mark story as viewed
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

    // Handler when completing a story
    const handleStoryComplete = useCallback(() => {
        if (!activeStory) return;

        markStoryViewed(activeStory.worldId, activeStory.type);
        setActiveStory(null);

        // Se era intro, navega para o mundo
        if (activeStory.type === 'intro' && pendingWorldNavigation) {
            const worldId = pendingWorldNavigation;
            setPendingWorldNavigation(null);

            // Verifica tutorial
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

    // Handler quando clica em um mundo
    const handleWorldClick = useCallback((world: WorldInfo) => {
        if (!isWorldUnlocked(world)) return;

        // Check for Intro Story first
        const introStory = STORY_CHAPTERS.find(s => s.worldId === world.id && s.type === 'intro');
        const viewedIntro = hasViewedStory(world.id, 'intro');

        if (introStory && !viewedIntro) {
            setPendingWorldNavigation(world.id);
            setActiveStory(introStory);
            return;
        }

        const hasTutorial = getTutorialByWorld(world.id);
        const alreadyViewed = hasViewedTutorial(world.id);

        // Se tem tutorial e não viu ainda, mostra o tutorial
        if (hasTutorial && !alreadyViewed) {
            setSelectedWorld(world.id);
            setShowTutorial(world.id);
        } else {
            // Vai direto para o mundo
            onSelectWorld(world.id);
        }
    }, [hasViewedTutorial, onSelectWorld, isWorldUnlocked, hasViewedStory]);

    // Quando completa o tutorial
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

    // Fecha tutorial sem ir ao mundo
    const handleTutorialClose = useCallback(() => {
        if (showTutorial) {
            markTutorialViewed(showTutorial);
        }
        setShowTutorial(null);
        setSelectedWorld(null);
    }, [showTutorial, markTutorialViewed]);

    // Handlers for card actions
    const handleShowTutorial = useCallback((worldId: World) => {
        setShowTutorial(worldId);
    }, []);

    const handleShowFlashcards = useCallback((worldId: World) => {
        setShowFlashcards(worldId);
    }, []);

    /*
     * Note: Outro story logic would ideally be checked when returning to the map 
     * after completing a world. For now, we'll check on map mount if a world is complete
     * but outro not seen.
     */
    /* eslint-disable react-hooks/exhaustive-deps */
    useMemo(() => {
        if (!worldProgress) return;

        for (const world of WORLDS) {
            const status = worldProgress.get(world.id);
            if (status && status.completed === status.total && status.total > 0) {
                // World complete, check outro
                const outroStory = STORY_CHAPTERS.find(s => s.worldId === world.id && s.type === 'outro');
                if (outroStory && !hasViewedStory(world.id, 'outro')) {
                    // Only show if no other modal is active
                    if (!showTutorial && !activeStory) {
                        setActiveStory(outroStory);
                        break; // Show one at a time
                    }
                }
            }
        }
    }, [worldProgress, hasViewedStory]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return (
        <div className="world-map">
            <div className="world-map__header">
                <h2 className="world-map__title">🗺️ Mapa de Mundos</h2>
                <p className="world-map__subtitle">
                    Escolha um mundo para explorar e aprender Python!
                </p>
                <div className="world-map__score">
                    <span className="world-map__score-icon">⭐</span>
                    <span className="world-map__score-value">{userScore} pontos</span>
                </div>
            </div>

            <div className="world-map__grid">
                {WORLDS.map((world, index) => {
                    const unlocked = isWorldUnlocked(world);
                    const status = getWorldStatus(world);
                    const isComplete = status.percentage === 100;
                    const hasTutorial = !!getTutorialByWorld(world.id);
                    const viewedTutorial = hasViewedTutorial(world.id);

                    return (
                        <WorldCard
                            key={world.id}
                            world={world}
                            index={index}
                            unlocked={unlocked}
                            completed={status.completed}
                            total={status.total}
                            percentage={status.percentage}
                            isComplete={isComplete}
                            hasTutorial={hasTutorial}
                            viewedTutorial={viewedTutorial}
                            onClick={handleWorldClick}
                            onShowTutorial={handleShowTutorial}
                            onShowFlashcards={handleShowFlashcards}
                        />
                    );
                })}
            </div>

            {/* Caminho conectando os mundos */}
            <div className="world-map__path">
                {WORLDS.slice(0, -1).map((_, index) => (
                    <div
                        key={index}
                        className={`world-map__path-segment ${isWorldUnlocked(WORLDS[index + 1]) ? 'world-map__path-segment--active' : ''
                            }`}
                    />
                ))}
            </div>

            {/* Tutorial Modal */}
            {showTutorial && (
                <TutorialModal
                    worldId={showTutorial}
                    isOpen={true}
                    onClose={handleTutorialClose}
                    onComplete={handleTutorialComplete}
                    forceWatch={selectedWorld !== null && !hasViewedTutorial(showTutorial)}
                />
            )}

            {/* Flashcards Modal */}
            {showFlashcards && (
                <FlashcardDeck
                    worldId={showFlashcards}
                    onClose={() => setShowFlashcards(null)}
                />
            )}

            {/* Story Modal */}
            {activeStory && (
                <StoryModal
                    episode={activeStory}
                    onComplete={handleStoryComplete}
                />
            )}
        </div>
    );
}

export default WorldMap;
