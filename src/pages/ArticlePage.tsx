/**
 * Página de Artigo Individual
 * Exibe o conteúdo completo de um artigo educacional
 */
import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getArticleBySlug, getRelatedArticles, type Article } from '../data/learnData'
import './ArticlePage.css'

export function ArticlePage() {
    const { slug } = useParams<{ slug: string }>()
    const article = slug ? getArticleBySlug(slug) : undefined
    const relatedArticles = slug ? getRelatedArticles(slug, 3) : []

    // Scroll to top quando artigo muda
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [slug])

    // Atualiza title e meta description para SEO
    useEffect(() => {
        if (article) {
            document.title = `${article.title} | PyExplorer`

            // Atualiza meta description
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
                metaDescription.setAttribute('content', article.description)
            }
        }

        return () => {
            // Restaura título original ao sair
            document.title = 'PyExplorer - Aprenda Python Jogando! | Curso Grátis de Programação para Crianças 🐍'
        }
    }, [article])

    if (!article) {
        return <Navigate to="/learn" replace />
    }

    return (
        <article className="article-page">
            {/* Breadcrumb */}
            <nav className="article-breadcrumb">
                <Link to="/">Início</Link>
                <span>/</span>
                <Link to="/learn">Aprender</Link>
                <span>/</span>
                <span>{article.title}</span>
            </nav>

            {/* Header do Artigo */}
            <header className="article-header">
                <span className="article-header__icon">{article.icon}</span>
                <h1 className="article-header__title">{article.title}</h1>
                <p className="article-header__description">{article.description}</p>
                <div className="article-header__meta">
                    <span>⏱️ {article.readTime} min de leitura</span>
                    <span>📅 {formatDate(article.publishedAt)}</span>
                    <span>{getCategoryLabel(article.category)}</span>
                </div>
            </header>

            {/* Conteúdo do Artigo */}
            <div className="article-content">
                <MarkdownContent content={article.content} />
            </div>

            {/* CTA */}
            <section className="article-cta">
                <div className="article-cta__content">
                    <h2>🎮 Hora de Praticar!</h2>
                    <p>Coloque em prática o que você aprendeu neste artigo!</p>
                    <Link to="/game" className="article-cta__button">
                        Jogar PyExplorer
                    </Link>
                </div>
            </section>

            {/* Artigos Relacionados */}
            {relatedArticles.length > 0 && (
                <section className="article-related">
                    <h2>📚 Continue Aprendendo</h2>
                    <div className="article-related__grid">
                        {relatedArticles.map(related => (
                            <Link
                                key={related.id}
                                to={`/learn/${related.slug}`}
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
                <Link to="/learn" className="article-back__link">
                    ← Voltar para Artigos
                </Link>
            </div>
        </article>
    )
}

/**
 * Renderiza conteúdo Markdown simples
 */
function MarkdownContent({ content }: { content: string }) {
    // Converte markdown básico para HTML
    const html = content
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        // Code blocks
        .replace(/```python\n([\s\S]*?)```/gim, '<pre class="code-block code-block--python"><code>$1</code></pre>')
        .replace(/```java\n([\s\S]*?)```/gim, '<pre class="code-block code-block--java"><code>$1</code></pre>')
        .replace(/```([\s\S]*?)```/gim, '<pre class="code-block"><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>')
        // Lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Checkmarks
        .replace(/^- ✅ (.*$)/gim, '<li class="check">✅ $1</li>')
        // Line breaks
        .replace(/\n\n/gim, '</p><p>')
        // Tables (simplified)
        .replace(/\|(.+)\|/gim, (match) => {
            const cells = match.split('|').filter(c => c.trim())
            return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`
        })

    return (
        <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
        />
    )
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
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
