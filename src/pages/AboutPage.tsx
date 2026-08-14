/**
 * Página Sobre o Projeto
 * Conta a história, missão e valores do PyExplorer
 */
import { Link } from 'react-router-dom'
import { SEO } from '../components/common/SEO'
import { useTranslation } from 'react-i18next'
import './AboutPage.css'

export function AboutPage() {
    const { t } = useTranslation('about');
    return (
        <div className="about-page">
            <SEO
                title={t('seoTitle')}
                description={t('seoDescription')}
                breadcrumbs={[
                    { name: t('common:nav.home', "Início"), path: "/" },
                    { name: t('breadcrumb'), path: "/about" }
                ]}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "EducationalOrganization",
                    "name": "PyExplorer",
                    "url": "https://pyexplorer.com.br",
                    "logo": "https://pyexplorer.com.br/icons/icon-512x512.png",
                    "description": "Plataforma educacional gratuita para crianças aprenderem programação de forma divertida.",
                    "sameAs": ["https://github.com/albertoivo/PyExplorer"]
                }}
            />
            <header className="about-hero">
                <h1>{t('heroTitle')}</h1>
                <p>{t('heroSubtitle')}</p>
            </header>

            <section className="about-content">
                <div className="about-story">
                    <h2>{t('greeting')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('story1') }} />
                    <p>{t('story2')}</p>
                </div>

                <div className="about-values">
                    <div className="value-card">
                        <span className="value-icon">🆓</span>
                        <h3>{t('values.freeTitle')}</h3>
                        <p>{t('values.freeDesc')}</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🌍</span>
                        <h3>{t('values.madeInBrazilTitle')}</h3>
                        <p>{t('values.madeInBrazilDesc')}</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🔒</span>
                        <h3>{t('values.safeTitle')}</h3>
                        <p>{t('values.safeDesc')}</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🎮</span>
                        <h3>{t('values.funTitle')}</h3>
                        <p>{t('values.funDesc')}</p>
                    </div>
                </div>

                <div className="about-tech">
                    <h2>{t('techTitle')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('tech1') }} />
                    <p>{t('tech2')}</p>
                </div>

                <div className="about-support">
                    <h3>{t('supportTitle')}</h3>
                    <p>
                        {t('supportDesc')}
                    </p>
                    <div className="sponsors-iframe-container">
                        <iframe
                            src="https://github.com/sponsors/albertoivo/card"
                            title="Sponsor albertoivo"
                            height="225"
                            width="600"
                            style={{ border: 0 }}
                        ></iframe>
                    </div>
                </div>

                <div className="about-cta">
                    <h2>{t('ctaTitle')}</h2>
                    <p>{t('ctaDesc')}</p>
                    <Link to="/register" className="about-button">
                        {t('ctaButton')}
                    </Link>
                </div>
            </section>
        </div>
    )
}
