import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '../../i18n';
import './LanguageSwitcher.css';

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation('common');
    const rawLang = i18n.language ? i18n.language.split('-')[0].toLowerCase() : DEFAULT_LANGUAGE;
    const isSupported = AVAILABLE_LANGUAGES.some(l => l.code === rawLang);
    const validLang = (isSupported ? rawLang : DEFAULT_LANGUAGE) as SupportedLanguage;

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
                aria-label={t('aria.selectLanguage', 'Selecionar idioma')}
            >
                {AVAILABLE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName}
                    </option>
                ))}
            </select>
        </div>
    );
}
