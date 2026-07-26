import { Link } from 'react-router-dom';
import { useGamification } from '../../hooks/useGamification';
import { useProgress } from '../../hooks/useProgress';
import type { UserData } from '../../types/question';

interface UserDashboardProps {
    userData: UserData;
}

/**
 * Painel do usuário na página inicial
 * Isolado para evitar re-renderização de conteúdo estático da HomePage
 */
export function UserDashboard({ userData }: UserDashboardProps) {
    const { currentLevel, levelProgress, streak } = useGamification();
    const { stats: progressStats } = useProgress();

    // Preload Pyodide script on hover for faster game start
    const handlePreload = () => {
        if (!document.querySelector('script[src*="pyodide"]')) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(link);
        }
    };

    return (
        <section className="user-progress">
            <div className="user-progress__header">
                <h2 className="user-progress__title">
                    👋 Olá, {userData.displayName}!
                </h2>
                <p className="user-progress__subtitle">Aqui está seu progresso</p>
            </div>

            <div className="user-progress__grid">
                {/* Level Card */}
                <div className="progress-card progress-card--level">
                    <span className="progress-card__icon" aria-hidden="true">{currentLevel.icon}</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">Nível {currentLevel.level}</span>
                        <span className="progress-card__value">{currentLevel.name}</span>
                        <div className="xp-bar" role="progressbar" aria-valuenow={Math.round(levelProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do nível">
                            <div
                                className="xp-bar__fill"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                        <span className="progress-card__detail">
                            {currentLevel.maxXP === Infinity
                                ? 'Nível máximo!'
                                : `${Math.round(levelProgress)}% para o próximo nível`}
                        </span>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="progress-card progress-card--streak">
                    <span className="progress-card__icon" aria-hidden="true">🔥</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">Ofensiva</span>
                        <span className="progress-card__value">{streak.currentStreak} dias</span>
                        <span className="progress-card__detail">
                            Recorde: {streak.longestStreak} dias
                        </span>
                    </div>
                </div>

                {/* Stars Card */}
                <div className="progress-card progress-card--stars">
                    <span className="progress-card__icon" aria-hidden="true">⭐</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">Estrelas</span>
                        <span className="progress-card__value">{userData.balance || 0}</span>
                        <span className="progress-card__detail">
                            Total ganho: {userData.totalScore || 0}
                        </span>
                    </div>
                </div>

                {/* Questions Card */}
                <div className="progress-card progress-card--questions">
                    <span className="progress-card__icon" aria-hidden="true">✅</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">Questões</span>
                        <span className="progress-card__value">{progressStats.completed}</span>
                        <span className="progress-card__detail">
                            completadas
                        </span>
                    </div>
                </div>
            </div>

            <div className="user-progress__cta">
                <Link to="/game" className="hero__btn hero__btn--primary" onMouseEnter={handlePreload} onFocus={handlePreload}>
                    🎮 Jogar Agora
                </Link>
                <Link to="/profile" className="hero__btn hero__btn--secondary" aria-label="Acessar Perfil">
                    👤 Meu Perfil
                </Link>
            </div>
        </section>
    );
}
