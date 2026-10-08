import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, supportedLanguages, type SupportedLanguage } from '../i18n';

/**
 * Removes any supported language prefix from a pathname.
 * e.g., '/en/learn' -> '/learn'
 *       '/es' -> '/'
 *       '/about' -> '/about'
 */
export function getCleanPath(pathname: string): string {
    if (!pathname || pathname === '/') return '/';

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && supportedLanguages.includes(segments[0] as SupportedLanguage)) {
        const remaining = segments.slice(1).join('/');
        return remaining ? `/${remaining}` : '/';
    }

    return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

const SEO_PATHS: Record<string, Record<string, string>> = {
    '/python-para-criancas': {
        pt: '/python-para-criancas',
        en: '/python-for-kids',
        es: '/python-para-ninos',
        hi: '/bachon-ke-liye-python'
    },
    '/aprender-python-jogando': {
        pt: '/aprender-python-jogando',
        en: '/learn-python-playing',
        es: '/aprender-python-jugando',
        hi: '/khel-khel-mein-python'
    }
};

/**
 * Prepends the language prefix to a path if the language is not the default (pt).
 * Maps specific SEO paths to their localized equivalents.
 * e.g., for 'en' and '/learn' -> '/en/learn'
 *       for 'en' and '/python-para-criancas' -> '/en/python-for-kids'
 */
export function formatLocalizedPath(path: string, lang: string): string {
    let clean = getCleanPath(path);
    const cleanLang = lang ? lang.split('-')[0].toLowerCase() : DEFAULT_LANGUAGE;

    // Check if it's a known SEO path
    if (SEO_PATHS[clean]) {
        clean = SEO_PATHS[clean][cleanLang] || clean;
    } else {
        // Reverse lookup: in case the passed path is already a localized SEO path
        for (const [ptPath, translations] of Object.entries(SEO_PATHS)) {
            if (Object.values(translations).includes(clean)) {
                clean = (translations as Record<string, string>)[cleanLang] || ptPath;
                break;
            }
        }
    }

    if (cleanLang === DEFAULT_LANGUAGE || !supportedLanguages.includes(cleanLang as SupportedLanguage)) {
        return clean;
    }

    if (clean === '/') {
        return `/${cleanLang}`;
    }

    return `/${cleanLang}${clean}`;
}

/**
 * Hook to get the localized version of a path based on current i18n language.
 */
export function useLocalizedPath() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : DEFAULT_LANGUAGE;

    const getLocalizedPath = (path: string, overrideLang?: string): string => {
        const targetLang = overrideLang || currentLang;
        return formatLocalizedPath(path, targetLang);
    };

    return {
        getLocalizedPath,
        getCleanPath,
        currentLang,
    };
}
