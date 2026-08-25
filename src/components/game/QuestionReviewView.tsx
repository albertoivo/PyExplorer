import type { QuestionDocument, UserProgress } from '../../types/question';
import { QuestionEngine } from './QuestionEngine';

interface QuestionReviewViewProps {
    currentQuestion: QuestionDocument;
    completedQuestionProgress: UserProgress;
    handleBackToQuestions: () => void;
    handleQuestionComplete: (passed: boolean, score: number) => void;
    handleRedoQuestion: () => void;
}

export function QuestionReviewView({
    currentQuestion,
    completedQuestionProgress,
    handleBackToQuestions,
    handleQuestionComplete,
    handleRedoQuestion
}: QuestionReviewViewProps) {
    return (
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
                    🔄 Refazer para Praticar
                </button>
            </div>
        </div>
    );
}
