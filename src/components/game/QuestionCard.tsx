import type { QuestionDocument } from '../../types/question';
import './QuestionCard.css';

interface QuestionCardProps {
    question: QuestionDocument;
    index: number;
    status: 'not_started' | 'in_progress' | 'completed';
    locked?: boolean;
    onClick: () => void;
}

const TYPE_ICONS: Record<string, string> = {
    multiple_choice: '🎯',
    true_false: '⚡',
    fill_code: '✏️',
    partial_function: '🧩',
    full_function: '💻',
    boss_battle: '👹',
    default: '❓'
};

const TYPE_LABELS: Record<string, string> = {
    multiple_choice: 'Escolha',
    true_false: 'V ou F',
    fill_code: 'Complete',
    partial_function: 'Função Parcial',
    full_function: 'Função',
    boss_battle: 'Chefe Final',
    default: 'Questão'
};

const DIFFICULTY_TEXT: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil'
};

/**
 * Card de questão na lista de questões de um mundo
 */
export function QuestionCard({ question, index, status, locked, onClick }: QuestionCardProps) {
    const typeIcon = TYPE_ICONS[question.type] || TYPE_ICONS.default;
    const typeLabel = TYPE_LABELS[question.type] || TYPE_LABELS.default;
    const difficultyText = DIFFICULTY_TEXT[question.difficulty] || '';

    const getStatusIcon = () => {
        if (locked) return '🔒';
        switch (status) {
            case 'completed': return '✓';
            case 'in_progress': return '⋯';
            default: return index + 1;
        }
    };

    const getStatusText = () => {
        if (locked) return 'Bloqueada';
        switch (status) {
            case 'completed': return 'Completada';
            case 'in_progress': return 'Em progresso';
            default: return 'Disponível';
        }
    };

    return (
        <button
            className={`question-card question-card--${status} ${locked ? 'question-card--locked' : ''}`}
            onClick={locked ? undefined : onClick}
            disabled={locked}
            aria-label={`Questão ${index + 1}: ${question.title}. Tipo: ${typeLabel}. Dificuldade: ${difficultyText}. Status: ${getStatusText()}.`}
        >
            <div
                className={`question-card__status question-card__status--${locked ? 'locked' : status}`}
                aria-hidden="true"
            >
                {getStatusIcon()}
            </div>

            <div className="question-card__content">
                <div className="question-card__header">
                    <span className="question-card__type" aria-hidden="true">
                        {typeIcon} {typeLabel}
                    </span>
                    <span
                        className={`question-card__difficulty question-card__difficulty--${question.difficulty}`}
                        aria-hidden="true"
                    >
                        {question.difficulty === 'easy' && '⭐'}
                        {question.difficulty === 'medium' && '⭐⭐'}
                        {question.difficulty === 'hard' && '⭐⭐⭐'}
                    </span>
                </div>

                <h4 className="question-card__title">{question.title}</h4>

                <p className="question-card__preview" aria-hidden="true">
                    {question.prompt.slice(0, 80)}
                    {question.prompt.length > 80 ? '...' : ''}
                </p>
            </div>

            <div className="question-card__arrow" aria-hidden="true">→</div>
        </button>
    );
}

export default QuestionCard;
