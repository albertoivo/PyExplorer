import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import './NotFoundPage.css';

export function NotFoundPage() {
    return (
        <div className="not-found-page">
            <SEO 
                title="Página não encontrada" 
                description="Ops! A página que você está procurando não existe." 
                noindex
            />
            <div className="not-found-content">
                <span className="not-found-icon">🐍</span>
                <h1>Ops! Página não encontrada</h1>
                <p>Parece que você explorou um pouco demais e acabou saindo do mapa!</p>
                <div className="not-found-actions">
                    <Link to="/" className="not-found-btn not-found-btn--primary">
                        🏠 Voltar para o Início
                    </Link>
                    <Link to="/game" className="not-found-btn not-found-btn--secondary">
                        🎮 Jogar PyExplorer
                    </Link>
                    <Link to="/learn" className="not-found-btn not-found-btn--secondary">
                        📚 Aprender Python
                    </Link>
                </div>
            </div>
        </div>
    );
}

