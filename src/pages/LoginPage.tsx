import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/common/SEO';
import { PasswordInput } from '../components/common/PasswordInput';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { GuestModeButton } from '../components/common/GuestModeButton';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthAlert } from '../components/common/AuthAlert';
import { useTranslation } from 'react-i18next';
import './AuthPages.css';

/**
 * Página de login
 */
export function LoginPage() {
    const { t } = useTranslation('auth');
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
            setLocalError(t('login.resetEmailRequired'));
            return;
        }

        try {
            await sendPasswordReset(email.trim());
            setSuccessMessage(t('login.resetEmailSent', { email: email.trim() }));
        } catch (err) {
            const error = err as { code?: string; message?: string };
            if (error?.code === 'auth/user-not-found' || error?.message?.includes('auth/user-not-found')) {
                clearError();
                setSuccessMessage(t('login.resetEmailSent', { email: email.trim() }));
            }
        }
    };

    const anyLoading = isLoading || isGoogleLoading;

    return (
        <div className="auth-page">
            <SEO
                title={t('login.seoTitle')}
                description={t('login.seoDescription')}
                breadcrumbs={[
                    { name: t('common:nav.home', "Início"), path: "/" },
                    { name: t('login.breadcrumb'), path: "/login" }
                ]}
            />
            <AuthCard
                icon="🐍"
                title={t('login.title')}
                subtitle={t('login.subtitle')}
            >
                {requireLogin && (
                    <AuthAlert type="warning" message={t('login.requireLogin')} />
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
                    label={isGoogleLoading ? t('login.googleLoading') : t('login.googleButton')}
                />

                <div className="auth-divider">
                    <span>{t('common:orUseEmail', 'ou use seu email')}</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">{t('login.emailLabel')}</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder={t('login.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={anyLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">{t('login.passwordLabel')}</label>
                        <PasswordInput
                            id="password"
                            placeholder={t('login.passwordPlaceholder')}
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
                        {isLoading ? t('login.submitLoading') : t('login.submitButton')}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>{t('common:or', 'ou')}</span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="auth-btn--forgot-password"
                    >
                        {t('login.forgotPassword')}
                    </button>
                </div>

                <GuestModeButton />

                <div className="auth-links">
                    <p>
                        {t('login.noAccount')}{' '}
                        <Link to="/register" className="auth-link">
                            {t('login.createFree')}
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </div>
    );
}
