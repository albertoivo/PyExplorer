import { Link } from 'react-router-dom';
import { useGamification } from '../../hooks/useGamification';
import { useProgress } from '../../hooks/useProgress';
import type { UserData } from '../../types/question';
import { useTranslation } from 'react-i18next';

interface UserDashboardProps {
    userData: UserData;
}

/**
 * Painel do usuário na página inicial
 * Isolado para evitar re-renderização de conteúdo estático da HomePage
 */
export function UserDashboard({ userData }: UserDashboardProps) {
    const { t } = useTranslation(['home', 'gamification']);
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
                    {t('home:dashboard.greeting', { name: userData.displayName, defaultValue: `👋 Olá, ${userData.displayName}!` })}
                </h2>
                <p className="user-progress__subtitle">{t('home:dashboard.subtitle', 'Aqui está seu progresso')}</p>
            </div>

            <div className="user-progress__grid">
                {/* Level Card */}
                <div className="progress-card progress-card--level">
                    <span className="progress-card__icon" aria-hidden="true">{currentLevel.icon}</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">
                            {t('home:dashboard.level', { level: currentLevel.level, defaultValue: `Nível ${currentLevel.level}` })}
                        </span>
                        <span className="progress-card__value">
                            {currentLevel.name}
                        </span>
                        <div className="xp-bar" role="progressbar" aria-valuenow={Math.round(levelProgress)} aria-valuemin={0} aria-valuemax={100} aria-label={t('common:aria.levelProgress', 'Progresso do nível')}>
                            <div
                                className="xp-bar__fill"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                        <span className="progress-card__detail">
                            {currentLevel.maxXP === Infinity
                                ? t('home:dashboard.levelMax', 'Nível máximo!')
                                : t('home:dashboard.percentToNext', { percent: Math.round(levelProgress), defaultValue: `${Math.round(levelProgress)}% para o próximo nível` })}
                        </span>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="progress-card progress-card--streak">
                    <span className="progress-card__icon" aria-hidden="true">🔥</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">{t('home:dashboard.streak', 'Ofensiva')}</span>
                        <span className="progress-card__value">{t('home:dashboard.streakDays', { count: streak.currentStreak, defaultValue: `${streak.currentStreak} dias` })}</span>
                        <span className="progress-card__detail">
                            {t('home:dashboard.streakRecord', { count: streak.longestStreak, defaultValue: `Recorde: ${streak.longestStreak} dias` })}
                        </span>
                    </div>
                </div>

                {/* Stars Card */}
                <div className="progress-card progress-card--stars">
                    <span className="progress-card__icon" aria-hidden="true">⭐</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">{t('home:dashboard.stars', 'Estrelas')}</span>
                        <span className="progress-card__value">{userData.balance || 0}</span>
                        <span className="progress-card__detail">
                            {t('home:dashboard.totalEarned', { score: userData.totalScore || 0, defaultValue: `Total ganho: ${userData.totalScore || 0}` })}
                        </span>
                    </div>
                </div>

                {/* Questions Card */}
                <div className="progress-card progress-card--questions">
                    <span className="progress-card__icon" aria-hidden="true">✅</span>
                    <div className="progress-card__content">
                        <span className="progress-card__label">{t('home:dashboard.questions', 'Questões')}</span>
                        <span className="progress-card__value">{progressStats.completed}</span>
                        <span className="progress-card__detail">
                            {t('home:dashboard.completed', 'completadas')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="user-progress__cta">
                <Link to="/game" className="hero__btn hero__btn--primary" onMouseEnter={handlePreload} onFocus={handlePreload}>
                    {t('home:dashboard.playNow', '🎮 Jogar Agora')}
                </Link>
                <Link to="/profile" className="hero__btn hero__btn--secondary" aria-label={t('common:aria.accessProfile', 'Acessar Perfil')}>
                    {t('home:dashboard.myProfile', '👤 Meu Perfil')}
                </Link>
            </div>
        </section>
    );
}
