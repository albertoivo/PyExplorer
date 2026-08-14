import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { World, QuestionDocument, UserProgress } from '../types/question';
import type { PowerUpType } from '../types/gamification';
import { WorldMap } from '../components/game/WorldMap';
import { QuestionEngine } from '../components/game/QuestionEngine';
import { PowerUpBarCompact } from '../components/gamification';
import { CompletedQuestionModal } from '../components/game/CompletedQuestionModal';
import { PyodideLoader } from '../components/game/PyodideLoader';
import { WorldQuestionsView } from '../components/game/WorldQuestionsView';
import { MissionNotificationOverlay } from '../components/game/MissionNotificationOverlay';
import { useProgress } from '../hooks/useProgress';
import { usePyodide } from '../hooks/usePyodide';
import { useQuestionsFirestore } from '../hooks/useQuestionsFirestore';
import { useGamification } from '../context/GamificationContext';
import { isBossUnlocked } from '../utils/gameLogic';
import { playSound } from '../utils/soundEffects';
import { SEO } from '../components/common/SEO';
import { PetHabitat } from '../components/gamification/PetHabitat/PetHabitat';
import { EvolutionModal } from '../components/gamification/PetHabitat/EvolutionModal';
import { WORLDS } from '../data/worlds';
import { useTranslation } from 'react-i18next';
import './GamePage.css';

type GameView = 'world-map' | 'world-questions' | 'playing' | 'reviewing';

type ConfettiFn = (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { y: number };
    colors?: string[];
}) => void;

/**
 * Obtém o nome amigável do mundo
 */
const getWorldName = (world: World): string => {
    const worldObj = WORLDS.find(w => w.id === world);
    return worldObj ? worldObj.name : world;
};

/**
 * Página principal do jogo
 */
export function GamePage() {
    const { t } = useTranslation('game');
    const navigate = useNavigate();
    const [view, setView] = useState<GameView>('world-map');
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionDocument | null>(null);
    const [worldQuestions, setWorldQuestions] = useState<QuestionDocument[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Modal para questões já completadas
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [completedQuestionProgress, setCompletedQuestionProgress] = useState<UserProgress | null>(null);

    const { allProgress, recordAttempt, getQuestionProgress } = useProgress();
    const { loading: pyodideLoading, loadingProgress, loadPyodide, ready } = usePyodide();
    const { questions: allQuestions, loading: questionsLoading, getQuestionsByWorld } = useQuestionsFirestore();
    const { recordQuestionCompleted, checkWorldAchievements, userPowerUps, usePowerUp: consumePowerUp, buyPowerUp, userStars, missionNotification, dismissMissionNotification } = useGamification();

    const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

    // Otimização: Manter referência estável para getQuestionProgress
    const getQuestionProgressRef = useRef(getQuestionProgress);
    useEffect(() => {
        getQuestionProgressRef.current = getQuestionProgress;
    }, [getQuestionProgress]);

    // Rola para o topo sempre que mudar a visualização ou a questão ativa no jogo
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view, currentQuestion]);

    // Mission Notification Timer
    useEffect(() => {
        if (missionNotification) {
            const timer = setTimeout(() => {
                dismissMissionNotification();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [missionNotification, dismissMissionNotification]);

    // Timer para medir tempo de resposta
    const questionStartTime = useRef<number>(0);

    // Memoriza as questões ordenadas para evitar re-sort e mutação do state a cada render
    const sortedQuestions = useMemo(() => {
        return [...worldQuestions].sort((a, b) => {
            if (a.type === 'boss_battle' && b.type !== 'boss_battle') return 1;
            if (a.type !== 'boss_battle' && b.type === 'boss_battle') return -1;
            return 0;
        });
    }, [worldQuestions]);

    useEffect(() => {
        if (!ready && !pyodideLoading) {
            loadPyodide();
        }
    }, [ready, pyodideLoading, loadPyodide]);

    // Agrupa questões por mundo para calcular progresso
    const worldProgress = useMemo(() => {
        const progress = new Map<World, { completed: number; total: number }>();

        const completedQuestionIds = new Set(
            allProgress
                .filter(p => p.status === 'completed')
                .map(p => p.questionId)
        );

        for (const q of allQuestions) {
            if (!progress.has(q.world)) {
                progress.set(q.world, { completed: 0, total: 0 });
            }

            const worldStats = progress.get(q.world)!;
            worldStats.total++;

            if (completedQuestionIds.has(q.id)) {
                worldStats.completed++;
            }
        }

        return progress;
    }, [allProgress, allQuestions]);

    // Otimização: Calcula se o boss deve ser desbloqueado
    const bossBattleUnlocked = useMemo(() => {
        return isBossUnlocked(worldQuestions, getQuestionProgress);
    }, [worldQuestions, getQuestionProgress]);

    /**
     * Seleciona um mundo para ver suas questões
     */
    const handleSelectWorld = useCallback((world: World) => {
        const questions = getQuestionsByWorld(world);
        setSelectedWorld(world);
        setWorldQuestions(questions);
        setView('world-questions');
    }, [getQuestionsByWorld]);

    /**
     * Começa a jogar uma questão
     */
    const handleStartQuestion = useCallback((question: QuestionDocument) => {
        const progress = getQuestionProgressRef.current(question.id);
        const index = worldQuestions.findIndex(q => q.id === question.id);

        setCurrentQuestion(question);
        setCurrentQuestionIndex(index);

        if (progress?.status === 'completed') {
            setCompletedQuestionProgress(progress);
            setShowCompletedModal(true);
        } else {
            setView('playing');
            questionStartTime.current = Date.now();
        }
    }, [worldQuestions]);

    /**
     * Usuário escolheu "Ver minha resposta" no modal
     */
    const handleViewAnswer = useCallback(() => {
        setShowCompletedModal(false);
        setView('reviewing');
    }, []);

    /**
     * Usuário escolheu "Refazer" no modal
     */
    const handleRedoQuestion = useCallback(() => {
        setShowCompletedModal(false);
        setView('playing');
        questionStartTime.current = Date.now();
    }, []);

    /**
     * Fecha o modal de questão completada
     */
    const handleCloseCompletedModal = useCallback(() => {
        setShowCompletedModal(false);
        setCurrentQuestion(null);
        setCompletedQuestionProgress(null);
    }, []);

    /**
     * Callback quando uma questão é completada
     */
    const handleQuestionComplete = useCallback(async (passed: boolean, score: number) => {
        const responseTimeSeconds = (Date.now() - questionStartTime.current) / 1000;

        if (currentQuestion) {
            let finalScore = score;
            if (passed && activePowerUp === 'double_stars') {
                finalScore *= 2;
            }

            const previousProgress = getQuestionProgress(currentQuestion.id);
            const wasCompleted = previousProgress?.status === 'completed';
            const existingScore = previousProgress?.score || 0;
            const starsEarned = (passed && !wasCompleted && finalScore > existingScore)
                ? finalScore - existingScore
                : 0;

            await recordAttempt(
                currentQuestion.id,
                passed,
                finalScore,
                undefined,
                currentQuestion.difficulty,
                responseTimeSeconds
            );

            recordQuestionCompleted(passed, finalScore, responseTimeSeconds, {
                worldId: currentQuestion.world,
                starsEarned,
                isBoss: currentQuestion.type === 'boss_battle',
                previousStars: previousProgress?.stars || 0,
                wasCompleted
            });

            if (activePowerUp) {
                setActivePowerUp(null);
            }
        }
    }, [currentQuestion, getQuestionProgress, recordAttempt, recordQuestionCompleted, activePowerUp]);

    /**
     * Vai para a próxima questão não resolvida ou volta para a lista
     */
    const handleNext = useCallback(() => {
        let nextIndex = currentQuestionIndex + 1;
        let foundUnresolved = false;

        while (nextIndex < worldQuestions.length) {
            const nextQ = worldQuestions[nextIndex];
            const progress = getQuestionProgress(nextQ.id);
            if (progress?.status !== 'completed') {
                foundUnresolved = true;
                break;
            }
            nextIndex++;
        }

        if (foundUnresolved) {
            setCurrentQuestion(worldQuestions[nextIndex]);
            setCurrentQuestionIndex(nextIndex);
            questionStartTime.current = Date.now();
        } else {
            if (selectedWorld) {
                const progress = worldProgress.get(selectedWorld);
                if (progress && progress.completed === progress.total) {
                    // Toca som de celebração usando o utilitário soundEffects
                    playSound('celebration');

                    import('canvas-confetti').then((confettiModule) => {
                        const confetti = (
                            'default' in confettiModule
                                ? confettiModule.default
                                : confettiModule
                        ) as ConfettiFn;
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#FFD700', '#FF4500', '#00BFFF', '#32CD32']
                        });
                    });

                    const totalWorldsCompleted = Array.from(worldProgress.values())
                        .filter(p => p.completed === p.total && p.total > 0).length;

                    const mistakes = worldQuestions.reduce((acc, q) => {
                        const qProgress = getQuestionProgress(q.id);
                        const attemptCount = qProgress?.attempts || 0;
                        return acc + Math.max(0, attemptCount - 1);
                    }, 0);

                    checkWorldAchievements(
                        selectedWorld,
                        progress.completed,
                        progress.total,
                        mistakes
                    );

                    const totalWorlds = worldProgress.size;
                    if (totalWorldsCompleted === totalWorlds) {
                        setTimeout(() => {
                            const goCert = window.confirm(t('confirmCert', 'PARABÉNS! VOCÊ ZERO O JOGO! 🏆🐍\n\nTodas as questões foram completadas.\n\nDeseja ir para a página do seu CERTIFICADO agora?'));
                            if (goCert) {
                                navigate('/certificate');
                                return;
                            }
                        }, 1000);
                    }
                }
            }

            setView('world-questions');
            setCurrentQuestion(null);
        }
    }, [
        currentQuestionIndex,
        worldQuestions,
        getQuestionProgress,
        selectedWorld,
        worldProgress,
        checkWorldAchievements,
        navigate
    ]);

    /**
     * Volta para a lista de questões do mundo
     */
    const handleBackToQuestions = useCallback(() => {
        setView('world-questions');
        setCurrentQuestion(null);
    }, []);

    /**
     * Volta para o mapa de mundos
     */
    const handleBackToMap = useCallback(() => {
        setView('world-map');
        setSelectedWorld(null);
        setWorldQuestions([]);
    }, []);

    /**
     * Usa um power-up
     */
    const handleUsePowerUp = useCallback((type: PowerUpType): boolean => {
        if (type === 'skip') {
            if (consumePowerUp('skip')) {
                handleNext();
                return true;
            }
            return false;
        }

        if (activePowerUp !== null) return false;

        if (consumePowerUp(type)) {
            setActivePowerUp(type);
            return true;
        }
        return false;
    }, [activePowerUp, handleNext, consumePowerUp]);

    // Mostra loading do Pyodide ou questões
    if (!ready || questionsLoading) {
        return <PyodideLoader loadingProgress={loadingProgress} />;
    }

    return (
        <div className="game-page">
            <SEO title={t('seoTitle', 'Aventura')} description={t('seoDescription')} noindex />

            <EvolutionModal />

            {/* Mapa de Mundos */}
            {view === 'world-map' && (
                <>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <PetHabitat />
                    </div>
                    <WorldMap
                        onSelectWorld={handleSelectWorld}
                        worldProgress={worldProgress}
                    />
                </>
            )}

            {/* Lista de Questões do Mundo */}
            {view === 'world-questions' && selectedWorld && (
                <WorldQuestionsView
                    selectedWorld={selectedWorld}
                    worldName={getWorldName(selectedWorld)}
                    sortedQuestions={sortedQuestions}
                    completedCount={worldProgress.get(selectedWorld)?.completed || 0}
                    totalCount={worldProgress.get(selectedWorld)?.total || 0}
                    bossBattleUnlocked={bossBattleUnlocked}
                    getQuestionProgress={getQuestionProgress}
                    onBackToMap={handleBackToMap}
                    onStartQuestion={handleStartQuestion}
                />
            )}

            {/* Jogando uma Questão */}
            {view === 'playing' && currentQuestion && (
                <div className="question-play">
                    <div className="question-play__header">
                        <button className="back-button" onClick={handleBackToQuestions}>
                            ← {t('backToQuestions', 'Voltar às Questões')}
                        </button>
                        <div className="question-play__progress">
                            {t('questionProgress', { defaultValue: 'Questão {{current}} de {{total}}',  current: currentQuestionIndex + 1, total: worldQuestions.length })}
                        </div>
                    </div>

                    <div className="question-play__powerups">
                        <PowerUpBarCompact
                            userPowerUps={userPowerUps}
                            onUsePowerUp={handleUsePowerUp}
                            activePowerUp={activePowerUp}
                            userStars={userStars}
                            onBuyPowerUp={buyPowerUp}
                        />
                    </div>

                    <QuestionEngine
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onComplete={handleQuestionComplete}
                        onNext={handleNext}
                        activePowerUp={activePowerUp || undefined}
                    />
                </div>
            )}

            {/* Revisando uma Questão */}
            {view === 'reviewing' && currentQuestion && completedQuestionProgress && (
                <div className="question-play question-play--reviewing">
                    <div className="question-play__header">
                        <button className="back-button" onClick={handleBackToQuestions}>
                            ← {t('backToQuestions', 'Voltar às Questões')}
                        </button>
                        <div className="question-play__review-badge">
                            📖 {t('reviewBadge', 'Visualização')}
                        </div>
                    </div>

                    <QuestionEngine
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onComplete={handleQuestionComplete}
                        onNext={handleBackToQuestions}
                        readOnly={true}
                        savedAnswer={completedQuestionProgress.userAnswer}
                    />

                    <div className="question-play__review-footer">
                        <button
                            className="question-play__redo-btn"
                            onClick={handleRedoQuestion}
                        >
                            🔄 {t('redoForPractice', 'Refazer para Praticar')}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de questão já completada */}
            {showCompletedModal && currentQuestion && completedQuestionProgress && (
                <CompletedQuestionModal
                    question={currentQuestion}
                    progress={completedQuestionProgress}
                    onViewAnswer={handleViewAnswer}
                    onRedo={handleRedoQuestion}
                    onClose={handleCloseCompletedModal}
                />
            )}

            {/* Mission Notification Overlay */}
            <MissionNotificationOverlay notification={missionNotification} />
        </div>
    );
}
