import { useState, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { World } from '../../types/question';
import { useAuth } from '../../hooks/useAuth';
import { TutorialModal, FlashcardDeck } from '../education';
import { getTutorialByWorld } from '../../data/educationContent';
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
];

// Chave para guardar tutoriais vistos
const VIEWED_TUTORIALS_KEY = 'pyexplorer_viewed_tutorials';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const unlockedWorlds = useMemo(() => userData?.unlockedWorlds || ['basic_commands'], [userData?.unlockedWorlds]);

    // Estado para tutorial e flashcards
    const [showTutorial, setShowTutorial] = useState<World | null>(null);
    const [showFlashcards, setShowFlashcards] = useState<World | null>(null);
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

    const isWorldUnlocked = useCallback((world: WorldInfo): boolean => {
        // O primeiro mundo está sempre desbloqueado
        if (!world.requiredScore) return true;

        // Verifica se está na lista de mundos desbloqueados
        if (unlockedWorlds.includes(world.id)) return true;

        // Verifica se tem pontuação suficiente
        return userScore >= world.requiredScore;
    }, [unlockedWorlds, userScore]);

    const getWorldStatus = (world: WorldInfo) => {
        const progress = worldProgress?.get(world.id);
        if (!progress) return { completed: 0, total: 0, percentage: 0 };

        return {
            ...progress,
            percentage: progress.total > 0 ? (progress.completed / progress.total) * 100 : 0,
        };
    };

    // Verifica se já viu o tutorial desse mundo
    const hasViewedTutorial = useCallback((worldId: World): boolean => {
        try {
            const viewed = localStorage.getItem(VIEWED_TUTORIALS_KEY);
            if (viewed) {
                const list: World[] = JSON.parse(viewed);
                return list.includes(worldId);
            }
        } catch {
            // Ignora erros
        }
        return false;
    }, []);

    // Marca tutorial como visto
    const markTutorialViewed = useCallback((worldId: World) => {
        try {
            const viewed = localStorage.getItem(VIEWED_TUTORIALS_KEY);
            const list: World[] = viewed ? JSON.parse(viewed) : [];
            if (!list.includes(worldId)) {
                list.push(worldId);
                localStorage.setItem(VIEWED_TUTORIALS_KEY, JSON.stringify(list));
            }
        } catch {
            // Ignora erros
        }
    }, []);

    // Handler quando clica em um mundo
    const handleWorldClick = useCallback((world: WorldInfo) => {
        if (!isWorldUnlocked(world)) return;

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
    }, [hasViewedTutorial, onSelectWorld, isWorldUnlocked]);

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
                    const hasTutorial = getTutorialByWorld(world.id);
                    const viewedTutorial = hasViewedTutorial(world.id);

                    return (
                        <div key={world.id} className="world-card-wrapper">
                            <button
                                className={`world-card ${unlocked ? 'world-card--unlocked' : 'world-card--locked'} ${isComplete ? 'world-card--complete' : ''}`}
                                style={{ '--world-color': world.color } as CSSProperties}
                                onClick={() => handleWorldClick(world)}
                                disabled={!unlocked}
                            >
                                <div className="world-card__number">{index + 1}</div>

                                <div className="world-card__icon">
                                    {unlocked ? world.icon : '🔒'}
                                </div>

                                <h3 className="world-card__name">{world.name}</h3>
                                <p className="world-card__description">{world.description}</p>

                                {unlocked && status.total > 0 && (
                                    <div className="world-card__progress">
                                        <div className="world-card__progress-bar">
                                            <div
                                                className="world-card__progress-fill"
                                                style={{ width: `${status.percentage}%` }}
                                            />
                                        </div>
                                        <span className="world-card__progress-text">
                                            {status.completed}/{status.total}
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
                                                setShowTutorial(world.id);
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
                                            setShowFlashcards(world.id);
                                        }}
                                        title="Flashcards"
                                    >
                                        📚
                                    </button>
                                </div>
                            )}
                        </div>
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
        </div>
    );
}

export default WorldMap;
