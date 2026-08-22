export interface LanguageInfo {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    dir?: 'ltr' | 'rtl';
}

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
    {
        code: 'pt',
        name: 'Portuguese (Brazil)',
        nativeName: 'Português',
        flag: '🇧🇷',
        dir: 'ltr',
    },
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        dir: 'ltr',
    },
    {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        dir: 'ltr',
    },
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        flag: '🇮🇳',
        dir: 'ltr',
    },
];

export const supportedLanguages = AVAILABLE_LANGUAGES.map(l => l.code) as readonly string[];
export type SupportedLanguage = (typeof AVAILABLE_LANGUAGES)[number]['code'];

export const languageNames: Record<string, string> = Object.fromEntries(
    AVAILABLE_LANGUAGES.map(l => [l.code, l.nativeName])
);

export const languageFlags: Record<string, string> = Object.fromEntries(
    AVAILABLE_LANGUAGES.map(l => [l.code, l.flag])
);

export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt';
