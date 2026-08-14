import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

/**
 * Componente Footer com informações do projeto
 */
export function Footer() {
    const currentYear = new Date().getFullYear();
    const { t } = useTranslation('common');

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__content">
                    <div className="footer__brand">
                        <Link to="/" className="footer__logo">🐍 PyExplorer</Link>
                        <p className="footer__tagline">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    <nav className="footer__links" aria-label={t('aria.footerNav')}>
                        <div className="footer__link-group">
                            <p className="footer__link-title">{t('footer.learnSection')}</p>
                            <Link to="/learn" className="footer__link">{t('footer.tutorials')}</Link>
                            <Link to="/python-para-criancas" className="footer__link">{t('footer.pythonForKids')}</Link>
                            <Link to="/aprender-python-jogando" className="footer__link">{t('footer.learnPlaying')}</Link>
                            <Link to="/game" className="footer__link">{t('footer.playNow')}</Link>
                        </div>

                        <div className="footer__link-group">
                            <p className="footer__link-title">{t('footer.aboutSection')}</p>
                            <Link to="/about" className="footer__link">{t('footer.theProject')}</Link>
                            <Link to="/rewards" className="footer__link">{t('footer.achievements')}</Link>
                            <a href="https://github.com/sponsors/albertoivo" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--highlight">{t('footer.supportProject')}</a>
                        </div>
                    </nav>
                </div>

                <div className="footer__bottom">
                    <p className="footer__copyright">
                        {t('footer.copyright', { year: currentYear })}
                    </p>
                    <div className="footer__badges">
                        <span className="footer__badge">{t('footer.badgeEducational')}</span>
                        <span className="footer__badge">{t('footer.badgeSafe')}</span>
                        <span className="footer__badge">{t('footer.badgeFree')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}


