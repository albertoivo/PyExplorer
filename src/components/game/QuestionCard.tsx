import { memo } from 'react';
import type { QuestionDocument } from '../../types/question';
import { useTranslation } from 'react-i18next';
import './QuestionCard.css';

interface QuestionCardProps {
    question: QuestionDocument;
    index: number;
    status: 'not_started' | 'in_progress' | 'completed';
    stars?: 0 | 1 | 2 | 3;
    locked?: boolean;
    onClick: (question: QuestionDocument) => void;
}

const TYPE_ICONS: Record<string, string> = {
    multiple_choice: '🎯',
    true_false: '⚡',
    fill_code: '✏️',
    partial_function: '🧩',
    full_function: '💻',
    parsons_problem: '🧩',
    turtle_challenge: '🎨',
    boss_battle: '👹',
};

// Use keys instead of direct translation to allow dynamic translation inside the component
const TYPE_KEYS: Record<string, string> = {
    multiple_choice: 'questionTypes.multiple_choice',
    true_false: 'questionTypes.true_false',
    fill_code: 'questionTypes.fill_code',
    partial_function: 'questionTypes.partial_function',
    full_function: 'questionTypes.full_function',
    parsons_problem: 'questionTypes.parsons_problem',
    turtle_challenge: 'questionTypes.turtle_challenge',
    boss_battle: 'questionTypes.boss_battle',
};

const STATUS_KEYS: Record<string, string> = {
    not_started: 'status.not_started',
    in_progress: 'status.in_progress',
    completed: 'status.completed',
};

const getStatusIcon = (status: string, locked?: boolean, index?: number) => {
    if (locked) return '🔒';
    switch (status) {
        case 'completed': return '✓';
        case 'in_progress': return '⋯';
        default: return index !== undefined ? index + 1 : '';
    }
};

/**
 * Renderiza estrelas ganhas (filled) vs potenciais (empty)
 */
const StarsDisplay = ({ stars, status }: { stars: number; status: string }) => {
    const { t } = useTranslation('game');
    const label = status !== 'completed' ? t('stars.potential', '0 de 3 estrelas') : t('stars.earned', { defaultValue: '{{earned}} de 3 estrelas',  earned: stars });

    // Se não completou, mostra estrelas vazias
    if (status !== 'completed') {
        return (
            <span
                className="question-card__stars question-card__stars--potential"
                role="img"
                aria-label={label}
            >
                <span className="star star--empty" aria-hidden="true">☆</span>
                <span className="star star--empty" aria-hidden="true">☆</span>
                <span className="star star--empty" aria-hidden="true">☆</span>
            </span>
        );
    }

    // Se completou, mostra estrelas ganhas
    return (
        <span
            className="question-card__stars question-card__stars--earned"
            role="img"
            aria-label={label}
        >
            {[1, 2, 3].map(i => (
                <span key={i} className={`star ${i <= stars ? 'star--filled' : 'star--empty'}`} aria-hidden="true">
                    {i <= stars ? '★' : '☆'}
                </span>
            ))}
        </span>
    );
};

/**
 * Card de questão na lista de questões de um mundo
 */
export const QuestionCard = memo(function QuestionCard({ question, index, status, stars = 0, locked, onClick }: QuestionCardProps) {
    const { t } = useTranslation('game');
    const typeIcon = TYPE_ICONS[question.type] || '❓';
    const typeLabel = (TYPE_KEYS[question.type] ? t(TYPE_KEYS[question.type] as unknown as string) : t('questionTypes.unknown', 'Questão')) as string;
    const statusIcon = getStatusIcon(status, locked, index);

    const handleClick = () => {
        if (!locked) {
            onClick(question);
        }
    };

    // Construct comprehensive aria-label for the entire card button
    const statusLabel = (locked ? t('status.locked', 'Bloqueado') : (STATUS_KEYS[status] ? t(STATUS_KEYS[status] as unknown as string) : t('status.unknown', 'Status desconhecido'))) as string;
    const scoreLabel = (status === 'completed' ? t('stars.earned', { defaultValue: '{{earned}} de 3 estrelas',  earned: stars }) : t('stars.potential', '0 de 3 estrelas')) as string;
    const ariaLabel = t('questionCard.ariaLabel', { defaultValue: 'Questão {{num}}: {{title}}. {{status}}. {{score}} Tipo: {{type}}.', 
        num: index + 1,
        title: question.title,
        status: statusLabel,
        score: !locked ? scoreLabel + '.' : '',
        type: typeLabel
    });

    return (
        <button
            className={`question-card question-card--${status} ${locked ? 'question-card--locked' : ''}`}
            onClick={handleClick}
            disabled={locked}
            aria-label={ariaLabel}
        >
            <div className={`question-card__status question-card__status--${locked ? 'locked' : status}`} aria-hidden="true">
                {statusIcon}
            </div>

            <div className="question-card__content">
                <div className="question-card__header">
                    <span className="question-card__type">
                        <span aria-hidden="true">{typeIcon}</span> {typeLabel}
                    </span>
                    <StarsDisplay stars={stars} status={status} />
                </div>

                <h4 className="question-card__title">{question.title}</h4>

                <p className="question-card__preview">
                    {question.prompt.slice(0, 80)}
                    {question.prompt.length > 80 ? '...' : ''}
                </p>
            </div>

            <div className="question-card__arrow" aria-hidden="true">→</div>
        </button>
    );
});

