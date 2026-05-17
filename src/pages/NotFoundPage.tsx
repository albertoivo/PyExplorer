import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import './NotFoundPage.css';

export function NotFoundPage() {
    return (
        <div className="not-found-page text-center">
            <SEO
                title="Página Não Encontrada"
                description="Ops! Parece que você se perdeu no labirinto de Python. Volte para o início do PyExplorer!"
            />
            <div className="not-found-container animate-slide-up">
                <span className="not-found-icon animate-bounce" role="img" aria-label="Cobra confusa">🐍❓</span>
                <h1 className="not-found-title">Oops! Código 404</h1>
                <p className="not-found-text">
                    Parece que você se perdeu no labirinto de Python! Essa página sumiu no meio da floresta de código.
                </p>
                <div className="not-found-actions">
                    <Link to="/" className="hero__btn hero__btn--primary not-found-btn">
                        🏠 Voltar para o Início
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
