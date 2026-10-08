import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS } from '../questions';
import { getTranslation, resolveQuestion, toLocalizedQuestion } from '../questions/localize';

const LOCALES = ['en', 'es', 'hi'] as const;
const translationFiles = import.meta.glob('../questions/i18n/*/*.json', { eager: true, import: 'default' });
const knownIds = new Set(ALL_QUESTIONS.map(q => q.id));

describe('question translations', () => {
    it('only references existing question ids', () => {
        for (const [path, file] of Object.entries(translationFiles)) {
            for (const id of Object.keys(file as object)) {
                expect(knownIds.has(id), `${path}: unknown id "${id}"`).toBe(true);
            }
        }
    });

    it('keeps the same number of options as the source (answerIndex must stay valid)', () => {
        for (const q of ALL_QUESTIONS) {
            for (const locale of LOCALES) {
                const opts = getTranslation(q.id, locale)?.options;
                if (opts) expect(opts.length, `${locale}/${q.id}`).toBe(q.options?.length);
            }
        }
    });

    it('falls back to Portuguese when a translation is missing', () => {
        const q = { ...ALL_QUESTIONS[0], id: '__no_translation__' };
        expect(resolveQuestion(toLocalizedQuestion(q), 'hi').title).toBe(q.title);
    });

    it('never translates code fields', () => {
        for (const q of ALL_QUESTIONS) {
            const resolved = resolveQuestion(toLocalizedQuestion(q), 'en');
            expect(resolved.starterCode).toBe(q.starterCode);
            expect(resolved.tests).toEqual(q.tests);
            expect(resolved.parsonsSegments).toEqual(q.parsonsSegments);
        }
    });

    it.each(LOCALES)('has a complete %s translation for every question', locale => {
        const missing = ALL_QUESTIONS.filter(q => {
            const t = getTranslation(q.id, locale);
            return !t?.title || !t.prompt || !t.explanation || (q.bossMetadata && !t.bossName);
        }).map(q => q.id);
        expect(missing, `${missing.length} questions missing ${locale}`).toEqual([]);
    });
});
