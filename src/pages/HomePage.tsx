import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { SEO } from '../components/common/SEO';
import { WORLDS } from '../data/worlds';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

interface HomePageProps {
    seoTitle?: string;
    seoDescription?: string;
}

/**
 * Página inicial do PyExplorer
 */
export function HomePage({ seoTitle, seoDescription }: HomePageProps) {
    const { userData } = useAuth();
    const [animateHero, setAnimateHero] = useState(false);
    const { t } = useTranslation(['home', 'worlds']);

    useEffect(() => {
        // Safe animation mode: em mobile evitamos animar a ilustração da hero
        // para reduzir custo de renderização no PSI mobile.
        if (window.matchMedia('(max-width: 768px)').matches) {
            return;
        }

        const runAfterIdle = () => {
            setAnimateHero(true);
        };

        if ('requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(runAfterIdle, { timeout: 1200 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = setTimeout(runAfterIdle, 600);
        return () => clearTimeout(timeoutId);
    }, []);

    // Preload Pyodide script on hover for faster game start
    // Uses direct script injection since HomePage is outside PyodideProvider
    const handlePreload = () => {
        if (!document.querySelector('script[src*="pyodide"]')) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(link);
        }
    };

    return (
        <div className={`home-page ${animateHero ? 'home-page--animate-hero' : ''}`}>
            <SEO
                title={seoTitle || t('seo.title')}
                description={seoDescription || t('seo.description')}
                breadcrumbs={[
                    { name: t('breadcrumb'), path: "/" }
                ]}
            />
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__content">
                    <div className="hero__badge">{t('hero.badge')}</div>
                    <h1 className="hero__title">
                        {t('hero.titlePrefix')} <span className="hero__highlight">{t('hero.titlePython')}</span>
                        <br />
                        {t('hero.titleSuffix')}
                    </h1>
                    <p className="hero__description">
                        {t('hero.description')}
                    </p>

                    <div className="hero__actions">
                        {userData ? (
                            <Link to="/game" className="hero__btn hero__btn--primary" onMouseEnter={handlePreload} onFocus={handlePreload}>
                                {t('hero.continueAdventure')}
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="hero__btn hero__btn--primary">
                                    {t('hero.startPlaying')}
                                </Link>
                                <Link to="/login" className="hero__btn hero__btn--secondary">
                                    {t('hero.haveAccount')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="hero__illustration" aria-hidden="true">
                    <span className="hero__snake">🐍</span>
                </div>
            </section>

            {/* User Progress Section - Only for logged-in users */}
            {userData && <UserDashboard userData={userData} />}

            {/* Features Section */}
            <section className="features">
                <h2 className="features__title">{t('features.title')}</h2>

                <div className="features__grid">
                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">🎯</div>
                        <h3 className="feature-card__title">{t('features.interactiveQuestions')}</h3>
                        <p className="feature-card__description">{t('features.interactiveQuestionsDesc')}</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">🌍</div>
                        <h3 className="feature-card__title">{t('features.worlds')}</h3>
                        <p className="feature-card__description">{t('features.worldsDesc')}</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">💻</div>
                        <h3 className="feature-card__title">{t('features.pythonInBrowser')}</h3>
                        <p className="feature-card__description">{t('features.pythonInBrowserDesc')}</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">⭐</div>
                        <h3 className="feature-card__title">{t('features.earnStars')}</h3>
                        <p className="feature-card__description">{t('features.earnStarsDesc')}</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">📚</div>
                        <h3 className="feature-card__title">{t('features.learnPlaying')}</h3>
                        <p className="feature-card__description">{t('features.learnPlayingDesc')}</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">🔒</div>
                        <h3 className="feature-card__title">{t('features.safeForKids')}</h3>
                        <p className="feature-card__description">{t('features.safeForKidsDesc')}</p>
                    </article>
                </div>
            </section>

            {/* Worlds Preview */}
            <section className="worlds-preview">
                <h2 className="worlds-preview__title">{t('worldsPreview.title')}</h2>

                <div className="worlds-preview__list">
                    {WORLDS.map((world, index) => (
                        <div
                            key={world.id}
                            className={`world-preview ${index > 0 ? 'world-preview--locked' : ''}`}
                            title={t(`worlds:${world.id}.description`, world.description)}
                        >
                            <span className="world-preview__icon" aria-hidden="true">{world.icon}</span>
                            <span className="world-preview__name">{t(`worlds:${world.id}.name`, world.name)}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Learn Section Preview */}
            <section className="features" style={{ background: 'var(--bg-secondary)', marginTop: '0' }}>
                <h2 className="features__title">{t('learnSection.title')}</h2>
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    <p>{t('learnSection.subtitle')}</p>
                </div>

                <div className="features__grid">
                    <Link to="/learn/o-que-e-python" className="feature-card feature-card--link">
                        <div className="feature-card__icon" aria-hidden="true">🐍</div>
                        <h3 className="feature-card__title">{t('learnSection.whatIsPython')}</h3>
                        <p className="feature-card__description">{t('learnSection.whatIsPythonDesc')}</p>
                    </Link>

                    <Link to="/learn/python-para-criancas" className="feature-card feature-card--link">
                        <div className="feature-card__icon" aria-hidden="true">👨‍👩‍👧‍👦</div>
                        <h3 className="feature-card__title">{t('learnSection.parentGuide')}</h3>
                        <p className="feature-card__description">{t('learnSection.parentGuideDesc')}</p>
                    </Link>

                    <Link to="/learn/primeiros-passos-python" className="feature-card feature-card--link">
                        <div className="feature-card__icon" aria-hidden="true">👣</div>
                        <h3 className="feature-card__title">{t('learnSection.firstSteps')}</h3>
                        <p className="feature-card__description">{t('learnSection.firstStepsDesc')}</p>
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/learn" className="hero__btn hero__btn--secondary">
                        {t('learnSection.viewAllArticles')}
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta__content">
                    <h2 className="cta__title">{t('cta.title')}</h2>
                    <p className="cta__description">
                        {t('cta.description')}
                    </p>
                    {!userData && (
                        <Link to="/register" className="cta__btn">
                            {t('cta.createAccount')}
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}

