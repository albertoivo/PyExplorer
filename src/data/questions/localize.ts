import type {
    ContentLocale,
    LocalizedQuestionDocument,
    LocalizedText,
    QuestionDocument,
    QuestionTranslation,
} from '../../types/question';

const TRANSLATED_LOCALES = ['en', 'es', 'hi'] as const;
type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

type TranslationFile = Record<string, QuestionTranslation>;

const translationModules = import.meta.glob<TranslationFile>('./i18n/*/*.json', {
    eager: true,
    import: 'default',
});

/** id da questão -> locale -> tradução */
const translationsById = new Map<string, Partial<Record<TranslatedLocale, QuestionTranslation>>>();

for (const [path, file] of Object.entries(translationModules)) {
    const locale = path.split('/')[2] as TranslatedLocale;
    if (!TRANSLATED_LOCALES.includes(locale)) continue;
    for (const [id, translation] of Object.entries(file)) {
        const entry = translationsById.get(id) ?? {};
        entry[locale] = translation;
        translationsById.set(id, entry);
    }
}

function buildText(pt: string, pick: (t: QuestionTranslation) => string | undefined, id: string): LocalizedText {
    const result: Exclude<LocalizedText, string> = { pt };
    const entry = translationsById.get(id);
    if (!entry) return result;
    for (const locale of TRANSLATED_LOCALES) {
        const value = entry[locale] && pick(entry[locale]!);
        if (value) result[locale] = value;
    }
    return result;
}

/** Converte uma questão-fonte (PT) no documento localizado que vai para o Firestore. */
export function toLocalizedQuestion(q: QuestionDocument): LocalizedQuestionDocument {
    return {
        ...q,
        title: buildText(q.title, t => t.title, q.id),
        prompt: buildText(q.prompt, t => t.prompt, q.id),
        explanationKidFriendly: buildText(q.explanationKidFriendly, t => t.explanation, q.id),
        options: q.options?.map((opt, i) => buildText(opt, t => t.options?.[i], q.id)),
        bossMetadata: q.bossMetadata && {
            ...q.bossMetadata,
            bossName: buildText(q.bossMetadata.bossName, t => t.bossName, q.id),
        },
    };
}

export function normalizeLocale(language: string | undefined): ContentLocale {
    const base = (language ?? 'pt').slice(0, 2).toLowerCase();
    return (['pt', 'en', 'es', 'hi'] as const).includes(base as ContentLocale) ? (base as ContentLocale) : 'pt';
}

export function resolveText(text: LocalizedText | undefined, locale: ContentLocale): string {
    if (text == null) return '';
    if (typeof text === 'string') return text;
    return text[locale] ?? text.pt;
}

/** Resolve um documento localizado para o idioma ativo (fallback: pt). */
export function resolveQuestion(q: LocalizedQuestionDocument, language: string | undefined): QuestionDocument {
    const locale = normalizeLocale(language);
    return {
        ...q,
        title: resolveText(q.title, locale),
        prompt: resolveText(q.prompt, locale),
        explanationKidFriendly: resolveText(q.explanationKidFriendly, locale),
        options: q.options?.map(o => resolveText(o, locale)),
        bossMetadata: q.bossMetadata && {
            ...q.bossMetadata,
            bossName: resolveText(q.bossMetadata.bossName, locale),
        },
    };
}

/** Exposto para testes de cobertura de tradução. */
export function getTranslation(id: string, locale: TranslatedLocale): QuestionTranslation | undefined {
    return translationsById.get(id)?.[locale];
}
