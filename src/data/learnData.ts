/**
 * Dados do conteúdo educacional para SEO
 * Artigos sobre Python para aumentar autoridade do site
 */

import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export interface Article {
    id: string
    slug: string
    title: string
    description: string
    content: string
    icon: string
    category: 'beginner' | 'intermediate' | 'tips' | 'parents'
    readTime: number // minutos
    publishedAt: string
    updatedAt?: string
    keywords: string[]
    faqs?: { question: string, answer: string }[]
}

export type BaseArticle = Omit<Article, 'title' | 'description' | 'content' | 'keywords' | 'faqs'>;

export const BASE_ARTICLES: BaseArticle[] = [
  {
    "id": "what-is-python",
    "slug": "o-que-e-python",
    "icon": "🐍",
    "category": "beginner",
    "readTime": 5,
    "publishedAt": "2026-01-05",
    "updatedAt": "2026-05-16"
  },
  {
    "id": "why-learn-python",
    "slug": "por-que-aprender-python",
    "icon": "🚀",
    "category": "beginner",
    "readTime": 4,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "python-for-kids",
    "slug": "python-para-criancas",
    "icon": "👨‍👩‍👧‍👦",
    "category": "parents",
    "readTime": 6,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "how-to-teach-python",
    "slug": "como-ensinar-python-criancas",
    "icon": "💡",
    "category": "parents",
    "readTime": 6,
    "publishedAt": "2026-05-04"
  },
  {
    "id": "first-steps-python",
    "slug": "primeiros-passos-python",
    "icon": "👣",
    "category": "beginner",
    "readTime": 7,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "programming-games-kids",
    "slug": "jogos-aprender-programacao",
    "icon": "🎮",
    "category": "tips",
    "readTime": 5,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "python-exercises-kids",
    "slug": "exercicios-python-criancas",
    "icon": "📝",
    "category": "beginner",
    "readTime": 6,
    "publishedAt": "2026-07-24",
    "updatedAt": "2026-07-24"
  },
  {
    "id": "scratch-vs-python",
    "slug": "scratch-vs-python",
    "icon": "⚔️",
    "category": "parents",
    "readTime": 5,
    "publishedAt": "2026-07-24",
    "updatedAt": "2026-07-24"
  },
  {
    "id": "python-projects-kids",
    "slug": "projetos-python-criancas",
    "icon": "🛠️",
    "category": "beginner",
    "readTime": 7,
    "publishedAt": "2026-07-24",
    "updatedAt": "2026-07-24"
  }
];

/**
 * Hook para acessar os artigos traduzidos
 */
export function useArticles(): Article[] {
    const { t } = useTranslation(['articles']);
    
    return useMemo(() => {
        return BASE_ARTICLES.map(base => {
            const translatedKeywords = t(`articles:${base.id}.keywords`, { returnObjects: true });
            const translatedFaqs = t(`articles:${base.id}.faqs`, { returnObjects: true });

            return {
                ...base,
                title: t(`articles:${base.id}.title`, { defaultValue: '' }),
                description: t(`articles:${base.id}.description`, { defaultValue: '' }),
                content: t(`articles:${base.id}.content`, { defaultValue: '' }),
                keywords: Array.isArray(translatedKeywords) ? translatedKeywords : [],
                faqs: Array.isArray(translatedFaqs) ? translatedFaqs : []
            };
        });
    }, [t]);
}

/**
 * Hook para buscar um artigo pelo slug
 */
export function useArticleBySlug(slug?: string): Article | undefined {
    const articles = useArticles();
    return useMemo(() => {
        if (!slug) return undefined;
        return articles.find(article => article.slug === slug);
    }, [articles, slug]);
}

/**
 * Hook para retornar artigos relacionados (mesma categoria, exceto o atual)
 */
export function useRelatedArticles(currentSlug?: string, limit: number = 3): Article[] {
    const articles = useArticles();
    return useMemo(() => {
        const current = currentSlug ? articles.find(a => a.slug === currentSlug) : undefined;
        if (!current) return articles.slice(0, limit);

        return articles
            .filter(a => a.slug !== currentSlug && a.category === current.category)
            .slice(0, limit);
    }, [articles, currentSlug, limit]);
}
