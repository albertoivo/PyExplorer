/**
 * Página Sobre o Projeto
 * Conta a história, missão e valores do PyExplorer
 */
import { Link } from 'react-router-dom'
import { SEO } from '../components/common/SEO'
import './AboutPage.css'

export function AboutPage() {
    return (
        <div className="about-page">
            <SEO
                title="Sobre o PyExplorer"
                description="Conheça a história do PyExplorer: um jogo gratuito feito no Brasil para ensinar Python para crianças."
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
                <h1>Sobre o PyExplorer</h1>
                <p>Nossa missão é democratizar o ensino de programação para crianças no Brasil 🇧🇷</p>
            </header>

            <section className="about-content">
                <div className="about-story">
                    <h2>👋 Olá, Explorador!</h2>
                    <p>
                        O <strong>PyExplorer</strong> nasceu de um sonho simples: tornar o aprendizado de programação
                        tão divertido quanto jogar videogame. Acreditamos que o código é o superpoder do século 21,
                        e toda criança deveria ter a chance de desbloqueá-lo.
                    </p>
                    <p>
                        Muitos cursos de tecnologia são caros, complexos ou em inglês. O PyExplorer foi criado para mudar isso.
                        Somos 100% gratuitos, em português e focados na experiência do aluno.
                    </p>
                </div>

                <div className="about-values">
                    <div className="value-card">
                        <span className="value-icon">🆓</span>
                        <h3>100% Gratuito</h3>
                        <p>Educação de qualidade não deve ter barreira de preço. O PyExplorer é e sempre será grátis.</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🇧🇷</span>
                        <h3>Feito no Brasil</h3>
                        <p>Conteúdo adaptado para nossa cultura e idioma. Nada de traduções automáticas estranhas.</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🔒</span>
                        <h3>Seguro e Privado</h3>
                        <p>Não vendemos dados. Não exibimos anúncios intrusivos. Um ambiente seguro para aprender.</p>
                    </div>
                    <div className="value-card">
                        <span className="value-icon">🎮</span>
                        <h3>Aprender Brincando</h3>
                        <p>Sem aulas chatas. Aqui você aprende resolvendo desafios e ganhando recompensas.</p>
                    </div>
                </div>

                <div className="about-tech">
                    <h2>Como Funciona? 🛠️</h2>
                    <p>
                        O PyExplorer usa uma tecnologia incrível chamada <strong>WebAssembly (Pyodide)</strong>.
                        Isso significa que o código Python roda direto no seu navegador, sem precisar instalar nada no computador!
                    </p>
                    <p>
                        Basta acessar o site, digitar o código e ver o resultado na hora. Funciona no computador, tablet e até no celular.
                    </p>
                </div>

                <div className="about-support">
                    <h3>Gosta do PyExplorer? 💜</h3>
                    <p>
                        Seu apoio nos ajuda a manter os servidores online e criar novos conteúdos gratuitos.
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
                    <h2>Faça Parte dessa História</h2>
                    <p>Milhares de crianças já escreveram sua primeira linha de código conosco.</p>
                    <Link to="/register" className="about-button">
                        Começar Minha Jornada 🚀
                    </Link>
                </div>
            </section>
        </div>
    )
}
