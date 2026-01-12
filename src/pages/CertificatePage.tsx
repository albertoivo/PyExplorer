import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CertificateGenerator } from '../components/game/CertificateGenerator';
import { SEO } from '../components/common/SEO';
import { Footer } from '../components/layout/Footer';
import './CertificatePage.css';

export function CertificatePage() {
    const { userData, user } = useAuth();
    const navigate = useNavigate();

    // Mock completion logic (You should replace with real logic: all worlds unlocked + completed)
    // For now we check if totalScore > 0 to allow testing, but realistically should be stricter.
    // Let's assume 1000 points is roughly "finished" or checking unlockedWorlds length.
    const isCompleted = (userData?.unlockedWorlds?.length ?? 0) >= 8; // Assuming 8 worlds

    // Fallback name
    const studentName = userData?.displayName || user?.displayName || "Apreciador de Python";
    const completionDate = new Date().toLocaleDateString('pt-BR');

    if (!user) {
        return (
            <div className="certificate-page-container">
                <div className="certificate-locked">
                    <h2>🔒 Acesso Restrito</h2>
                    <p>Faça login para acessar seu certificado.</p>
                    <button onClick={() => navigate('/login')} className="btn-primary">Entrar</button>
                </div>
            </div>
        );
    }

    if (!isCompleted) {
        return (
            <div className="certificate-page-container">
                <SEO title="Certificado Bloqueado" />
                <div className="certificate-locked">
                    <span className="locked-icon">🎓</span>
                    <h2>Certificado em Andamento</h2>
                    <p>Você ainda não completou todos os mundos!</p>
                    <p>Continue sua jornada para desbloquear seu diploma oficial.</p>
                    <button onClick={() => navigate('/game')} className="btn-primary">Continuar Jogando</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="certificate-page-container">
            <SEO title="Seu Certificado Oficial" description="Baixe seu certificado de conclusão do PyExplorer!" />

            <div className="certificate-content-wrapper">
                <header className="certificate-page-header">
                    <h1>Parabéns, {studentName.split(' ')[0]}! 🎉</h1>
                    <p>Você completou o curso de Python. Aqui está sua recompensa.</p>
                </header>

                <div className="donation-prompt">
                    <h3>💜 Apoie o Projeto</h3>
                    <p>
                        O PyExplorer é 100% gratuito e mantido por doações.
                        Se você gostou da jornada, considere nos pagar um cafezinho
                        para mantermos o servidor online para outras crianças.
                    </p>
                    <a
                        href="https://github.com/sponsors/albertoivo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sponsor"
                    >
                        Fazer uma Doação (Opcional)
                    </a>
                </div>

                <CertificateGenerator
                    studentName={studentName}
                    completionDate={completionDate}
                />
            </div>
            <Footer />
        </div>
    );
}
