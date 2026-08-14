import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuestionsFirestore } from '../hooks/useQuestionsFirestore';
import { useProgress } from '../hooks/useProgress';
import { CertificateGenerator } from '../components/game/CertificateGenerator';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';
import './CertificatePage.css';

export function CertificatePage() {
    const { t } = useTranslation('game');
    const { userData, user } = useAuth();
    const navigate = useNavigate();

    const { questions, loading: questionsLoading } = useQuestionsFirestore();
    const { allProgress, loading: progressLoading } = useProgress();

    // Check if user entered directly or via navigation
    const isLoading = questionsLoading || progressLoading;

    // Calculate completion dynamically
    const totalQuestions = questions.length;
    const completedQuestions = questions.filter(q =>
        allProgress.some(p => p.questionId === q.id && p.status === 'completed')
    ).length;

    // Is completed if we have questions and all are completed
    // (Optional: tolerate 1 or 2 missing if we want strictness, but "Certificate" usually implies 100%)
    const isCompleted = totalQuestions > 0 && completedQuestions >= totalQuestions;

    // Fallback name
    const studentName = userData?.displayName || user?.displayName || t('certificate.guestName', "Apreciador de Python");
    const completionDate = new Date().toLocaleDateString('pt-BR');

    if (!user) {
        return (
            <div className="certificate-page-container">
                <div className="certificate-locked">
                    <h2>🔒 {t('certificate.lockedTitle', 'Acesso Restrito')}</h2>
                    <p>{t('certificate.loginRequired', 'Faça login para acessar seu certificado.')}</p>
                    <button onClick={() => navigate('/login')} className="btn-primary">{t('common:nav.login', 'Entrar')}</button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="certificate-page-container">
                <div className="certificate-loading">
                    <p>{t('certificate.loading', 'Verificando sua jornada... 🐍')}</p>
                </div>
            </div>
        );
    }

    if (!isCompleted) {
        const progressPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

        return (
            <div className="certificate-page-container">
                <SEO title={t('certificate.lockedSeoTitle', 'Certificado Bloqueado')} noindex />
                <div className="certificate-locked">
                    <span className="locked-icon">🎓</span>
                    <h2>{t('certificate.inProgressTitle', 'Certificado em Andamento')}</h2>
                    <p>{t('certificate.inProgressDesc', 'Você ainda não completou todas as missões!')}</p>
                    <div className="progress-summary">
                        <p>{t('certificate.progressInfo', { defaultValue: '{{completed}} de {{total}} questões resolvidas ({{percent}}%)',  completed: completedQuestions, total: totalQuestions, percent: progressPercent })}</p>
                    </div>
                    <p>{t('certificate.continueDesc', 'Continue sua jornada para desbloquear seu diploma oficial.')}</p>
                    <button onClick={() => navigate('/game')} className="btn-primary">{t('certificate.continueBtn', 'Continuar Jogando')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-page-container">
            <SEO title={t('certificate.unlockedSeoTitle', 'Seu Certificado Oficial')} description={t('certificate.unlockedSeoDesc', 'Baixe seu certificado de conclusão do PyExplorer!')} noindex />

            <div className="certificate-content-wrapper">
                <header className="certificate-page-header">
                    <h1>{t('certificate.congrats', { defaultValue: 'Parabéns, {{name}}! 🎉',  name: studentName.split(' ')[0] })}</h1>
                    <p>{t('certificate.subtitle', 'Você completou o curso de Python. Aqui está sua recompensa.')}</p>
                </header>

                <div className="donation-prompt">
                    <h3>💜 {t('certificate.supportTitle', 'Apoie o Projeto')}</h3>
                    <p>
                        {t('certificate.supportDesc', 'O PyExplorer é 100% gratuito e mantido por doações. Se você gostou da jornada, considere nos pagar um cafezinho para mantermos o servidor online para outras crianças.')}
                    </p>
                    <a
                        href="https://github.com/sponsors/albertoivo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sponsor"
                    >
                        {t('certificate.supportBtn', 'Fazer uma Doação (Opcional)')}
                    </a>
                </div>

                <CertificateGenerator
                    studentName={studentName}
                    completionDate={completionDate}
                />
            </div>
        </div>
    );
}
