import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';
import './NotFoundPage.css';

export function NotFoundPage() {
    const { t } = useTranslation('notFound');
    return (
        <div className="not-found-page">
            <SEO 
                title={t('seoTitle')} 
                description={t('seoDescription')} 
                noindex
            />
            <div className="not-found-content">
                <span className="not-found-icon">🐍</span>
                <h1>{t('title')}</h1>
                <p>{t('description')}</p>
                <div className="not-found-actions">
                    <Link to="/" className="not-found-btn not-found-btn--primary">
                        {t('goHome')}
                    </Link>
                    <Link to="/game" className="not-found-btn not-found-btn--secondary">
                        {t('goPlay')}
                    </Link>
                    <Link to="/learn" className="not-found-btn not-found-btn--secondary">
                        {t('goLearn')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

