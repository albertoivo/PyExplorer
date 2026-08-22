import { describe, it, expect } from 'vitest';
import i18n, { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, supportedLanguages, languageNames, languageFlags } from '../i18n';
import type { SupportedLanguage } from '../i18n';

// Import all translation files dynamically to verify
const localeModules = import.meta.glob<{ default: Record<string, unknown> }>(
    '../i18n/locales/*/*.json',
    { eager: true }
);

function getNestedKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            keys = keys.concat(getNestedKeys(value as Record<string, unknown>, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

function extractVariables(text: string): string[] {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return matches.map(m => m.replace(/[{}]/g, '').trim()).sort();
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }
    return current;
}

describe('i18n State of the Art Architecture & Translations', () => {
    const requiredNamespaces = [
        'common',
        'home',
        'auth',
        'about',
        'learn',
        'game',
        'gamification',
        'worlds',
        'notFound',
    ];

    const targetLanguages: SupportedLanguage[] = ['pt', 'en', 'es', 'hi'];

    it('should have all target languages in AVAILABLE_LANGUAGES and supportedLanguages', () => {
        expect(supportedLanguages).toEqual(expect.arrayContaining(targetLanguages));
        expect(AVAILABLE_LANGUAGES.map(l => l.code)).toEqual(expect.arrayContaining(targetLanguages));
    });

    it('should have default language set to "pt"', () => {
        expect(DEFAULT_LANGUAGE).toBe('pt');
    });

    it('should provide complete metadata for all languages (code, nativeName, flag, dir)', () => {
        AVAILABLE_LANGUAGES.forEach(lang => {
            expect(lang.code).toBeTruthy();
            expect(lang.name).toBeTruthy();
            expect(lang.nativeName).toBeTruthy();
            expect(lang.flag).toBeTruthy();
            expect(['ltr', 'rtl']).toContain(lang.dir);
            expect(languageNames[lang.code]).toBe(lang.nativeName);
            expect(languageFlags[lang.code]).toBe(lang.flag);
        });
    });

    it('should load all required namespaces for all supported languages', () => {
        const loadedLanguages = new Set<string>();
        const loadedNamespacesByLang: Record<string, Set<string>> = {};

        for (const path of Object.keys(localeModules)) {
            const match = path.match(/locales\/([^/]+)\/([^/]+)\.json$/);
            if (match) {
                const [, lang, ns] = match;
                loadedLanguages.add(lang);
                if (!loadedNamespacesByLang[lang]) {
                    loadedNamespacesByLang[lang] = new Set();
                }
                loadedNamespacesByLang[lang].add(ns);
            }
        }

        for (const lang of targetLanguages) {
            expect(loadedLanguages.has(lang)).toBe(true);
            for (const ns of requiredNamespaces) {
                expect(loadedNamespacesByLang[lang]?.has(ns)).toBe(true);
            }
        }
    });

    it('should have 100% key parity across all languages compared to PT (base)', () => {
        for (const ns of requiredNamespaces) {
            const ptModule = localeModules[`../i18n/locales/pt/${ns}.json`]?.default;
            expect(ptModule).toBeDefined();

            const ptKeys = getNestedKeys(ptModule).sort();

            for (const lang of ['en', 'es', 'hi'] as const) {
                const targetModule = localeModules[`../i18n/locales/${lang}/${ns}.json`]?.default;
                expect(targetModule).toBeDefined();

                const targetKeys = getNestedKeys(targetModule).sort();

                const missingInTarget = ptKeys.filter(k => !targetKeys.includes(k));
                const extraInTarget = targetKeys.filter(k => !ptKeys.includes(k));

                expect(missingInTarget, `Missing keys in [${lang}/${ns}.json]`).toEqual([]);
                expect(extraInTarget, `Unexpected extra keys in [${lang}/${ns}.json]`).toEqual([]);
                expect(targetKeys.length).toBe(ptKeys.length);
            }
        }
    });

    it('should have 100% interpolation variable parity across all languages', () => {
        for (const ns of requiredNamespaces) {
            const ptModule = localeModules[`../i18n/locales/pt/${ns}.json`]?.default;
            const ptKeys = getNestedKeys(ptModule);

            for (const key of ptKeys) {
                const ptVal = getNestedValue(ptModule, key);
                if (typeof ptVal === 'string') {
                    const ptVars = extractVariables(ptVal);

                    if (ptVars.length > 0) {
                        for (const lang of ['en', 'es', 'hi'] as const) {
                            const targetModule = localeModules[`../i18n/locales/${lang}/${ns}.json`]?.default;
                            const targetVal = getNestedValue(targetModule, key);

                            expect(typeof targetVal).toBe('string');
                            const targetVars = extractVariables(targetVal as string);

                            expect(
                                targetVars,
                                `Variable mismatch in [${lang}/${ns}.json] at key "${key}"`
                            ).toEqual(ptVars);
                        }
                    }
                }
            }
        }
    });

    it('should have no empty translation strings in any language', () => {
        for (const [path, mod] of Object.entries(localeModules)) {
            const keys = getNestedKeys(mod.default);
            for (const key of keys) {
                const val = getNestedValue(mod.default, key);
                if (typeof val === 'string') {
                    expect(val.trim().length, `Empty string at "${key}" in ${path}`).toBeGreaterThan(0);
                }
            }
        }
    });

    it('i18next instance should be initialized and capable of switching languages', async () => {
        await i18n.changeLanguage('en');
        expect(i18n.language).toMatch(/^en/);
        expect(i18n.t('common:nav.home')).toBe('Home');

        await i18n.changeLanguage('es');
        expect(i18n.language).toMatch(/^es/);
        expect(i18n.t('common:nav.home')).toBe('Inicio');

        await i18n.changeLanguage('hi');
        expect(i18n.language).toMatch(/^hi/);
        expect(i18n.t('common:nav.home')).toBe('होम');

        await i18n.changeLanguage('pt');
        expect(i18n.language).toMatch(/^pt/);
        expect(i18n.t('common:nav.home')).toBe('Início');
    });
});
