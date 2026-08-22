import type { Difficulty } from '../../../types/question';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('game');
    return (
        <>
            <div className="question-header">
                <span className={`question-type-badge ${badgeClassName}`}>
                    {badgeText}
                </span>
                <span className={`question-difficulty question-difficulty--${difficulty}`}>
                    {difficulty === 'easy' && t('difficulties.starsEasy', '⭐ Fácil')}
                    {difficulty === 'medium' && t('difficulties.starsMedium', '⭐⭐ Médio')}
                    {difficulty === 'hard' && t('difficulties.starsHard', '⭐⭐⭐ Difícil')}
                </span>
            </div>

            <h2 className="question-title">{title}</h2>
            <p className="question-prompt">{prompt}</p>
        </>
    );
}
