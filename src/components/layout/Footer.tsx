import './Footer.css';

/**
 * Componente Footer com informações do projeto
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__content">
                    <div className="footer__brand">
                        <span className="footer__logo">🐍 PyExplorer</span>
                        <p className="footer__tagline">
                            Aprenda Python de forma divertida!
                        </p>
                    </div>

                    <div className="footer__links">
                        <div className="footer__link-group">
                            <h4 className="footer__link-title">Aprender</h4>
                            <a href="#" className="footer__link">Mundos</a>
                            <a href="#" className="footer__link">Desafios</a>
                            <a href="#" className="footer__link">Conquistas</a>
                        </div>

                        <div className="footer__link-group">
                            <h4 className="footer__link-title">Sobre</h4>
                            <a href="#" className="footer__link">O Projeto</a>
                            <a href="#" className="footer__link">Para Pais</a>
                            <a href="#" className="footer__link">Contato</a>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p className="footer__copyright">
                        © {currentYear} PyExplorer. Feito com 💜 para ensinar programação.
                    </p>
                    <div className="footer__badges">
                        <span className="footer__badge">🎓 Educativo</span>
                        <span className="footer__badge">🔒 Seguro para crianças</span>
                        <span className="footer__badge">🆓 Gratuito</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
