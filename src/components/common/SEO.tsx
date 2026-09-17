import { Helmet } from 'react-helmet-async';
import { env } from '../../config/env';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '../../i18n';
import { getCleanPath, formatLocalizedPath } from '../../hooks/useLocalizedPath';

interface BreadcrumbItem {
    name: string;
    path: string;
}

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
    type?: 'website' | 'article';
    structuredData?: Record<string, unknown> | Record<string, unknown>[];
    keywords?: string[];
    publishedTime?: string;
    modifiedTime?: string;
    authorName?: string;
    noindex?: boolean;
    breadcrumbs?: BreadcrumbItem[];
}

export function SEO({
    title,
    description,
    canonical,
    ogImage,
    type = 'website',
    structuredData,
    keywords,
    publishedTime,
    modifiedTime,
    authorName,
    noindex = false,
    breadcrumbs
}: SEOProps) {
    const { i18n, t } = useTranslation(['common', 'learn']);
    const siteTitle = 'PyExplorer';
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
    const metaDescription = description || t('common:seo.defaultDescription', "Learn Python the fun way! PyExplorer is a FREE educational game for kids and beginners to learn programming.");

    // OG Image deve ser URL absoluta para funcionar no WhatsApp/Facebook/LinkedIn
    const resolvedOgImage = ogImage
        ? (ogImage.startsWith('http') ? ogImage : `${env.APP_URL}${ogImage}`)
        : `${env.APP_URL}/og-image.jpg`;

    // Extract clean path from window location if available
    const getCleanCurrentPath = () => {
        if (typeof window === 'undefined') return '/';
        const pathname = window.location.pathname.replace(/\/$/, '') || '/';
        return getCleanPath(pathname);
    };

    const cleanPath = getCleanCurrentPath();
    const currentLang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : 'pt';

    // Build language-specific URLs adhering strictly to Google Search Central guidelines
    const getLangUrl = (langCode: string) => {
        const localizedPath = formatLocalizedPath(cleanPath, langCode);
        return `${env.APP_URL}${localizedPath === '/' ? '' : localizedPath}`;
    };

    const ptUrl = getLangUrl('pt');
    const enUrl = getLangUrl('en');
    const esUrl = getLangUrl('es');
    const hiUrl = getLangUrl('hi');
    const xDefaultUrl = ptUrl;

    // Canonical URL points to the page itself in its current language variant
    const canonicalUrl = canonical
        ? canonical.replace(/\/$/, '')
        : getLangUrl(currentLang);

    // BreadcrumbList JSON-LD gerado automaticamente a partir do prop breadcrumbs
    const breadcrumbStructuredData = breadcrumbs && breadcrumbs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => {
            const itemLocalizedPath = formatLocalizedPath(item.path, currentLang);
            return {
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": `${env.APP_URL}${itemLocalizedPath === '/' ? '' : itemLocalizedPath}`
            };
        })
    } : null;

    const localeMap: Record<string, string> = {
        pt: 'pt_BR',
        en: 'en_US',
        es: 'es_ES',
        hi: 'hi_IN'
    };

    const ogLocale = localeMap[currentLang] || 'pt_BR';
    const alternateLocales = Object.entries(localeMap)
        .filter(([code]) => code !== currentLang)
        .map(([, loc]) => loc);

    const htmlLang = currentLang === 'pt' ? 'pt-BR' : currentLang === 'en' ? 'en-US' : currentLang === 'es' ? 'es-ES' : 'hi-IN';
    const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === currentLang);
    const dir = langInfo?.dir || 'ltr';

    return (
        <Helmet>
            <html lang={htmlLang} dir={dir} />

            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}

            {/* Robots: noindex para páginas protegidas, de erro, ou sem valor para crawlers */}
            {noindex && (
                <meta name="robots" content="noindex, nofollow" />
            )}

            <link rel="canonical" href={canonicalUrl} />

            {/* Hreflang alternates: each variant points to its distinct, dedicated URL */}
            <link rel="alternate" hrefLang="pt" href={ptUrl} />
            <link rel="alternate" hrefLang="en" href={enUrl} />
            <link rel="alternate" hrefLang="es" href={esUrl} />
            <link rel="alternate" hrefLang="hi" href={hiUrl} />
            <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />

            {/* Open Graph */}
            <meta property="og:site_name" content="PyExplorer" />
            <meta property="og:locale" content={ogLocale} />
            {alternateLocales.map((loc) => (
                <meta key={loc} property="og:locale:alternate" content={loc} />
            ))}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={resolvedOgImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            {type === 'article' && (
                <>
                    {publishedTime && <meta property="article:published_time" content={publishedTime} />}
                    {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
                    <meta property="article:author" content={authorName || 'PyExplorer'} />
                    <meta property="article:section" content={t('learn:seoTitle', 'Technology Education')} />
                </>
            )}

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

            {/* BreadcrumbList (JSON-LD) */}
            {breadcrumbStructuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbStructuredData)}
                </script>
            )}
        </Helmet>
    );
}
