import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
    AVAILABLE_LANGUAGES,
    DEFAULT_LANGUAGE,
    type LanguageInfo
} from './languages';

export * from './languages';

// Dynamic locale loader via Vite's import.meta.glob
// Discovers any language and namespace placed in ./locales/<lang>/<ns>.json automatically
const localeModules = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json', { eager: true });

export const resources: Record<string, Record<string, Record<string, unknown>>> = {};
const detectedNamespaces = new Set<string>();

for (const [filePath, moduleContent] of Object.entries(localeModules)) {
    // filePath format: "./locales/<lang>/<namespace>.json"
    const match = filePath.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (match) {
        const [, lang, ns] = match;
        if (!resources[lang]) {
            resources[lang] = {};
        }
        resources[lang][ns] = moduleContent.default || moduleContent;
        detectedNamespaces.add(ns);
    }
}

export const allLoadedLanguages = Object.keys(resources);
export const namespaces = Array.from(detectedNamespaces);

const getLanguageInfo = (langCode: string): LanguageInfo | undefined => {
    const code = langCode.split('-')[0].toLowerCase();
    return AVAILABLE_LANGUAGES.find(l => l.code === code);
};

const updateDocumentAttributes = (lng: string) => {
    if (typeof document === 'undefined') return;
    const cleanLang = lng.split('-')[0].toLowerCase();
    const info = getLanguageInfo(cleanLang);
    
    document.documentElement.lang = cleanLang;
    document.documentElement.dir = info?.dir || 'ltr';
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        load: 'languageOnly',
        supportedLngs: allLoadedLanguages.length > 0 ? allLoadedLanguages : ['pt', 'en', 'es', 'hi'],
        defaultNS: 'common',
        ns: namespaces.length > 0 ? namespaces : ['common'],
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'pyexplorer-lang',
            caches: ['localStorage'],
        },
        react: {
            useSuspense: false,
        },
    });

// Sync document element attributes whenever language changes
i18n.on('languageChanged', (lng) => {
    updateDocumentAttributes(lng);
});

// Set initial document element attributes
if (i18n.language) {
    updateDocumentAttributes(i18n.language);
}

export default i18n;
