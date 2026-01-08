import { useState, useMemo, useEffect } from 'react';
import type { World, QuestionDocument } from '../types/question';
import { WorldMap } from '../components/game/WorldMap';
import { QuestionEngine } from '../components/game/QuestionEngine';
import { QuestionCard } from '../components/game/QuestionCard';
import { useProgress } from '../hooks/useProgress';
import { usePyodide } from '../hooks/usePyodide';
import { useQuestionsFirestore } from '../hooks/useQuestionsFirestore';
import './GamePage.css';

type GameView = 'world-map' | 'world-questions' | 'playing';

/**
 * Página principal do jogo
 */
export function GamePage() {
    const [view, setView] = useState<GameView>('world-map');
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionDocument | null>(null);
    const [worldQuestions, setWorldQuestions] = useState<QuestionDocument[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const { allProgress, recordAttempt, getQuestionProgress } = useProgress();
    const { loading: pyodideLoading, loadingProgress, loadPyodide, ready } = usePyodide();
    const { questions: allQuestions, loading: questionsLoading, getQuestionsByWorld } = useQuestionsFirestore();

    useEffect(() => {
        if (!ready && !pyodideLoading) {
            loadPyodide();
        }
    }, [ready, pyodideLoading, loadPyodide]);

    // Agrupa questões por mundo para calcular progresso
    const worldProgress = useMemo(() => {
        const progress = new Map<World, { completed: number; total: number }>();

        const worldGroups = allQuestions.reduce((acc, q) => {
            if (!acc[q.world]) acc[q.world] = [];
            acc[q.world].push(q.id);
            return acc;
        }, {} as Record<string, string[]>);

        for (const [world, questionIds] of Object.entries(worldGroups)) {
            const completed = questionIds.filter(qId =>
                allProgress.find(p => p.questionId === qId && p.status === 'completed')
            ).length;
            progress.set(world as World, { completed, total: questionIds.length });
        }

        return progress;
    }, [allProgress, allQuestions]);

    /**
     * Seleciona um mundo para ver suas questões
     */
    const handleSelectWorld = (world: World) => {
        const questions = getQuestionsByWorld(world);
        setSelectedWorld(world);
        setWorldQuestions(questions);
        setView('world-questions');
    };


    /**
     * Começa a jogar uma questão
     */
    const handleStartQuestion = (question: QuestionDocument) => {
        const index = worldQuestions.findIndex(q => q.id === question.id);
        setCurrentQuestion(question);
        setCurrentQuestionIndex(index);
        setView('playing');
    };

    /**
     * Callback quando uma questão é completada
     */
    const handleQuestionComplete = async (passed: boolean, score: number) => {
        if (currentQuestion) {
            await recordAttempt(currentQuestion.id, passed, score);
        }
    };

    /**
     * Vai para a próxima questão ou volta para a lista
     */
    const handleNext = () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < worldQuestions.length) {
            setCurrentQuestion(worldQuestions[nextIndex]);
            setCurrentQuestionIndex(nextIndex);
        } else {
            // Terminou todas as questões do mundo
            setView('world-questions');
            setCurrentQuestion(null);
        }
    };

    /**
     * Volta para a lista de questões do mundo
     */
    const handleBackToQuestions = () => {
        setView('world-questions');
        setCurrentQuestion(null);
    };

    /**
     * Volta para o mapa de mundos
     */
    const handleBackToMap = () => {
        setView('world-map');
        setSelectedWorld(null);
        setWorldQuestions([]);
    };

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
        };
        return names[world] || world;
    };

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
                        {worldQuestions.map((question, index) => {
                            const progress = getQuestionProgress(question.id);
                            return (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    status={progress?.status || 'not_started'}
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
        </div>
    );
}

export default GamePage;
