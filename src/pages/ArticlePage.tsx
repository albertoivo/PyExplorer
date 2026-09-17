import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useArticleBySlug, useRelatedArticles } from '../data/learnData';
import { SEO } from '../components/common/SEO';
import { parseMarkdown } from '../utils/markdownParser';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath, formatLocalizedPath } from '../hooks/useLocalizedPath';
import './ArticlePage.css';

export function ArticlePage() {
    const { t, i18n } = useTranslation(['learn', 'common']);
    const { slug } = useParams<{ slug: string }>();
    const article = useArticleBySlug(slug);
    const relatedArticles = useRelatedArticles(slug, 3);
    const navigate = useNavigate();
    const { getLocalizedPath, currentLang } = useLocalizedPath();
    const contentRef = useRef<HTMLDivElement>(null);

    // Intercepta cliques em links internos para evitar reload e aplicar prefixo de idioma
    useEffect(() => {
        const handleInternalLinks = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href) {
                const url = new URL(anchor.href);
                const isInternal = url.origin === window.location.origin;

                if (isInternal) {
                    e.preventDefault();
                    const localizedTarget = formatLocalizedPath(url.pathname, currentLang) + url.search + url.hash;
                    navigate(localizedTarget);
                }
            }
        };

        const content = contentRef.current;
        if (content) {
            content.addEventListener('click', handleInternalLinks);
            return () => content.removeEventListener('click', handleInternalLinks);
        }
    }, [navigate, currentLang]);

    // Scroll to top quando artigo muda
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!article) {
        return <Navigate to={getLocalizedPath('/learn')} replace />;
    }

    const localizedArticlePath = getLocalizedPath(`/learn/${article.slug}`);
    const articleUrl = `https://pyexplorer.com.br${localizedArticlePath}`;
    const homeUrl = `https://pyexplorer.com.br${getLocalizedPath('/') === '/' ? '' : getLocalizedPath('/')}`;
    const learnUrl = `https://pyexplorer.com.br${getLocalizedPath('/learn')}`;

    const structuredData: Record<string, unknown>[] = [
        {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.description,
            "datePublished": article.publishedAt,
            "dateModified": article.updatedAt || article.publishedAt,
            "author": {
                "@type": "Organization",
                "name": "PyExplorer"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": t('common:nav.home', 'Início'), "item": homeUrl },
                { "@type": "ListItem", "position": 2, "name": t('learn:breadcrumb', 'Aprender'), "item": learnUrl },
                { "@type": "ListItem", "position": 3, "name": article.title, "item": articleUrl }
            ]
        }
    ];

    if (article.faqs && article.faqs.length > 0) {
        structuredData.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": article.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        });
    }

    return (
        <article className="article-page">
            <SEO
                title={article.title}
                description={article.description}
                type="article"
                structuredData={structuredData}
                keywords={article.keywords}
            />
            {/* Breadcrumb */}
            <nav className="article-breadcrumb">
                <Link to={getLocalizedPath('/')}>{t('common:nav.home', 'Início')}</Link>
                <span>/</span>
                <Link to={getLocalizedPath('/learn')}>{t('learn:breadcrumb', 'Aprender')}</Link>
                <span>/</span>
                <span>{article.title}</span>
            </nav>

            {/* Header do Artigo */}
            <header className="article-header">
                <span className="article-header__icon">{article.icon}</span>
                <h1 className="article-header__title">{article.title}</h1>
                <p className="article-header__description">{article.description}</p>
                <div className="article-header__meta">
                    <span>{t('learn:article.readTimeMin', { minutes: article.readTime, defaultValue: `⏱️ ${article.readTime} min de leitura` })}</span>
                    <span>📅 {formatDate(article.publishedAt, i18n.language)}</span>
                    <span>{t(`learn:categories.${article.category}` as never)}</span>
                </div>
            </header>

            {/* Conteúdo do Artigo */}
            <div className="article-content" ref={contentRef}>
                <MarkdownContent content={article.content} />
            </div>

            {/* CTA */}
            <section className="article-cta">
                <div className="article-cta__content">
                    <h2>{t('learn:article.practiceNow', '🎮 Hora de Praticar!')}</h2>
                    <p>{t('learn:article.practiceDescription', 'Coloque em prática o que você aprendeu neste artigo!')}</p>
                    <Link to={getLocalizedPath('/game')} className="article-cta__button">
                        {t('learn:cta.button', 'Jogar PyExplorer')}
                    </Link>
                </div>
            </section>

            {/* Artigos Relacionados */}
            {relatedArticles.length > 0 && (
                <section className="article-related">
                    <h2>{t('learn:article.continueLearning', '📚 Continue Aprendendo')}</h2>
                    <div className="article-related__grid">
                        {relatedArticles.map(related => (
                            <Link
                                key={related.id}
                                to={getLocalizedPath(`/learn/${related.slug}`)}
                                className="article-related__card"
                            >
                                <span className="article-related__icon">{related.icon}</span>
                                <h3>{related.title}</h3>
                                <span>⏱️ {related.readTime} min</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Voltar */}
            <div className="article-back">
                <Link to={getLocalizedPath('/learn')} className="article-back__link">
                    {t('learn:article.backToArticles', '← Voltar para Artigos')}
                </Link>
            </div>
        </article>
    );
}

/**
 * Renderiza conteúdo Markdown simples
 */
function MarkdownContent({ content }: { content: string }) {
    const html = parseMarkdown(content);
    return (
        <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function formatDate(dateStr: string, locale: string = 'pt-BR'): string {
    const date = new Date(dateStr);
    const resolvedLocale = locale.startsWith('en') ? 'en-US' : locale.startsWith('es') ? 'es-ES' : locale.startsWith('hi') ? 'hi-IN' : 'pt-BR';
    return date.toLocaleDateString(resolvedLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}


