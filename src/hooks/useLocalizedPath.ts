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

/**
 * Prepends the language prefix to a path if the language is not the default (pt).
 * e.g., for 'en' and '/learn' -> '/en/learn'
 *       for 'en' and '/' -> '/en'
 *       for 'pt' and '/learn' -> '/learn'
 */
export function formatLocalizedPath(path: string, lang: string): string {
    const clean = getCleanPath(path);
    const cleanLang = lang ? lang.split('-')[0].toLowerCase() : DEFAULT_LANGUAGE;

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
