import { useState } from 'react';
import type { LeaderboardEntry, LeaderboardPeriod } from '../../../types/gamification';
import './Leaderboard.css';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    period?: LeaderboardPeriod;
    onPeriodChange?: (period: LeaderboardPeriod) => void;
}

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
    daily: 'Hoje',
    weekly: 'Semana',
    monthly: 'Mês',
    allTime: 'Geral',
};

const RANK_EMOJIS: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
};

/**
 * Leaderboard / Ranking de jogadores
 */
export function Leaderboard({
    entries,
    currentUserId,
    period = 'weekly',
    onPeriodChange,
}: LeaderboardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>(period);

    const handlePeriodChange = (p: LeaderboardPeriod) => {
        setSelectedPeriod(p);
        onPeriodChange?.(p);
    };

    const periods = Object.keys(PERIOD_LABELS) as LeaderboardPeriod[];

    // Encontra a posição do usuário atual
    const currentUserEntry = entries.find(e => e.uid === currentUserId);
    const currentUserRank = currentUserEntry?.rank;

    return (
        <div className="leaderboard">
            <div className="leaderboard__header">
                <h2 className="leaderboard__title">🏆 Ranking</h2>

                <div className="leaderboard__periods">
                    {periods.map(p => (
                        <button
                            key={p}
                            className={`leaderboard__period ${selectedPeriod === p ? 'leaderboard__period--active' : ''}`}
                            onClick={() => handlePeriodChange(p)}
                        >
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top 3 com destaque */}
            <div className="leaderboard__podium">
                {entries.slice(0, 3).map((entry, index) => (
                    <div
                        key={entry.uid}
                        className={`podium-card podium-card--${index + 1} ${entry.uid === currentUserId ? 'podium-card--current' : ''}`}
                    >
                        <div className="podium-card__rank">{RANK_EMOJIS[index + 1]}</div>
                        <div className="podium-card__avatar">{entry.avatar}</div>
                        <div className="podium-card__name">{entry.displayName}</div>
                        <div className="podium-card__score">
                            <span className="podium-card__score-icon">⭐</span>
                            {entry.score.toLocaleString()}
                        </div>
                        <div className="podium-card__level">Nível {entry.level}</div>
                    </div>
                ))}
            </div>

            {/* Lista do restante */}
            <div className="leaderboard__list">
                {entries.slice(3).map(entry => (
                    <div
                        key={entry.uid}
                        className={`leaderboard__entry ${entry.uid === currentUserId ? 'leaderboard__entry--current' : ''}`}
                    >
                        <div className="leaderboard__entry-rank">{entry.rank}</div>
                        <div className="leaderboard__entry-avatar">{entry.avatar}</div>
                        <div className="leaderboard__entry-info">
                            <span className="leaderboard__entry-name">{entry.displayName}</span>
                            <span className="leaderboard__entry-level">Nível {entry.level}</span>
                        </div>
                        <div className="leaderboard__entry-score">
                            <span className="leaderboard__entry-score-icon">⭐</span>
                            {entry.score.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Posição do usuário atual (se não estiver no top 10) */}
            {currentUserRank && currentUserRank > 10 && currentUserEntry && (
                <div className="leaderboard__current-user">
                    <div className="leaderboard__separator">• • •</div>
                    <div className="leaderboard__entry leaderboard__entry--current">
                        <div className="leaderboard__entry-rank">{currentUserRank}</div>
                        <div className="leaderboard__entry-avatar">{currentUserEntry.avatar}</div>
                        <div className="leaderboard__entry-info">
                            <span className="leaderboard__entry-name">{currentUserEntry.displayName}</span>
                            <span className="leaderboard__entry-level">Nível {currentUserEntry.level}</span>
                        </div>
                        <div className="leaderboard__entry-score">
                            <span className="leaderboard__entry-score-icon">⭐</span>
                            {currentUserEntry.score.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {entries.length === 0 && (
                <div className="leaderboard__empty">
                    <span className="leaderboard__empty-icon">🎮</span>
                    <p>Nenhum jogador no ranking ainda.</p>
                    <p>Seja o primeiro!</p>
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
