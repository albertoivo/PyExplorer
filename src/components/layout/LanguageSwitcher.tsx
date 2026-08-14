import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../../i18n';
import { languageNames, supportedLanguages } from '../../i18n';
import './LanguageSwitcher.css';
import { useEffect } from 'react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language.split('-')[0] as SupportedLanguage;

    // Ensure the language is supported, otherwise fallback to 'en'
    const validLang = supportedLanguages.includes(currentLang) ? currentLang : 'en';

    useEffect(() => {
        // Set the HTML lang attribute when the component mounts or language changes
        document.documentElement.lang = validLang;
    }, [validLang]);

    const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value as SupportedLanguage;
        i18n.changeLanguage(lang);
    };

    return (
        <div className="language-switcher">
            <span className="language-switcher__icon" aria-hidden="true">🌐</span>
            <select
                className="language-switcher__select"
                value={validLang}
                onChange={changeLanguage}
                aria-label="Selecionar idioma / Select language"
            >
                {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                        {languageNames[lang]}
                    </option>
                ))}
            </select>
        </div>
    );
}
