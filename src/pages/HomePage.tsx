import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

/**
 * Página inicial do PyExplorer
 */
export function HomePage() {
    const { userData } = useAuth();

    return (
        <div className="home-page">
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
                            <Link to="/game" className="hero__btn hero__btn--primary">
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

                <div className="hero__illustration">
                    <div className="hero__snake">🐍</div>
                    <div className="hero__stars">
                        <span className="star star--1">⭐</span>
                        <span className="star star--2">✨</span>
                        <span className="star star--3">🌟</span>
                        <span className="star star--4">💫</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="features__title">Por que o PyExplorer é Especial?</h2>

                <div className="features__grid">
                    <div className="feature-card">
                        <div className="feature-card__icon">🎯</div>
                        <h3 className="feature-card__title">Questões Interativas</h3>
                        <p className="feature-card__description">
                            Múltipla escolha, verdadeiro/falso, complete o código e muito mais!
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-card__icon">🌍</div>
                        <h3 className="feature-card__title">7 Mundos para Explorar</h3>
                        <p className="feature-card__description">
                            Desbloqueie novos mundos conforme avança na sua jornada!
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-card__icon">💻</div>
                        <h3 className="feature-card__title">Python no Navegador</h3>
                        <p className="feature-card__description">
                            Execute código Python de verdade sem instalar nada!
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-card__icon">⭐</div>
                        <h3 className="feature-card__title">Ganhe Estrelas</h3>
                        <p className="feature-card__description">
                            Complete desafios e acumule pontos para subir de nível!
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-card__icon">📚</div>
                        <h3 className="feature-card__title">Aprenda Jogando</h3>
                        <p className="feature-card__description">
                            Conceitos explicados de forma simples e divertida!
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-card__icon">🔒</div>
                        <h3 className="feature-card__title">Seguro para Crianças</h3>
                        <p className="feature-card__description">
                            Ambiente seguro e adequado para todas as idades!
                        </p>
                    </div>
                </div>
            </section>

            {/* Worlds Preview */}
            <section className="worlds-preview">
                <h2 className="worlds-preview__title">Mundos do PyExplorer</h2>

                <div className="worlds-preview__list">
                    <div className="world-preview">
                        <span className="world-preview__icon">🚀</span>
                        <span className="world-preview__name">Primeiros Passos</span>
                    </div>
                    <div className="world-preview world-preview--locked">
                        <span className="world-preview__icon">📦</span>
                        <span className="world-preview__name">Variáveis</span>
                    </div>
                    <div className="world-preview world-preview--locked">
                        <span className="world-preview__icon">🔀</span>
                        <span className="world-preview__name">Decisões</span>
                    </div>
                    <div className="world-preview world-preview--locked">
                        <span className="world-preview__icon">🔄</span>
                        <span className="world-preview__name">Repetição</span>
                    </div>
                </div>
            </section>

            {/* Learn Section Preview */}
            <section className="features" style={{ background: 'var(--bg-secondary)', marginTop: '0' }}>
                <h2 className="features__title">Aprenda Python Gratuitamente 📚</h2>
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    <p>Confira nossos guias e tutoriais completos para iniciantes e pais.</p>
                </div>

                <div className="features__grid">
                    <Link to="/learn/o-que-e-python" className="feature-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="feature-card__icon">🐍</div>
                        <h3 className="feature-card__title">O que é Python?</h3>
                        <p className="feature-card__description">
                            Entenda por que essa é a melhor linguagem para começar.
                        </p>
                    </Link>

                    <Link to="/learn/python-para-criancas" className="feature-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="feature-card__icon">👨‍👩‍👧‍👦</div>
                        <h3 className="feature-card__title">Guia para Pais</h3>
                        <p className="feature-card__description">
                            Como ajudar seu filho a aprender programação.
                        </p>
                    </Link>

                    <Link to="/learn/primeiros-passos-python" className="feature-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                        <div className="feature-card__icon">👣</div>
                        <h3 className="feature-card__title">Primeiros Passos</h3>
                        <p className="feature-card__description">
                            Seu primeiro tutorial prático de Python.
                        </p>
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

export default HomePage;
