import { useState, useMemo, useEffect, useRef } from 'react';
import type { World, QuestionDocument, UserProgress } from '../../types/question';
import type { PowerUpType } from '../../types/gamification';
import { useProgress } from '../useProgress';
import { useQuestionsFirestore } from '../useQuestionsFirestore';
import { useGamification } from '../../context/GamificationContext';
import { isBossUnlocked } from '../../utils/gameLogic';

export type GameView = 'world-map' | 'world-questions' | 'playing' | 'reviewing';

export function useGameState() {
    const [view, setView] = useState<GameView>('world-map');
    const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionDocument | null>(null);
    const [worldQuestions, setWorldQuestions] = useState<QuestionDocument[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [completedQuestionProgress, setCompletedQuestionProgress] = useState<UserProgress | null>(null);
    const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

    const { allProgress, recordAttempt, getQuestionProgress } = useProgress();
    const { questions: allQuestions, loading: questionsLoading, getQuestionsByWorld } = useQuestionsFirestore();
    const { recordQuestionCompleted, checkWorldAchievements, userPowerUps, usePowerUp: consumePowerUp, buyPowerUp, userStars, missionNotification, dismissMissionNotification } = useGamification();

    const questionStartTimeRef = useRef<number>(0);
    const getQuestionProgressRef = useRef(getQuestionProgress);

    useEffect(() => {
        getQuestionProgressRef.current = getQuestionProgress;
    }, [getQuestionProgress]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view, currentQuestion]);

    const sortedQuestions = useMemo(() => {
        return [...worldQuestions].sort((a, b) => {
            if (a.type === 'boss_battle' && b.type !== 'boss_battle') return 1;
            if (a.type !== 'boss_battle' && b.type === 'boss_battle') return -1;
            return 0;
        });
    }, [worldQuestions]);

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

    const bossBattleUnlocked = useMemo(() => {
        return isBossUnlocked(worldQuestions, getQuestionProgress);
    }, [worldQuestions, getQuestionProgress]);

    return {
        view, setView,
        selectedWorld, setSelectedWorld,
        currentQuestion, setCurrentQuestion,
        worldQuestions, setWorldQuestions,
        currentQuestionIndex, setCurrentQuestionIndex,
        showCompletedModal, setShowCompletedModal,
        completedQuestionProgress, setCompletedQuestionProgress,
        activePowerUp, setActivePowerUp,
        questionStartTimeRef,
        getQuestionProgressRef,
        sortedQuestions,
        worldProgress,
        bossBattleUnlocked,
        questionsLoading,
        allProgress,
        recordAttempt,
        getQuestionProgress,
        allQuestions,
        getQuestionsByWorld,
        recordQuestionCompleted,
        checkWorldAchievements,
        userPowerUps,
        consumePowerUp,
        buyPowerUp,
        userStars,
        missionNotification,
        dismissMissionNotification
    };
}
