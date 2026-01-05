import type { QuestionDocument } from '../../types/question';
import './QuestionCard.css';

interface QuestionCardProps {
    question: QuestionDocument;
    index: number;
    status: 'not_started' | 'in_progress' | 'completed';
    onClick: () => void;
}

/**
 * Card de questão na lista de questões de um mundo
 */
export function QuestionCard({ question, index, status, onClick }: QuestionCardProps) {
    const getTypeIcon = () => {
        switch (question.type) {
            case 'multiple_choice': return '🎯';
            case 'true_false': return '⚡';
            case 'fill_code': return '✏️';
            case 'partial_function': return '🧩';
            case 'full_function': return '💻';
            default: return '❓';
        }
    };

    const getTypeLabel = () => {
        switch (question.type) {
            case 'multiple_choice': return 'Escolha';
            case 'true_false': return 'V ou F';
            case 'fill_code': return 'Complete';
            case 'partial_function': return 'Função Parcial';
            case 'full_function': return 'Função';
            default: return 'Questão';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'completed': return '✓';
            case 'in_progress': return '⋯';
            default: return index + 1;
        }
    };

    return (
        <button
            className={`question-card question-card--${status}`}
            onClick={onClick}
        >
            <div className={`question-card__status question-card__status--${status}`}>
                {getStatusIcon()}
            </div>

            <div className="question-card__content">
                <div className="question-card__header">
                    <span className="question-card__type">
                        {getTypeIcon()} {getTypeLabel()}
                    </span>
                    <span className={`question-card__difficulty question-card__difficulty--${question.difficulty}`}>
                        {question.difficulty === 'easy' && '⭐'}
                        {question.difficulty === 'medium' && '⭐⭐'}
                        {question.difficulty === 'hard' && '⭐⭐⭐'}
                    </span>
                </div>

                <h4 className="question-card__title">{question.title}</h4>

                <p className="question-card__preview">
                    {question.prompt.slice(0, 80)}
                    {question.prompt.length > 80 ? '...' : ''}
                </p>
            </div>

            <div className="question-card__arrow">→</div>
        </button>
    );
}

export default QuestionCard;
