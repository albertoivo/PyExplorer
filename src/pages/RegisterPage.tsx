import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
 * Página de cadastro
 */
export function RegisterPage() {
    const { t } = useTranslation('auth');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { register, loginWithGoogle, error, clearError, userData, isGuest } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userData || isGuest) {
            navigate('/game', { replace: true });
        }
    }, [userData, isGuest, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        const trimmedName = displayName.trim();
        const trimmedEmail = email.trim();

        // Validações
        if (trimmedName.length < 2) {
            setLocalError(t('register.errorNameShort'));
            return;
        }

        if (password !== confirmPassword) {
            setLocalError(t('register.errorPasswordMismatch'));
            return;
        }

        if (password.length < 6) {
            setLocalError(t('register.errorPasswordShort'));
            return;
        }

        setIsLoading(true);

        try {
            await register(trimmedEmail, password, trimmedName);
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

    const anyLoading = isLoading || isGoogleLoading;

    return (
        <div className="auth-page">
            <SEO
                title={t('register.seoTitle')}
                description={t('register.seoDescription')}
                breadcrumbs={[
                    { name: t('common:nav.home', "Início"), path: "/" },
                    { name: t('register.breadcrumb'), path: "/register" }
                ]}
            />
            <AuthCard
                icon="🎮"
                title={t('register.title')}
                subtitle={t('register.subtitle')}
            >
                {(error || localError) && (
                    <AuthAlert type="error" message={error || localError} />
                )}

                <GoogleSignInButton
                    onClick={handleGoogleLogin}
                    disabled={anyLoading}
                    label={isGoogleLoading ? t('register.googleLoading') : t('register.googleButton')}
                />

                <div className="auth-divider">
                    <span>{t('common:orUseEmail', 'ou use seu email')}</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="displayName" className="form-label">
                            {t('register.nameLabel')}
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            className="form-input"
                            placeholder={t('register.namePlaceholder')}
                            aria-label={t('register.namePlaceholder')}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            disabled={anyLoading}
                            minLength={2}
                            maxLength={20}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            {t('register.emailLabel')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder={t('register.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={anyLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            {t('register.passwordLabel')}
                        </label>
                        <PasswordInput
                            id="password"
                            placeholder={t('register.passwordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={anyLoading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            {t('register.confirmLabel')}
                        </label>
                        <PasswordInput
                            id="confirmPassword"
                            placeholder={t('register.confirmPlaceholder')}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? t('register.submitLoading') : t('register.submitButton')}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>{t('common:or', 'ou')}</span>
                </div>

                <GuestModeButton />

                <div className="auth-links">
                    <p>
                        {t('register.hasAccount')}{' '}
                        <Link to="/login" className="auth-link">
                            {t('register.doLogin')}
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </div>
    );
}
