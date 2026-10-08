import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.resolve(__dirname, '../locales');
const TARGET_LANGS = ['en', 'es', 'hi'];
const BASE_LANG = 'pt';

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            keys = keys.concat(getAllKeys(value as Record<string, unknown>, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

describe('i18n Localization Parity & Quality', () => {
    const baseFiles = fs.readdirSync(path.join(LOCALES_DIR, BASE_LANG)).filter(f => f.endsWith('.json'));

    it('should have all required namespace JSON files in all languages', () => {
        expect(baseFiles.length).toBe(12);

        for (const lang of TARGET_LANGS) {
            const langFiles = fs.readdirSync(path.join(LOCALES_DIR, lang)).filter(f => f.endsWith('.json'));
            expect(langFiles.sort()).toEqual(baseFiles.sort());
        }
    });

    for (const filename of baseFiles) {
        const ns = filename.replace('.json', '');

        describe(`Namespace: ${ns}`, () => {
            const baseContent = JSON.parse(
                fs.readFileSync(path.join(LOCALES_DIR, BASE_LANG, filename), 'utf8')
            );
            const baseKeys = getAllKeys(baseContent).sort();

            for (const lang of TARGET_LANGS) {
                it(`language '${lang}' should have 100% key parity with '${BASE_LANG}'`, () => {
                    const targetContent = JSON.parse(
                        fs.readFileSync(path.join(LOCALES_DIR, lang, filename), 'utf8')
                    );
                    const targetKeys = getAllKeys(targetContent).sort();

                    const missingInTarget = baseKeys.filter(k => !targetKeys.includes(k));
                    const unexpectedInTarget = targetKeys.filter(k => !baseKeys.includes(k));

                    expect(
                        missingInTarget,
                        `Keys missing in '${lang}/${filename}':\n${missingInTarget.join('\n')}`
                    ).toEqual([]);

                    expect(
                        unexpectedInTarget,
                        `Unexpected orphan keys in '${lang}/${filename}':\n${unexpectedInTarget.join('\n')}`
                    ).toEqual([]);
                });

                it(`language '${lang}' should not contain empty string values in '${filename}'`, () => {
                    const targetContent = JSON.parse(
                        fs.readFileSync(path.join(LOCALES_DIR, lang, filename), 'utf8')
                    );

                    function assertNoEmptyValues(obj: Record<string, unknown>, currentPath = '') {
                        for (const [k, v] of Object.entries(obj)) {
                            const p = currentPath ? `${currentPath}.${k}` : k;
                            if (typeof v === 'string') {
                                expect(v.trim().length, `Empty string found at key: ${p} in ${lang}/${filename}`).toBeGreaterThan(0);
                            } else if (Array.isArray(v)) {
                                v.forEach((item, idx) => {
                                    if (typeof item === 'string') {
                                        expect(item.trim().length, `Empty string at ${p}[${idx}] in ${lang}/${filename}`).toBeGreaterThan(0);
                                    } else if (item && typeof item === 'object') {
                                        assertNoEmptyValues(item as Record<string, unknown>, `${p}[${idx}]`);
                                    }
                                });
                            } else if (v && typeof v === 'object') {
                                assertNoEmptyValues(v as Record<string, unknown>, p);
                            }
                        }
                    }

                    assertNoEmptyValues(targetContent);
                });
            }
        });
    }
});
