import type { Difficulty } from '../../../types/question';

interface QuestionHeaderProps {
    badgeClassName: string;
    badgeText: string;
    difficulty: Difficulty;
    title: string;
    prompt: string;
}

export function QuestionHeader({
    badgeClassName,
    badgeText,
    difficulty,
    title,
    prompt,
}: QuestionHeaderProps) {
    return (
        <>
            <div className="question-header">
                <span className={`question-type-badge ${badgeClassName}`}>
                    {badgeText}
                </span>
                <span className={`question-difficulty question-difficulty--${difficulty}`}>
                    {difficulty === 'easy' && '⭐ Fácil'}
                    {difficulty === 'medium' && '⭐⭐ Médio'}
                    {difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                </span>
            </div>

            <h2 className="question-title">{title}</h2>
            <p className="question-prompt">{prompt}</p>
        </>
    );
}

