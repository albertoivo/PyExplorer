import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// === Portuguese (default) ===
import ptCommon from './locales/pt/common.json';
import ptHome from './locales/pt/home.json';
import ptAuth from './locales/pt/auth.json';
import ptAbout from './locales/pt/about.json';
import ptLearn from './locales/pt/learn.json';
import ptGame from './locales/pt/game.json';
import ptGamification from './locales/pt/gamification.json';
import ptWorlds from './locales/pt/worlds.json';
import ptNotFound from './locales/pt/notFound.json';

// === English ===
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enAuth from './locales/en/auth.json';
import enAbout from './locales/en/about.json';
import enLearn from './locales/en/learn.json';
import enGame from './locales/en/game.json';
import enGamification from './locales/en/gamification.json';
import enWorlds from './locales/en/worlds.json';
import enNotFound from './locales/en/notFound.json';

// === Spanish ===
import esCommon from './locales/es/common.json';
import esHome from './locales/es/home.json';
import esAuth from './locales/es/auth.json';
import esAbout from './locales/es/about.json';
import esLearn from './locales/es/learn.json';
import esGame from './locales/es/game.json';
import esGamification from './locales/es/gamification.json';
import esWorlds from './locales/es/worlds.json';
import esNotFound from './locales/es/notFound.json';

// === Hindi ===
import hiCommon from './locales/hi/common.json';
import hiHome from './locales/hi/home.json';
import hiAuth from './locales/hi/auth.json';
import hiAbout from './locales/hi/about.json';
import hiLearn from './locales/hi/learn.json';
import hiGame from './locales/hi/game.json';
import hiGamification from './locales/hi/gamification.json';
import hiWorlds from './locales/hi/worlds.json';
import hiNotFound from './locales/hi/notFound.json';

export const supportedLanguages = ['pt', 'en', 'es', 'hi'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
    pt: 'Português',
    en: 'English',
    es: 'Español',
    hi: 'हिन्दी',
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            pt: {
                common: ptCommon,
                home: ptHome,
                auth: ptAuth,
                about: ptAbout,
                learn: ptLearn,
                game: ptGame,
                gamification: ptGamification,
                worlds: ptWorlds,
                notFound: ptNotFound,
            },
            en: {
                common: enCommon,
                home: enHome,
                auth: enAuth,
                about: enAbout,
                learn: enLearn,
                game: enGame,
                gamification: enGamification,
                worlds: enWorlds,
                notFound: enNotFound,
            },
            es: {
                common: esCommon,
                home: esHome,
                auth: esAuth,
                about: esAbout,
                learn: esLearn,
                game: esGame,
                gamification: esGamification,
                worlds: esWorlds,
                notFound: esNotFound,
            },
            hi: {
                common: hiCommon,
                home: hiHome,
                auth: hiAuth,
                about: hiAbout,
                learn: hiLearn,
                game: hiGame,
                gamification: hiGamification,
                worlds: hiWorlds,
                notFound: hiNotFound,
            },
        },
        fallbackLng: 'pt',
        lng: 'pt',
        supportedLngs: ['pt', 'en', 'es', 'hi'],
        defaultNS: 'common',
        ns: ['common', 'home', 'auth', 'about', 'learn', 'game', 'gamification', 'worlds', 'notFound'],
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            // Detection order:
            // 1. localStorage (user's previous choice)
            // 2. navigator (browser/OS language)
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'pyexplorer-lang',
            caches: ['localStorage'],
        },
        react: {
            useSuspense: false,
        },
    });

// Update <html lang> attribute when language changes
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

// Set initial lang attribute
document.documentElement.lang = i18n.language;

export default i18n;
