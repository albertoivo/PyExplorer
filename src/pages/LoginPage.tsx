import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/common/SEO';
import { PasswordInput } from '../components/common/PasswordInput';
import './AuthPages.css';

// Variável global para rastrear se já redirecionou (persiste entre remontagens do componente)
let hasRedirectedAfterLogin = false;

// Função para resetar o redirect (chamada no logout)
export function resetLoginRedirectFlag() {
    hasRedirectedAfterLogin = false;
}

/**
 * Página de login
 */
export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const { login, enterAsGuest, loginWithGoogle, sendPasswordReset, error, clearError, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const requireLogin = (location.state as { requireLogin?: boolean })?.requireLogin;

    // Reset the redirect flag when arriving at login page without a user
    // This ensures redirect works on every new login session
    useEffect(() => {
        if (!user) {
            hasRedirectedAfterLogin = false;
        }
    }, [user]);

    // Redireciona quando usuário logar (usa variável global para evitar loops)
    useEffect(() => {
        if (user && !hasRedirectedAfterLogin) {
            const destination = (location.state as { from?: Location })?.from?.pathname || '/game';
            console.log('User logged in, redirecting to:', destination);
            hasRedirectedAfterLogin = true;
            navigate(destination, { replace: true });
        }
    }, [user, navigate, location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await login(email, password);
            // Use window.location.href for reliable redirect (navigate() doesn't work due to async state timing)
            const destination = (location.state as { from?: Location })?.from?.pathname || '/game';
            console.log('Login successful, redirecting to:', destination);
            hasRedirectedAfterLogin = true;
            window.location.href = destination;
        } catch {
            // Erro já é tratado pelo contexto
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestMode = () => {
        // Gera um nome aleatório divertido para o convidado
        const adjectives = ['Veloz', 'Esperto', 'Curioso', 'Valente', 'Sábio', 'Alegre'];
        const nouns = ['Viajante', 'Explorador', 'Aventureiro', 'Cientista', 'Mago', 'Ninja'];

        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const guestName = `${noun} ${adj}`;

        enterAsGuest(guestName);
        navigate('/game', { replace: true });
    };

    return (
        <div className="auth-page">
            <SEO
                title="Entrar"
                description="Faça login no PyExplorer para continuar sua aventura de aprender Python jogando!"
            />
            <div className="auth-card">
                <div className="auth-card__header">
                    <div className="auth-card__icon">🐍</div>
                    <h1 className="auth-card__title">Entrar no PyExplorer</h1>
                    <p className="auth-card__subtitle">
                        Continue sua aventura de aprender Python!
                    </p>
                </div>

                {requireLogin && (
                    <div className="auth-alert auth-alert--warning">
                        ⚠️ Você precisa fazer login para acessar esta página
                    </div>
                )}

                {(error || localError) && (
                    <div className="auth-alert auth-alert--error">
                        ❌ {error || localError}
                    </div>
                )}

                {successMessage && (
                    <div className="auth-alert auth-alert--success">
                        ✅ {successMessage}
                    </div>
                )}

                <button
                    className="auth-btn auth-btn--google"
                    onClick={() => {
                        clearError();
                        loginWithGoogle();
                    }}
                    disabled={isLoading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Entrar com Google
                </button>

                <div className="auth-divider">
                    <span>ou use seu email</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">📧 Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">🔑 Senha</label>
                        <PasswordInput
                            id="password"
                            placeholder="Sua senha secreta"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn auth-btn--primary"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Entrando...' : '🚀 Entrar'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>ou</span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <button
                        type="button"
                        onClick={async () => {
                            clearError();
                            setLocalError(null);
                            setSuccessMessage(null);

                            if (!email) {
                                setLocalError('Digite seu email no campo acima para redefinir a senha.');
                                return;
                            }

                            try {
                                await sendPasswordReset(email);
                                setSuccessMessage(`Email de redefinição enviado para ${email}!`);
                            } catch {
                                // Erro já tratado pelo context (setError)
                            }
                        }}
                        className="auth-btn--forgot-password"
                    >
                        Esqueci minha senha
                    </button>
                </div>

                <button
                    className="auth-btn auth-btn--guest"
                    onClick={handleGuestMode}
                >
                    👤 Jogar como Convidado
                </button>

                <p className="auth-guest-note">
                    💡 No modo convidado, seu progresso fica salvo apenas neste dispositivo
                </p>

                <div className="auth-links">
                    <p>
                        Não tem uma conta?{' '}
                        <Link to="/register" className="auth-link">
                            Criar conta grátis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
