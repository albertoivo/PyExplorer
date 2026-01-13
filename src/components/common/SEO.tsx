import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    type?: 'website' | 'article';
}

export function SEO({
    title,
    description,
    canonical,
    ogImage = '/og-image.png',
    type = 'website'
}: SEOProps) {
    const siteTitle = 'PyExplorer';
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
    const metaDescription = description || "Aprenda Python de forma divertida! PyExplorer é um jogo educativo GRATUITO para crianças e iniciantes aprenderem programação.";
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://pyexplorer.com.br';
    const canonicalUrl = canonical || currentUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:creator" content="@pyexplorer" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
}
