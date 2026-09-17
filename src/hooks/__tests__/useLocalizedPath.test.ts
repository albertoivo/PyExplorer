import { describe, it, expect } from 'vitest';
import { getCleanPath, formatLocalizedPath } from '../useLocalizedPath';

describe('useLocalizedPath helper functions', () => {
    describe('getCleanPath', () => {
        it('returns / for root or empty path', () => {
            expect(getCleanPath('')).toBe('/');
            expect(getCleanPath('/')).toBe('/');
        });

        it('preserves paths without language prefixes', () => {
            expect(getCleanPath('/learn')).toBe('/learn');
            expect(getCleanPath('/about')).toBe('/about');
            expect(getCleanPath('/learn/o-que-e-python')).toBe('/learn/o-que-e-python');
        });

        it('strips language prefixes for supported languages', () => {
            expect(getCleanPath('/en')).toBe('/');
            expect(getCleanPath('/en/')).toBe('/');
            expect(getCleanPath('/en/learn')).toBe('/learn');
            expect(getCleanPath('/es/about')).toBe('/about');
            expect(getCleanPath('/hi/game')).toBe('/game');
            expect(getCleanPath('/pt/certificate')).toBe('/certificate');
            expect(getCleanPath('/en/learn/o-que-e-python')).toBe('/learn/o-que-e-python');
        });

        it('does not strip non-language prefixes', () => {
            expect(getCleanPath('/python-para-criancas')).toBe('/python-para-criancas');
            expect(getCleanPath('/fr/learn')).toBe('/fr/learn');
        });
    });

    describe('formatLocalizedPath', () => {
        it('returns clean path for default language (pt)', () => {
            expect(formatLocalizedPath('/', 'pt')).toBe('/');
            expect(formatLocalizedPath('/learn', 'pt')).toBe('/learn');
            expect(formatLocalizedPath('/en/learn', 'pt')).toBe('/learn');
            expect(formatLocalizedPath('/es/about', 'pt-BR')).toBe('/about');
        });

        it('prefixes path correctly for English (en)', () => {
            expect(formatLocalizedPath('/', 'en')).toBe('/en');
            expect(formatLocalizedPath('/learn', 'en')).toBe('/en/learn');
            expect(formatLocalizedPath('/es/about', 'en')).toBe('/en/about');
            expect(formatLocalizedPath('/learn/o-que-e-python', 'en-US')).toBe('/en/learn/o-que-e-python');
        });

        it('prefixes path correctly for Spanish (es)', () => {
            expect(formatLocalizedPath('/', 'es')).toBe('/es');
            expect(formatLocalizedPath('/about', 'es')).toBe('/es/about');
            expect(formatLocalizedPath('/en/game', 'es-ES')).toBe('/es/game');
        });

        it('prefixes path correctly for Hindi (hi)', () => {
            expect(formatLocalizedPath('/', 'hi')).toBe('/hi');
            expect(formatLocalizedPath('/certificate', 'hi')).toBe('/hi/certificate');
            expect(formatLocalizedPath('/pt/rewards', 'hi-IN')).toBe('/hi/rewards');
        });

        it('falls back to clean path for unsupported languages', () => {
            expect(formatLocalizedPath('/learn', 'de')).toBe('/learn');
            expect(formatLocalizedPath('/about', 'fr')).toBe('/about');
        });
    });
});
