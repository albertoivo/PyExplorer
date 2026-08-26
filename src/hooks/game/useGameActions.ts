import { useCallback } from 'react';
import type { World, QuestionDocument } from '../../types/question';
import type { PowerUpType } from '../../types/gamification';
import { playSound } from '../../utils/soundEffects';
import { useNavigate } from 'react-router-dom';

type ConfettiFn = (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { y: number };
    colors?: string[];
}) => void;

export function useGameActions(gameState: ReturnType<typeof import("./useGameState").useGameState>) {
    const navigate = useNavigate();
    const {
        setView,
        setSelectedWorld,
        setCurrentQuestion,
        setWorldQuestions,
        setCurrentQuestionIndex,
        setShowCompletedModal,
        setCompletedQuestionProgress,
        setActivePowerUp,
        getQuestionsByWorld,
        getQuestionProgressRef,
        worldQuestions,
        questionStartTimeRef,
        getQuestionProgress,
        recordAttempt,
        recordQuestionCompleted,
        activePowerUp,
        currentQuestion,
        currentQuestionIndex,
        selectedWorld,
        worldProgress,
        checkWorldAchievements,
        consumePowerUp
    } = gameState;

    const handleSelectWorld = useCallback((world: World) => {
        const questions = getQuestionsByWorld(world);
        setSelectedWorld(world);
        setWorldQuestions(questions);
        setView('world-questions');
    }, [getQuestionsByWorld, setSelectedWorld, setWorldQuestions, setView]);

    const handleStartQuestion = useCallback((question: QuestionDocument) => {
        const progress = getQuestionProgressRef.current(question.id);
        const index = worldQuestions.findIndex((q: QuestionDocument) => q.id === question.id);

        setCurrentQuestion(question);
        setCurrentQuestionIndex(index);

        if (progress?.status === 'completed') {
            setCompletedQuestionProgress(progress);
            setShowCompletedModal(true);
        } else {
            setView('playing');
            questionStartTimeRef.current = Date.now();
        }
    }, [worldQuestions, getQuestionProgressRef, setCurrentQuestion, setCurrentQuestionIndex, setCompletedQuestionProgress, setShowCompletedModal, setView, questionStartTimeRef]);

    const handleViewAnswer = useCallback(() => {
        setShowCompletedModal(false);
        setView('reviewing');
    }, [setShowCompletedModal, setView]);

    const handleRedoQuestion = useCallback(() => {
        setShowCompletedModal(false);
        setView('playing');
        questionStartTimeRef.current = Date.now();
    }, [setShowCompletedModal, setView, questionStartTimeRef]);

    const handleCloseCompletedModal = useCallback(() => {
        setShowCompletedModal(false);
        setCurrentQuestion(null);
        setCompletedQuestionProgress(null);
    }, [setShowCompletedModal, setCurrentQuestion, setCompletedQuestionProgress]);

    const handleQuestionComplete = useCallback(async (passed: boolean, score: number) => {
        const responseTimeSeconds = (Date.now() - questionStartTimeRef.current) / 1000;

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
    }, [currentQuestion, getQuestionProgress, recordAttempt, recordQuestionCompleted, activePowerUp, questionStartTimeRef, setActivePowerUp]);

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
            questionStartTimeRef.current = Date.now();
        } else {
            if (selectedWorld) {
                const progress = worldProgress.get(selectedWorld);
                if (progress && progress.completed === progress.total) {
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
                        .filter((p: { completed: number; total: number }) => p.completed === p.total && p.total > 0).length;

                    const mistakes = worldQuestions.reduce((acc: number, q: QuestionDocument) => {
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
        checkWorldAchievements,
        navigate,
        setCurrentQuestion,
        setCurrentQuestionIndex,
        setView,
        questionStartTimeRef
    ]);

    const handleBackToQuestions = useCallback(() => {
        setView('world-questions');
        setCurrentQuestion(null);
    }, [setView, setCurrentQuestion]);

    const handleBackToMap = useCallback(() => {
        setView('world-map');
        setSelectedWorld(null);
        setWorldQuestions([]);
    }, [setView, setSelectedWorld, setWorldQuestions]);

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
    }, [activePowerUp, handleNext, consumePowerUp, setActivePowerUp]);

    return {
        handleSelectWorld,
        handleStartQuestion,
        handleViewAnswer,
        handleRedoQuestion,
        handleCloseCompletedModal,
        handleQuestionComplete,
        handleNext,
        handleBackToQuestions,
        handleBackToMap,
        handleUsePowerUp
    };
}
