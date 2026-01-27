import { useEffect, useMemo, useState } from 'react';
import type { LeaderboardEntry } from '../../../types/gamification';
import { getTopUsers } from '../../../firebase/firestore';
import './Leaderboard.css';

interface LeaderboardProps {
    currentUserId?: string;
}

const RANK_EMOJIS: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
};

/**
 * Leaderboard / Ranking de jogadores
 * Busca dados automaticamente do Firestore
 */
export function Leaderboard({ currentUserId }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch leaderboard data from Firestore
    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                setLoading(true);
                setError(null);

                const users = await getTopUsers(20);

                const leaderboardEntries: LeaderboardEntry[] = users.map((user, index) => ({
                    rank: index + 1,
                    uid: user.uid,
                    displayName: user.displayName || 'Jogador',
                    avatar: user.avatar && user.avatar.length < 5 ? user.avatar : '🧑‍💻',
                    totalScore: user.totalScore || 0,
                    level: user.level || 1,
                    isCurrentUser: user.uid === currentUserId,
                }));

                setEntries(leaderboardEntries);
            } catch (err) {
                console.error('Erro ao carregar leaderboard:', err);
                setError('Não foi possível carregar o ranking.');
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, [currentUserId]);

    // Find current user position
    const currentUserEntry = useMemo(() =>
        entries.find(e => e.uid === currentUserId),
        [entries, currentUserId]
    );
    const currentUserRank = currentUserEntry?.rank;

    // Loading state
    if (loading) {
        return (
            <div className="leaderboard">
                <h2 className="leaderboard__title">🏆 Ranking</h2>
                <div className="leaderboard__loading">
                    <span className="leaderboard__loading-icon">⏳</span>
                    <p>Carregando ranking...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="leaderboard">
                <h2 className="leaderboard__title">🏆 Ranking</h2>
                <div className="leaderboard__error">
                    <span className="leaderboard__error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard">
            <h2 className="leaderboard__title">🏆 Ranking</h2>

            {entries.length === 0 ? (
                <div className="leaderboard__empty">
                    <span className="leaderboard__empty-icon">🎮</span>
                    <p>Nenhum jogador no ranking ainda.</p>
                    <p>Seja o primeiro!</p>
                </div>
            ) : (
                <>
                    {/* Top 3 com destaque (pódio) */}
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
                                    {entry.totalScore.toLocaleString()}
                                </div>
                                {/* <div className="podium-card__level">Nível {entry.level}</div> */}
                            </div>
                        ))}
                    </div>

                    {/* Lista do restante (posições 4+) */}
                    {entries.length > 3 && (
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
                                        {/* <span className="leaderboard__entry-level">Nível {entry.level}</span> */}
                                    </div>
                                    <div className="leaderboard__entry-score">
                                        <span className="leaderboard__entry-score-icon">⭐</span>
                                        {entry.totalScore.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
                                    {currentUserEntry.totalScore.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Leaderboard;
