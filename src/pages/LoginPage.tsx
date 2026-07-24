import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/common/SEO';
import { PasswordInput } from '../components/common/PasswordInput';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { GuestModeButton } from '../components/common/GuestModeButton';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthAlert } from '../components/common/AuthAlert';
import './AuthPages.css';

/**
 * Página de login
 */
export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const { login, loginWithGoogle, sendPasswordReset, error, clearError, userData, isGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const requireLogin = (location.state as { requireLogin?: boolean })?.requireLogin;

    // Redireciona quando o userData ou modo convidado estiver pronto.
    useEffect(() => {
        if (userData || isGuest) {
            const destination = (location.state as { from?: Location })?.from?.pathname || '/game';
            navigate(destination, { replace: true });
        }
    }, [userData, isGuest, navigate, location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await login(email.trim(), password);
        } catch {
            // Erro já é tratado pelo contexto via setError
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        clearError();
        setLocalError(null);
        setIsGoogleLoading(true);
        try {
            await loginWithGoogle();
        } catch {
            // Erro já tratado pelo contexto
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        clearError();
        setLocalError(null);
        setSuccessMessage(null);

        if (!email.trim()) {
            setLocalError('Digite seu email no campo acima para redefinir a senha.');
            return;
        }

        try {
            await sendPasswordReset(email.trim());
            setSuccessMessage(`Email de redefinição enviado para ${email.trim()}!`);
        } catch (err) {
            const error = err as { code?: string; message?: string };
            if (error?.code === 'auth/user-not-found' || error?.message?.includes('auth/user-not-found')) {
                clearError();
                setSuccessMessage(`Email de redefinição enviado para ${email.trim()}!`);
            }
        }
    };

    const anyLoading = isLoading || isGoogleLoading;

    return (
        <div className="auth-page">
            <SEO
                title="Entrar"
                description="Faça login no PyExplorer para continuar sua aventura de aprender Python jogando!"
            />
            <AuthCard
                icon="🐍"
                title="Entrar no PyExplorer"
                subtitle="Continue sua aventura de aprender Python!"
            >
                {requireLogin && (
                    <AuthAlert type="warning" message="Você precisa fazer login para acessar esta página" />
                )}

                {(error || localError) && (
                    <AuthAlert type="error" message={error || localError} />
                )}

                {successMessage && (
                    <AuthAlert type="success" message={successMessage} />
                )}

                <GoogleSignInButton
                    onClick={handleGoogleLogin}
                    disabled={anyLoading}
                    label={isGoogleLoading ? '⏳ Entrando...' : 'Entrar com Google'}
                />

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
                            disabled={anyLoading}
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
                            disabled={anyLoading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn auth-btn--primary"
                        disabled={anyLoading}
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
                        onClick={handlePasswordReset}
                        className="auth-btn--forgot-password"
                    >
                        Esqueci minha senha
                    </button>
                </div>

                <GuestModeButton />

                <div className="auth-links">
                    <p>
                        Não tem uma conta?{' '}
                        <Link to="/register" className="auth-link">
                            Criar conta grátis
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </div>
    );
}
