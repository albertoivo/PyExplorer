/**
 * Página de Aprendizado - Lista de artigos educacionais
 * Conteúdo SEO-friendly sobre Python para crianças
 */
import { Link } from 'react-router-dom'
import { useArticles, type Article } from '../data/learnData'
import { SEO } from '../components/common/SEO'
import { useTranslation } from 'react-i18next'
import { useLocalizedPath } from '../hooks/useLocalizedPath'
import './LearnPage.css'

export function LearnPage() {
    const { t } = useTranslation('learn');
    const { getLocalizedPath } = useLocalizedPath();
    const articles = useArticles();
    const beginnerArticles = articles.filter(a => a.category === 'beginner')
    const parentArticles = articles.filter(a => a.category === 'parents')
    const tipArticles = articles.filter(a => a.category === 'tips')

    return (
        <div className="learn-page">
            <SEO
                title={t('seoTitle')}
                description={t('seoDescription')}
                breadcrumbs={[
                    { name: t('common:nav.home', "Início"), path: getLocalizedPath("/") },
                    { name: t('breadcrumb'), path: getLocalizedPath("/learn") }
                ]}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": t('seoTitle'),
                    "description": t('seoDescription'),
                    "url": `https://pyexplorer.com.br${getLocalizedPath('/learn') === '/' ? '' : getLocalizedPath('/learn')}`,
                    "mainEntity": {
                        "@type": "ItemList",
                        "itemListElement": articles.map((article, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "name": article.title,
                            "url": `https://pyexplorer.com.br${getLocalizedPath(`/learn/${article.slug}`)}`
                        }))
                    }
                }}
            />
            {/* Hero Section */}
            <section className="learn-hero">
                <div className="learn-hero__content">
                    <h1 className="learn-hero__title">
                        {t('heroTitle')}
                    </h1>
                    <p className="learn-hero__subtitle">
                        {t('heroSubtitle')}
                    </p>
                </div>
            </section>

            {/* Artigos para Iniciantes */}
            <section className="learn-section">
                <h2 className="learn-section__title">
                    {t('beginners.title')}
                </h2>
                <p className="learn-section__description">
                    {t('beginners.description')}
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
                        {t('parents.title')}
                    </h2>
                    <p className="learn-section__description">
                        {t('parents.description')}
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
                        {t('tips.title')}
                    </h2>
                    <p className="learn-section__description">
                        {t('tips.description')}
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
                    <h2>{t('cta.title')}</h2>
                    <p>{t('cta.description')}</p>
                    <Link to={getLocalizedPath('/game')} className="learn-cta__button">
                        {t('cta.button')}
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
    const { t } = useTranslation('learn');
    const { getLocalizedPath } = useLocalizedPath();
    return (
        <Link to={getLocalizedPath(`/learn/${article.slug}`)} className="article-card">
            <div className="article-card__icon">{article.icon}</div>
            <div className="article-card__content">
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__description">{article.description}</p>
                <div className="article-card__meta">
                    <span className="article-card__time">
                        {t('article.readTimeMin', { minutes: article.readTime })}
                    </span>
                    <span className="article-card__category">
                        {t(`categories.${article.category}`)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
