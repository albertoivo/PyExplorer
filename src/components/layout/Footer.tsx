import { Link } from 'react-router-dom';
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
                        <Link to="/" className="footer__logo">🐍 PyExplorer</Link>
                        <p className="footer__tagline">
                            Aprenda Python de forma divertida!
                        </p>
                    </div>

                    <div className="footer__links">
                        <div className="footer__link-group">
                            <h4 className="footer__link-title">Aprender</h4>
                            <Link to="/learn" className="footer__link">📚 Tutoriais</Link>
                            <Link to="/game" className="footer__link">🎮 Jogar</Link>
                            <Link to="/rewards" className="footer__link">🏆 Conquistas</Link>
                        </div>

                        <div className="footer__link-group">
                            <h4 className="footer__link-title">Sobre</h4>
                            <Link to="/about" className="footer__link">O Projeto</Link>
                            <Link to="/learn/python-para-criancas" className="footer__link">Para Pais</Link>
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

