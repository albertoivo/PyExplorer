import { Helmet } from 'react-helmet-async';
import { env } from '../../config/env';

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    type?: 'website' | 'article';
    structuredData?: Record<string, unknown> | Record<string, unknown>[];
    keywords?: string[];
}

export function SEO({
    title,
    description,
    canonical,
    ogImage,
    type = 'website',
    structuredData,
    keywords
}: SEOProps) {
    const siteTitle = 'PyExplorer';
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
    const metaDescription = description || "Aprenda Python de forma divertida! PyExplorer é um jogo educativo GRATUITO para crianças e iniciantes aprenderem programação.";

    // OG Image deve ser URL absoluta para funcionar no WhatsApp/Facebook/LinkedIn
    const resolvedOgImage = ogImage
        ? (ogImage.startsWith('http') ? ogImage : `${env.APP_URL}${ogImage}`)
        : `${env.APP_URL}/og-image.jpg`;

    // URL Canônica: Prioriza o prop 'canonical', caso contrário constrói a partir da URL base + pathname
    // Isso garante que variações como query strings ou subdomínios (www) não criem conteúdo duplicado
    const getCanonicalUrl = () => {
        if (canonical) return canonical.replace(/\/$/, '');

        if (typeof window === 'undefined') return env.APP_URL;

        // Limpa a URL: remove trailing slash, query strings e hashes
        const pathname = window.location.pathname.replace(/\/$/, '');
        return `${env.APP_URL}${pathname}`;
    };

    const canonicalUrl = getCanonicalUrl();

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}
            <link rel="canonical" href={canonicalUrl} />

            {/* Idioma alternativo (Auxilia o Google a entender a região/idioma) */}
            <link rel="alternate" hrefLang="pt-BR" href={canonicalUrl} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={resolvedOgImage} />

            {/* Twitter */}
            <meta name="twitter:creator" content="@pyexplorer" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={resolvedOgImage} />
            
            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
