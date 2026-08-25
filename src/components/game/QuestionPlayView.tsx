import type { QuestionDocument } from '../../types/question';
import type { PowerUpType, UserPowerUps } from '../../types/gamification';
import { PowerUpBarCompact } from '../gamification';
import { QuestionEngine } from './QuestionEngine';

interface QuestionPlayViewProps {
    currentQuestion: QuestionDocument;
    currentQuestionIndex: number;
    worldQuestionsLength: number;
    userPowerUps: UserPowerUps;
    activePowerUp: PowerUpType | null;
    userStars: number;
    handleBackToQuestions: () => void;
    handleUsePowerUp: (type: PowerUpType) => boolean;
    buyPowerUp: (type: PowerUpType, price: number) => boolean;
    handleQuestionComplete: (passed: boolean, score: number) => void;
    handleNext: () => void;
}

export function QuestionPlayView({
    currentQuestion,
    currentQuestionIndex,
    worldQuestionsLength,
    userPowerUps,
    activePowerUp,
    userStars,
    handleBackToQuestions,
    handleUsePowerUp,
    buyPowerUp,
    handleQuestionComplete,
    handleNext
}: QuestionPlayViewProps) {
    return (
        <div className="question-play">
            <div className="question-play__header">
                <button className="back-button" onClick={handleBackToQuestions}>
                    ← Voltar às Questões
                </button>
                <div className="question-play__progress">
                    Questão {currentQuestionIndex + 1} de {worldQuestionsLength}
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
    );
}
