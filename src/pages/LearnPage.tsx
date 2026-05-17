/**
 * Página de Aprendizado - Lista de artigos educacionais
 * Conteúdo SEO-friendly sobre Python para crianças
 */
import { Link } from 'react-router-dom'
import { ARTICLES, type Article } from '../data/learnData'
import { SEO } from '../components/common/SEO'
import './LearnPage.css'

export function LearnPage() {
    const beginnerArticles = ARTICLES.filter(a => a.category === 'beginner')
    const parentArticles = ARTICLES.filter(a => a.category === 'parents')
    const tipArticles = ARTICLES.filter(a => a.category === 'tips')

    return (
        <div className="learn-page">
            <SEO title="Aprenda Python" description="Aprenda Python do zero com tutoriais gratuitos em português. Guias interativos para crianças, iniciantes e materiais de apoio para pais." />
            {/* Hero Section */}
            <section className="learn-hero">
                <div className="learn-hero__content">
                    <h1 className="learn-hero__title">
                        📚 Aprenda Python
                    </h1>
                    <p className="learn-hero__subtitle">
                        Artigos, tutoriais e dicas para dominar Python do zero!
                    </p>
                </div>
            </section>

            {/* Artigos para Iniciantes */}
            <section className="learn-section">
                <h2 className="learn-section__title">
                    🎯 Para Iniciantes
                </h2>
                <p className="learn-section__description">
                    Nunca programou? Comece por aqui!
                </p>
                <div className="learn-grid">
                    {beginnerArticles.map(article => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </section>

            {/* Artigos para Pais */}
            {parentArticles.length > 0 && (
                <section className="learn-section">
                    <h2 className="learn-section__title">
                        👨‍👩‍👧‍👦 Para Pais e Educadores
                    </h2>
                    <p className="learn-section__description">
                        Guias para apoiar crianças no aprendizado de programação
                    </p>
                    <div className="learn-grid">
                        {parentArticles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </section>
            )}

            {/* Dicas e Curiosidades */}
            {tipArticles.length > 0 && (
                <section className="learn-section">
                    <h2 className="learn-section__title">
                        💡 Dicas e Curiosidades
                    </h2>
                    <p className="learn-section__description">
                        Recursos extras para turbinar seu aprendizado
                    </p>
                    <div className="learn-grid">
                        {tipArticles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="learn-cta">
                <div className="learn-cta__content">
                    <h2>🎮 Pronto para Praticar?</h2>
                    <p>Aplique o que aprendeu nos desafios do PyExplorer!</p>
                    <Link to="/game" className="learn-cta__button">
                        Jogar Agora
                    </Link>
                </div>
            </section>
        </div>
    )
}

/**
 * Card de artigo
 */
function ArticleCard({ article }: { article: Article }) {
    return (
        <Link to={`/learn/${article.slug}`} className="article-card">
            <div className="article-card__icon">{article.icon}</div>
            <div className="article-card__content">
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__description">{article.description}</p>
                <div className="article-card__meta">
                    <span className="article-card__time">
                        ⏱️ {article.readTime} min de leitura
                    </span>
                    <span className="article-card__category">
                        {getCategoryLabel(article.category)}
                    </span>
                </div>
            </div>
        </Link>
    )
}

function getCategoryLabel(category: Article['category']): string {
    const labels = {
        beginner: '🌱 Iniciante',
        intermediate: '📈 Intermediário',
        tips: '💡 Dica',
        parents: '👪 Para Pais'
    }
    return labels[category]
}
