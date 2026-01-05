import type { UserStreak } from '../../../types/gamification';
import './StreakDisplay.css';

interface StreakDisplayProps {
    streak: UserStreak;
    compact?: boolean;
}

/**
 * Exibe o streak diário do usuário
 */
export function StreakDisplay({ streak, compact = false }: StreakDisplayProps) {
    const { currentStreak, longestStreak, activityHistory } = streak;

    // Gera os últimos 7 dias
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const isActive = activityHistory.includes(dateStr);
        const isToday = i === 0;
        last7Days.push({ date: dateStr, isActive, isToday });
    }

    if (compact) {
        return (
            <div className="streak-display streak-display--compact">
                <span className="streak-display__fire">🔥</span>
                <span className="streak-display__count">{currentStreak}</span>
            </div>
        );
    }

    return (
        <div className="streak-display">
            <div className="streak-display__header">
                <div className="streak-display__current">
                    <span className="streak-display__fire">🔥</span>
                    <div className="streak-display__info">
                        <span className="streak-display__count">{currentStreak}</span>
                        <span className="streak-display__label">dias seguidos</span>
                    </div>
                </div>

                {longestStreak > currentStreak && (
                    <div className="streak-display__best">
                        <span className="streak-display__best-icon">🏆</span>
                        <span className="streak-display__best-value">Recorde: {longestStreak}</span>
                    </div>
                )}
            </div>

            <div className="streak-display__calendar">
                {last7Days.map(({ date, isActive, isToday }) => (
                    <div
                        key={date}
                        className={`streak-display__day ${isActive ? 'streak-display__day--active' : ''} ${isToday ? 'streak-display__day--today' : ''}`}
                    >
                        <span className="streak-display__day-label">
                            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                        </span>
                        <span className="streak-display__day-icon">
                            {isActive ? '🔥' : '⚪'}
                        </span>
                    </div>
                ))}
            </div>

            {currentStreak >= 7 && (
                <div className="streak-display__bonus">
                    <span className="streak-display__bonus-icon">⚡</span>
                    <span className="streak-display__bonus-text">
                        Bônus de streak: +{Math.min(currentStreak, 30)}% XP
                    </span>
                </div>
            )}
        </div>
    );
}

export default StreakDisplay;
