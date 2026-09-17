import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import './NotFoundPage.css';

export function NotFoundPage() {
    const { t } = useTranslation('notFound');
    const { getLocalizedPath } = useLocalizedPath();

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
                    <Link to={getLocalizedPath('/')} className="not-found-btn not-found-btn--primary">
                        {t('goHome')}
                    </Link>
                    <Link to={getLocalizedPath('/game')} className="not-found-btn not-found-btn--secondary">
                        {t('goPlay')}
                    </Link>
                    <Link to={getLocalizedPath('/learn')} className="not-found-btn not-found-btn--secondary">
                        {t('goLearn')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

