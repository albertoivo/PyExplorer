import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import type { World, QuestionDocument, UserProgress } from '../types/question';
import { WorldMap } from '../components/game/WorldMap';
import { QuestionEngine } from '../components/game/QuestionEngine';
import { QuestionCard } from '../components/game/QuestionCard';
import { CompletedQuestionModal } from '../components/game/CompletedQuestionModal';
import { useProgress } from '../hooks/useProgress';
import { usePyodide } from '../hooks/usePyodide';
import { useQuestionsFirestore } from '../hooks/useQuestionsFirestore';
import { useGamification } from '../context/GamificationContext';
import { SEO } from '../components/common/SEO';
import './GamePage.css';

type GameView = 'world-map' | 'world-questions' | 'playing' | 'reviewing';

/**
 * Obtém o nome amigável do mundo
 */
const getWorldName = (world: World): string => {
    const names: Record<World, string> = {
        basic_commands: 'Primeiros Passos',
        numbers: 'Números Mágicos',
        variables: 'Mundo das Variáveis',
        conditions: 'Terra das Decisões',
        decisions: 'Terra das Decisões',
        loops: 'Ilha da Repetição',
        functions: 'Vale das Funções',
        lists: 'Floresta das Listas',
        strings: 'Reino das Palavras',
        user_input: 'Conversando com o Usuário',
        dictionaries: 'Agenda Mágica',
        error_handling: 'Caçando Bugs',
    };
    return names[world] || world;
};

/**
 * Página principal do jogo
 */
export function GamePage() {
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
    const { recordQuestionCompleted, checkWorldAchievements } = useGamification();

    // Timer para medir tempo de resposta (inicializa com 0, será setado quando iniciar questão)
    const questionStartTime = useRef<number>(0);

    useEffect(() => {
        if (!ready && !pyodideLoading) {
            loadPyodide();
        }
    }, [ready, pyodideLoading, loadPyodide]);

    // Agrupa questões por mundo para calcular progresso
    const worldProgress = useMemo(() => {
        const progress = new Map<World, { completed: number; total: number }>();

        // Otimização: Cria um Set para busca rápida de questões completadas (O(1))
        // em vez de usar find() dentro do loop (O(N))
        const completedQuestionIds = new Set(
            allProgress
                .filter(p => p.status === 'completed')
                .map(p => p.questionId)
        );

        // Itera sobre as questões uma única vez para agrupar e contar
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

    /**
     * Toca um som de celebração usando AudioContext (sem arquivos externos)
     */
    const playSuccessSound = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const oscillators = [
                { freq: 523.25, type: 'sine', start: 0, dur: 0.2 }, // C5
                { freq: 659.25, type: 'sine', start: 0.1, dur: 0.2 }, // E5
                { freq: 783.99, type: 'sine', start: 0.2, dur: 0.4 }, // G5
                { freq: 1046.50, type: 'sine', start: 0.3, dur: 0.6 } // C6
            ];

            oscillators.forEach(({ freq, type, start, dur }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type as OscillatorType;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + dur);
            });
        } catch (e) {
            console.error('Audio play failed', e);
        }
    }, []);

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
     * Se a questão já foi completada, mostra modal com opções
     */
    const handleStartQuestion = useCallback((question: QuestionDocument) => {
        const progress = getQuestionProgress(question.id);
        const index = worldQuestions.findIndex(q => q.id === question.id);

        setCurrentQuestion(question);
        setCurrentQuestionIndex(index);

        // Se questão já foi completada, mostra modal com opções
        if (progress?.status === 'completed') {
            setCompletedQuestionProgress(progress);
            setShowCompletedModal(true);
        } else {
            // Questão nova ou em progresso - vai direto para jogar
            setView('playing');
            // Inicia o timer para a questão
            questionStartTime.current = Date.now();
        }
    }, [getQuestionProgress, worldQuestions]);

    /**
     * Usuário escolheu "Ver minha resposta" no modal
     */
    const handleViewAnswer = useCallback(() => {
        setShowCompletedModal(false);
        setView('reviewing');
    }, []);

    /**
     * Usuário escolheu "Refazer" no modal (modo prática, sem pontos)
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
        // Calcula tempo de resposta em segundos
        const responseTimeSeconds = (Date.now() - questionStartTime.current) / 1000;

        if (currentQuestion) {
            const previousProgress = getQuestionProgress(currentQuestion.id);
            const wasCompleted = previousProgress?.status === 'completed';
            const existingScore = previousProgress?.score || 0;
            const starsEarned = (passed && !wasCompleted && score > existingScore)
                ? score - existingScore
                : 0;

            await recordAttempt(currentQuestion.id, passed, score);

            // Registra no sistema de gamificação com tempo de resposta
            recordQuestionCompleted(passed, score, responseTimeSeconds, {
                worldId: currentQuestion.world,
                starsEarned
            });
        }
    }, [currentQuestion, getQuestionProgress, recordAttempt, recordQuestionCompleted]);

    /**
     * Vai para a próxima questão não resolvida ou volta para a lista
     */
    const handleNext = useCallback(() => {
        let nextIndex = currentQuestionIndex + 1;
        let foundUnresolved = false;

        // Procura a próxima questão que NÃO está completa
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
            // Reinicia o timer para a próxima questão
            questionStartTime.current = Date.now();
        } else {
            // Terminou todas as questões do mundo (ou todas as próximas já estavam feitas)
            // Se está num mundo e acabou de terminar tudo
            if (selectedWorld) {
                const progress = worldProgress.get(selectedWorld);
                // Se completou agora (ou já estava completo)
                if (progress && progress.completed === progress.total) {

                    // CELEBRAÇÃO DE FIM DE MUNDO 🎉
                    playSuccessSound();
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#FFD700', '#FF4500', '#00BFFF', '#32CD32']
                    });

                    // Verifica conquistas de mundo
                    const totalWorldsCompleted = Array.from(worldProgress.values())
                        .filter(p => p.completed === p.total && p.total > 0).length;

                    checkWorldAchievements();

                    // VERIFICA SE TERMINOU O JOGO INTEIRO 🏆
                    const totalWorlds = worldProgress.size; // Total de mundos com questões
                    // Se o número de mundos completados for igual ao total de mundos com conteúdo
                    // Nota: worldProgress só tem mundos com questões
                    if (totalWorldsCompleted === totalWorlds) {
                        setTimeout(() => {
                            // Modal nativo simples por enquanto, ou navegação direta
                            const goCert = window.confirm(
                                'PARABÉNS! VOCÊ ZERO O JOGO! 🏆🐍\n\nTodas as questões foram completadas.\n\nDeseja ir para a página do seu CERTIFICADO agora?'
                            );
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
        playSuccessSound,
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

    // Mostra loading do Pyodide ou questões
    if (!ready || questionsLoading) {
        return (
            <div className="game-page game-page--loading">
                <div className="pyodide-loading">
                    <div className="pyodide-loading__icon">🐍</div>
                    <h2 className="pyodide-loading__title">Preparando o Python...</h2>
                    <div className="pyodide-loading__bar">
                        <div
                            className="pyodide-loading__progress"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                    <p className="pyodide-loading__text">
                        {loadingProgress < 30 && 'Carregando bibliotecas...'}
                        {loadingProgress >= 30 && loadingProgress < 80 && 'Inicializando Python...'}
                        {loadingProgress >= 80 && 'Quase pronto!'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="game-page">
            <SEO title="Aventura" description="Explore mundos, resolva desafios em Python e ganhe recompensas." />
            {/* Mapa de Mundos */}
            {view === 'world-map' && (
                <WorldMap
                    onSelectWorld={handleSelectWorld}
                    worldProgress={worldProgress}
                />
            )}

            {/* Lista de Questões do Mundo */}
            {view === 'world-questions' && selectedWorld && (
                <div className="world-questions">
                    <div className="world-questions__header">
                        <button className="back-button" onClick={handleBackToMap}>
                            ← Voltar ao Mapa
                        </button>
                        <h2 className="world-questions__title">
                            {getWorldName(selectedWorld)}
                        </h2>
                        <div className="world-questions__stats">
                            {worldProgress.get(selectedWorld)?.completed || 0} /
                            {worldProgress.get(selectedWorld)?.total || 0} completadas
                        </div>
                    </div>

                    <div className="world-questions__list">
                        {worldQuestions
                            .sort((a, b) => {
                                // Boss battle sempre pro final
                                if (a.type === 'boss_battle' && b.type !== 'boss_battle') return 1;
                                if (a.type !== 'boss_battle' && b.type === 'boss_battle') return -1;
                                // Mantém ordem original (por id ou ordem do array)
                                return 0;
                            })
                            .map((question, index, allQuestions) => {
                                const progress = getQuestionProgress(question.id);
                                let isLocked = false;

                                // Lógica de bloqueio do Boss
                                if (question.type === 'boss_battle') {
                                    const otherQuestions = allQuestions.filter(q => q.type !== 'boss_battle');
                                    const allOthersCompleted = otherQuestions.every(q => {
                                        const p = getQuestionProgress(q.id);
                                        return p?.status === 'completed';
                                    });
                                    if (!allOthersCompleted) {
                                        isLocked = true;
                                    }
                                }

                                return (
                                    <QuestionCard
                                        key={question.id}
                                        question={question}
                                        index={index}
                                        status={progress?.status || 'not_started'}
                                        locked={isLocked}
                                        onClick={() => handleStartQuestion(question)}
                                    />
                                );
                            })}
                    </div>

                    {worldQuestions.length === 0 && (
                        <div className="world-questions__empty">
                            <span className="world-questions__empty-icon">📭</span>
                            <p>Este mundo ainda não tem questões.</p>
                            <p>Em breve adicionaremos conteúdo aqui!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Jogando uma Questão */}
            {view === 'playing' && currentQuestion && (
                <div className="question-play">
                    <div className="question-play__header">
                        <button className="back-button" onClick={handleBackToQuestions}>
                            ← Voltar às Questões
                        </button>
                        <div className="question-play__progress">
                            Questão {currentQuestionIndex + 1} de {worldQuestions.length}
                        </div>
                    </div>

                    <QuestionEngine
                        question={currentQuestion}
                        onComplete={handleQuestionComplete}
                        onNext={handleNext}
                    />
                </div>
            )}

            {/* Revisando uma Questão (modo leitura) */}
            {view === 'reviewing' && currentQuestion && completedQuestionProgress && (
                <div className="question-play question-play--reviewing">
                    <div className="question-play__header">
                        <button className="back-button" onClick={handleBackToQuestions}>
                            ← Voltar às Questões
                        </button>
                        <div className="question-play__review-badge">
                            📖 Visualização
                        </div>
                    </div>

                    <QuestionEngine
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
                            🔄 Refazer para Praticar
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
        </div>
    );
}

export default GamePage;
