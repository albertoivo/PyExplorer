import { useEffect } from 'react';
import type { World } from '../types/question';
import { WorldMap } from '../components/game/WorldMap';
import { QuestionPlayView } from '../components/game/QuestionPlayView';
import { QuestionReviewView } from '../components/game/QuestionReviewView';
import { CompletedQuestionModal } from '../components/game/CompletedQuestionModal';
import { PyodideLoader } from '../components/game/PyodideLoader';
import { WorldQuestionsView } from '../components/game/WorldQuestionsView';
import { MissionNotificationOverlay } from '../components/game/MissionNotificationOverlay';
import { usePyodide } from '../hooks/usePyodide';
import { SEO } from '../components/common/SEO';
import { PetHabitat } from '../components/gamification/PetHabitat/PetHabitat';
import { EvolutionModal } from '../components/gamification/PetHabitat/EvolutionModal';
import { WORLDS } from '../data/worlds';
import './GamePage.css';

import { useGameState } from '../hooks/game/useGameState';
import { useGameActions } from '../hooks/game/useGameActions';

const getWorldName = (world: World): string => {
    const worldObj = WORLDS.find(w => w.id === world);
    return worldObj ? worldObj.name : world;
};

export function GamePage() {
    const gameState = useGameState();
    const actions = useGameActions(gameState);

    const { loading: pyodideLoading, loadingProgress, loadPyodide, ready } = usePyodide();

    useEffect(() => {
        if (gameState.missionNotification) {
            const timer = setTimeout(() => {
                gameState.dismissMissionNotification();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [gameState.missionNotification, gameState.dismissMissionNotification]);

    useEffect(() => {
        if (!ready && !pyodideLoading) {
            loadPyodide();
        }
    }, [ready, pyodideLoading, loadPyodide]);

    if (!ready || gameState.questionsLoading) {
        return <PyodideLoader loadingProgress={loadingProgress} />;
    }

    return (
        <div className="game-page">
            <SEO title="Aventura" description="Resolva desafios interativos de Python no navegador. 18 mundos, 4 sagas épicas, boss battles e sistema de estrelas. 100% grátis!" noindex />

            <EvolutionModal />

            {gameState.view === 'world-map' && (
                <>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <PetHabitat />
                    </div>
                    <WorldMap
                        onSelectWorld={actions.handleSelectWorld}
                        worldProgress={gameState.worldProgress}
                    />
                </>
            )}

            {gameState.view === 'world-questions' && gameState.selectedWorld && (
                <WorldQuestionsView
                    selectedWorld={gameState.selectedWorld}
                    worldName={getWorldName(gameState.selectedWorld)}
                    sortedQuestions={gameState.sortedQuestions}
                    completedCount={gameState.worldProgress.get(gameState.selectedWorld)?.completed || 0}
                    totalCount={gameState.worldProgress.get(gameState.selectedWorld)?.total || 0}
                    bossBattleUnlocked={gameState.bossBattleUnlocked}
                    getQuestionProgress={gameState.getQuestionProgress}
                    onBackToMap={actions.handleBackToMap}
                    onStartQuestion={actions.handleStartQuestion}
                />
            )}

            {gameState.view === 'playing' && gameState.currentQuestion && (
                <QuestionPlayView
                    currentQuestion={gameState.currentQuestion}
                    currentQuestionIndex={gameState.currentQuestionIndex}
                    worldQuestionsLength={gameState.worldQuestions.length}
                    userPowerUps={gameState.userPowerUps}
                    activePowerUp={gameState.activePowerUp}
                    userStars={gameState.userStars}
                    handleBackToQuestions={actions.handleBackToQuestions}
                    handleUsePowerUp={actions.handleUsePowerUp}
                    buyPowerUp={gameState.buyPowerUp}
                    handleQuestionComplete={actions.handleQuestionComplete}
                    handleNext={actions.handleNext}
                />
            )}

            {gameState.view === 'reviewing' && gameState.currentQuestion && gameState.completedQuestionProgress && (
                <QuestionReviewView
                    currentQuestion={gameState.currentQuestion}
                    completedQuestionProgress={gameState.completedQuestionProgress}
                    handleBackToQuestions={actions.handleBackToQuestions}
                    handleQuestionComplete={actions.handleQuestionComplete}
                    handleRedoQuestion={actions.handleRedoQuestion}
                />
            )}

            {gameState.showCompletedModal && gameState.currentQuestion && gameState.completedQuestionProgress && (
                <CompletedQuestionModal
                    question={gameState.currentQuestion}
                    progress={gameState.completedQuestionProgress}
                    onViewAnswer={actions.handleViewAnswer}
                    onRedo={actions.handleRedoQuestion}
                    onClose={actions.handleCloseCompletedModal}
                />
            )}

            <MissionNotificationOverlay notification={gameState.missionNotification} />
        </div>
    );
}
