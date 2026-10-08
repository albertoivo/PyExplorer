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

export interface BaseArticle {
    id: string
    slugs: Record<string, string>
    icon: string
    category: 'beginner' | 'intermediate' | 'tips' | 'parents'
    readTime: number
    publishedAt: string
    updatedAt?: string
}

export const BASE_ARTICLES: BaseArticle[] = [
  {
    "id": "what-is-python",
    "slugs": { "pt": "o-que-e-python", "en": "what-is-python", "es": "que-es-python", "hi": "python-kya-hai" },
    "icon": "🐍",
    "category": "beginner",
    "readTime": 5,
    "publishedAt": "2026-01-05",
    "updatedAt": "2026-05-16"
  },
  {
    "id": "why-learn-python",
    "slugs": { "pt": "por-que-aprender-python", "en": "why-learn-python", "es": "por-que-aprender-python", "hi": "python-kyon-sikhen" },
    "icon": "🚀",
    "category": "beginner",
    "readTime": 4,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "python-for-kids",
    "slugs": { "pt": "python-para-criancas", "en": "python-for-kids", "es": "python-para-ninos", "hi": "bacchon-ke-liye-python" },
    "icon": "👨‍👩‍👧‍👦",
    "category": "parents",
    "readTime": 6,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "how-to-teach-python",
    "slugs": { "pt": "como-ensinar-python-criancas", "en": "how-to-teach-python", "es": "como-ensenar-python-a-ninos", "hi": "python-kaise-sikhayen" },
    "icon": "💡",
    "category": "parents",
    "readTime": 6,
    "publishedAt": "2026-05-04"
  },
  {
    "id": "first-steps-python",
    "slugs": { "pt": "primeiros-passos-python", "en": "first-steps-python", "es": "primeros-pasos-python", "hi": "python-shuruat" },
    "icon": "👣",
    "category": "beginner",
    "readTime": 7,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "programming-games-kids",
    "slugs": { "pt": "jogos-aprender-programacao", "en": "programming-games", "es": "juegos-para-programar", "hi": "programming-games" },
    "icon": "🎮",
    "category": "tips",
    "readTime": 5,
    "publishedAt": "2026-01-05"
  },
  {
    "id": "python-exercises-kids",
    "slugs": { "pt": "exercicios-python-criancas", "en": "python-exercises-kids", "es": "ejercicios-python-ninos", "hi": "python-exercises" },
    "icon": "📝",
    "category": "beginner",
    "readTime": 6,
    "publishedAt": "2026-07-24",
    "updatedAt": "2026-07-24"
  },
  {
    "id": "scratch-vs-python",
    "slugs": { "pt": "scratch-vs-python", "en": "scratch-vs-python", "es": "scratch-vs-python", "hi": "scratch-vs-python" },
    "icon": "⚔️",
    "category": "parents",
    "readTime": 5,
    "publishedAt": "2026-07-24",
    "updatedAt": "2026-07-24"
  },
  {
    "id": "python-projects-kids",
    "slugs": { "pt": "projetos-python-criancas", "en": "python-projects-kids", "es": "proyectos-python-ninos", "hi": "python-projects" },
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
    const { t, i18n } = useTranslation('articles');
    const lang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'pt';
    
    return useMemo(() => {
        return BASE_ARTICLES.map(base => {
            const translatedKeywords = t(`${base.id}.keywords` as never, { returnObjects: true });
            const translatedFaqs = t(`${base.id}.faqs` as never, { returnObjects: true });

            return {
                ...base,
                slug: base.slugs[lang] || base.slugs['pt'],
                title: t(`${base.id}.title` as never, { defaultValue: '' }),
                description: t(`${base.id}.description` as never, { defaultValue: '' }),
                content: t(`${base.id}.content` as never, { defaultValue: '' }),
                keywords: Array.isArray(translatedKeywords) ? translatedKeywords : [],
                faqs: Array.isArray(translatedFaqs) ? translatedFaqs : []
            };
        });
    }, [t, lang]);
}

/**
 * Hook para buscar um artigo pelo slug (em qualquer idioma) ou pelo idioma atual
 */
export function useArticleBySlug(slug?: string): Article | undefined {
    const articles = useArticles();
    return useMemo(() => {
        if (!slug) return undefined;
        // Search if the slug matches the current language's slug first
        const currentMatch = articles.find(article => article.slug === slug);
        if (currentMatch) return currentMatch;
        // Fallback: search if the slug matches ANY language (handles deep linking to an old/different slug)
        return articles.find(article => Object.values((article as unknown as BaseArticle).slugs || {}).includes(slug));
    }, [articles, slug]);
}

/**
 * Retorna o slug localizado de um artigo pelo seu ID e idioma
 */
export function getLocalizedArticleSlug(id: string, lang: string): string {
    const article = BASE_ARTICLES.find(a => a.id === id);
    if (!article) return id;
    const cleanLang = lang ? lang.split('-')[0].toLowerCase() : 'pt';
    return article.slugs[cleanLang] || article.slugs['pt'] || id;
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
