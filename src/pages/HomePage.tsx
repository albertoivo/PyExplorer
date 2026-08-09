import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { SEO } from '../components/common/SEO';
import { WORLDS } from '../data/worlds';
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
                title={seoTitle || "Aprenda Python Jogando"}
                description={seoDescription || "O melhor jogo educativo para crianças aprenderem Python. 100% Grátis, Seguro e Divertido!"}
                breadcrumbs={[
                    { name: "Início", path: "/" }
                ]}
            />
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__content">
                    <div className="hero__badge">🎓 Educativo e Divertido</div>
                    <h1 className="hero__title">
                        Aprenda <span className="hero__highlight">Python</span>
                        <br />
                        como um Herói! 🦸‍♂️
                    </h1>
                    <p className="hero__description">
                        Embarque em uma aventura incrível pelos mundos da programação!
                        Resolva desafios, ganhe estrelas e se torne um mestre em Python!
                    </p>

                    <div className="hero__actions">
                        {userData ? (
                            <Link to="/game" className="hero__btn hero__btn--primary" onMouseEnter={handlePreload} onFocus={handlePreload}>
                                🚀 Continuar Aventura
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="hero__btn hero__btn--primary">
                                    🎮 Começar a Jogar
                                </Link>
                                <Link to="/login" className="hero__btn hero__btn--secondary">
                                    Já tenho conta
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
                <h2 className="features__title">Por que o PyExplorer é Especial?</h2>

                <div className="features__grid">
                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">🎯</div>
                        <h3 className="feature-card__title">Questões Interativas</h3>
                        <p className="feature-card__description">Múltipla escolha, verdadeiro/falso, complete o código e mais!</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">🌍</div>
                        <h3 className="feature-card__title">11 Mundos para Explorar</h3>
                        <p className="feature-card__description">Desbloqueie novos mundos conforme avança!</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">💻</div>
                        <h3 className="feature-card__title">Python no Navegador</h3>
                        <p className="feature-card__description">Execute código Python de verdade sem instalar nada!</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">⭐</div>
                        <h3 className="feature-card__title">Ganhe Estrelas</h3>
                        <p className="feature-card__description">Complete desafios e acumule pontos!</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">📚</div>
                        <h3 className="feature-card__title">Aprenda Jogando</h3>
                        <p className="feature-card__description">Conceitos explicados de forma simples e divertida!</p>
                    </article>

                    <article className="feature-card">
                        <div className="feature-card__icon" aria-hidden="true">🔒</div>
                        <h3 className="feature-card__title">Seguro para Crianças</h3>
                        <p className="feature-card__description">Ambiente seguro para todas as idades!</p>
                    </article>
                </div>
            </section>

            {/* Worlds Preview */}
            <section className="worlds-preview">
                <h2 className="worlds-preview__title">Mundos do PyExplorer</h2>

                <div className="worlds-preview__list">
                    {WORLDS.map((world, index) => (
                        <div
                            key={world.id}
                            className={`world-preview ${index > 0 ? 'world-preview--locked' : ''}`}
                            title={world.description}
                        >
                            <span className="world-preview__icon" aria-hidden="true">{world.icon}</span>
                            <span className="world-preview__name">{world.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Learn Section Preview */}
            <section className="features" style={{ background: 'var(--bg-secondary)', marginTop: '0' }}>
                <h2 className="features__title">Aprenda Python Gratuitamente 📚</h2>
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    <p>Confira nossos guias e tutoriais completos para iniciantes e pais.</p>
                </div>

                <div className="features__grid">
                    <Link to="/learn/o-que-e-python" className="feature-card feature-card--link">
                        <div className="feature-card__icon" aria-hidden="true">🐍</div>
                        <h3 className="feature-card__title">O que é Python?</h3>
                        <p className="feature-card__description">Entenda por que essa é a melhor linguagem para começar.</p>
                    </Link>

                    <Link to="/learn/python-para-criancas" className="feature-card feature-card--link">
                        <div className="feature-card__icon" aria-hidden="true">👨‍👩‍👧‍👦</div>
                        <h3 className="feature-card__title">Guia para Pais</h3>
                        <p className="feature-card__description">Como ajudar seu filho a aprender programação.</p>
                    </Link>

                    <Link to="/learn/primeiros-passos-python" className="feature-card feature-card--link">
                        <div className="feature-card__icon" aria-hidden="true">👣</div>
                        <h3 className="feature-card__title">Primeiros Passos</h3>
                        <p className="feature-card__description">Seu primeiro tutorial prático de Python.</p>
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/learn" className="hero__btn hero__btn--secondary">
                        📖 Ver Todos os Artigos
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta__content">
                    <h2 className="cta__title">Pronto para começar sua aventura?</h2>
                    <p className="cta__description">
                        Junte-se a milhares de crianças aprendendo Python de forma divertida!
                    </p>
                    {!userData && (
                        <Link to="/register" className="cta__btn">
                            🎮 Criar Conta Grátis
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}

