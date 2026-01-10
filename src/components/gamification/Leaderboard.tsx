import { useMemo } from 'react';
import type { UserData } from '../../types/question';
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
    // Dados mockados para simular uma comunidade ativa
    const mockUsers = useMemo(() => [
        { id: 'bot1', name: 'Ana Code', avatar: '👩‍💻', score: 2500 },
        { id: 'bot2', name: 'Pedro Python', avatar: '🐍', score: 1800 },
        { id: 'bot3', name: 'Lucas Loop', avatar: '🔄', score: 1200 },
        { id: 'bot4', name: 'Maria Matriz', avatar: '🔢', score: 950 },
        { id: 'bot5', name: 'João Java', avatar: '☕', score: 800 },
    ], []);

    const leaderboardData = useMemo(() => {
        let allUsers = [...mockUsers];

        // Se o usuário atual existe e não está na lista (pelo ID), adiciona-o
        if (currentUser) {
            // Remove mocks se tiverem mesmo ID (improvável, mas boa prática)
            allUsers = allUsers.filter(u => u.id !== currentUser.uid);

            allUsers.push({
                id: currentUser.uid,
                name: currentUser.displayName || 'Você',
                avatar: currentUser.avatar && currentUser.avatar.length < 5 ? currentUser.avatar : '🧑‍💻', // Simple emoji fallback checks
                score: currentUser.totalScore || 0
            });
        }

        // Ordena por score decrescente
        allUsers.sort((a, b) => b.score - a.score);

        // Adiciona rank e flag de usuário atual
        return allUsers.map((user, index) => ({
            ...user,
            rank: index + 1,
            isCurrentUser: currentUser ? user.id === currentUser.uid : false
        } as LeaderboardEntry));
    }, [currentUser, mockUsers]);

    return (
        <div className="leaderboard">
            <h2 className="leaderboard-title">🏆 Ranking Global</h2>
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

            <div className="leaderboard-footer">
                <p>O ranking é atualizado toda semana! Continue jogando para subir! 🚀</p>
            </div>
        </div>
    );
}
