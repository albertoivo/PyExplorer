import { useMemo, useState, useEffect } from 'react';
import type { UserData } from '../../types/question';
import { getTopUsers } from '../../firebase/firestore';
import './Leaderboard.css';

interface LeaderboardProps {
    currentUser: UserData | null;
}

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    avatar: string;
    score: number;
    isCurrentUser: boolean;
}

export function Leaderboard({ currentUser }: LeaderboardProps) {
    const [topUsers, setTopUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carrega os top usuários do Firestore
    useEffect(() => {
        async function loadTopUsers() {
            try {
                setLoading(true);
                const users = await getTopUsers(10);
                setTopUsers(users);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar leaderboard:', err);
                setError('Não foi possível carregar o ranking.');
            } finally {
                setLoading(false);
            }
        }
        loadTopUsers();
    }, []);

    const leaderboardData = useMemo(() => {
        const allUsers = topUsers.map(user => ({
            id: user.uid,
            name: user.displayName || 'Jogador',
            avatar: user.avatar && user.avatar.length < 5 ? user.avatar : '🧑‍💻',
            score: user.totalScore || 0,
        }));

        // Se o usuário atual existe e não está na lista, adiciona-o
        if (currentUser) {
            const alreadyInList = allUsers.some(u => u.id === currentUser.uid);
            if (!alreadyInList) {
                allUsers.push({
                    id: currentUser.uid,
                    name: currentUser.displayName || 'Você',
                    avatar: currentUser.avatar && currentUser.avatar.length < 5 ? currentUser.avatar : '🧑‍💻',
                    score: currentUser.totalScore || 0
                });
            }
        }

        // Ordena por score decrescente
        allUsers.sort((a, b) => b.score - a.score);

        // Adiciona rank e flag de usuário atual
        return allUsers.map((user, index) => ({
            ...user,
            rank: index + 1,
            isCurrentUser: currentUser ? user.id === currentUser.uid : false
        } as LeaderboardEntry));
    }, [currentUser, topUsers]);

    if (loading) {
        return (
            <div className="leaderboard">
                <h2 className="leaderboard-title">🏆 Ranking Global</h2>
                <div className="leaderboard-loading">
                    <span>⏳</span>
                    <p>Carregando ranking...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard">
                <h2 className="leaderboard-title">🏆 Ranking Global</h2>
                <div className="leaderboard-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard">
            <h2 className="leaderboard-title">🏆 Ranking Global</h2>
            {leaderboardData.length === 0 ? (
                <div className="leaderboard-empty">
                    <span>🎮</span>
                    <p>Nenhum jogador no ranking ainda. Seja o primeiro!</p>
                </div>
            ) : (
                <div className="leaderboard-list">
                    {leaderboardData.map((entry) => (
                        <div
                            key={entry.id}
                            className={`leaderboard-item ${entry.isCurrentUser ? 'current-user' : ''}`}
                        >
                            <div className="rank-badge">
                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                            </div>
                            <div className="player-info">
                                <span className="player-avatar">{entry.avatar}</span>
                                <span className="player-name">
                                    {entry.name} {entry.isCurrentUser && '(Você)'}
                                </span>
                            </div>
                            <div className="player-score">
                                {entry.score} ⭐
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="leaderboard-footer">
                <p>O ranking mostra os jogadores com maior pontuação! 🚀</p>
            </div>
        </div>
    );
}

