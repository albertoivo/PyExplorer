import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { getArticleBySlug, getRelatedArticles, type Article } from '../data/learnData'
import { SEO } from '../components/common/SEO'
import './ArticlePage.css'

export function ArticlePage() {
    const { slug } = useParams<{ slug: string }>()
    const article = slug ? getArticleBySlug(slug) : undefined
    const relatedArticles = slug ? getRelatedArticles(slug, 3) : []
    const navigate = useNavigate()
    const contentRef = useRef<HTMLDivElement>(null)

    // Intercepta cliques em links internos para evitar reload
    useEffect(() => {
        const handleInternalLinks = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const anchor = target.closest('a')
            
            if (anchor && anchor.href) {
                const url = new URL(anchor.href)
                const isInternal = url.origin === window.location.origin
                
                if (isInternal) {
                    e.preventDefault()
                    navigate(url.pathname + url.search + url.hash)
                }
            }
        }

        const content = contentRef.current
        if (content) {
            content.addEventListener('click', handleInternalLinks)
            return () => content.removeEventListener('click', handleInternalLinks)
        }
    }, [navigate])

    // Scroll to top quando artigo muda
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [slug])

    if (!article) {
        return <Navigate to="/learn" replace />
    }

    const articleUrl = `https://pyexplorer.com.br/learn/${article.slug}`;

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
                { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://pyexplorer.com.br" },
                { "@type": "ListItem", "position": 2, "name": "Aprender", "item": "https://pyexplorer.com.br/learn" },
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
            <div className="article-content" ref={contentRef}>
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
    // Sanitize input to prevent XSS
    let processedContent = escapeHtml(content);

    // Primeiro, processa tabelas separadamente
    // Encontra e converte tabelas markdown
    const tableRegex = /(\|.+\|[\r\n]+\|[-:| ]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/gm;
    processedContent = processedContent.replace(tableRegex, (tableBlock) => {
        const lines = tableBlock.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return tableBlock;

        // Primeira linha é o header
        const headerCells = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
        // Segunda linha é o separador (ignoramos)
        // Restante são as linhas de dados
        const dataRows = lines.slice(2);

        let html = '<table class="markdown-table"><thead><tr>';
        headerCells.forEach(cell => {
            html += `<th>${cell}</th>`;
        });
        html += '</tr></thead><tbody>';

        dataRows.forEach(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
            html += '<tr>';
            cells.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    });

    // Converte markdown básico para HTML
    const html = processedContent
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
        // Links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n\n/gim, '</p><p>')

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

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
