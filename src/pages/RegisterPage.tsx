import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SEO } from '../components/common/SEO';
import { PasswordInput } from '../components/common/PasswordInput';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { GuestModeButton } from '../components/common/GuestModeButton';
import { AuthCard } from '../components/auth/AuthCard';
import { AuthAlert } from '../components/common/AuthAlert';
import './AuthPages.css';

/**
 * Página de cadastro
 */
export function RegisterPage() {
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
            setLocalError('O apelido deve ter pelo menos 2 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('As senhas não conferem');
            return;
        }

        if (password.length < 6) {
            setLocalError('A senha deve ter pelo menos 6 caracteres');
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
                title="Criar Conta Grátis"
                description="Crie sua conta gratuita no PyExplorer e comece sua aventura de aprender Python jogando!"
                breadcrumbs={[
                    { name: "Início", path: "/" },
                    { name: "Criar Conta", path: "/register" }
                ]}
            />
            <AuthCard
                icon="🎮"
                title="Criar sua Conta"
                subtitle="Junte-se à aventura de aprender Python!"
            >
                {(error || localError) && (
                    <AuthAlert type="error" message={error || localError} />
                )}

                <GoogleSignInButton
                    onClick={handleGoogleLogin}
                    disabled={anyLoading}
                    label={isGoogleLoading ? '⏳ Conectando...' : 'Inscrever-se com Google'}
                />

                <div className="auth-divider">
                    <span>ou use seu email</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="displayName" className="form-label">
                            👤 Como podemos te chamar?
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            className="form-input"
                            placeholder="Seu nome completo"
                            aria-label="Seu nome completo"
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
                            📧 Email (pode ser dos pais)
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={anyLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            🔑 Crie uma senha secreta
                        </label>
                        <PasswordInput
                            id="password"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={anyLoading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            🔐 Confirme a senha
                        </label>
                        <PasswordInput
                            id="confirmPassword"
                            placeholder="Digite a senha novamente"
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
                        {isLoading ? '⏳ Criando...' : '🌟 Criar Conta'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>ou</span>
                </div>

                <GuestModeButton />

                <div className="auth-links">
                    <p>
                        Já tem uma conta?{' '}
                        <Link to="/login" className="auth-link">
                            Fazer login
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </div>
    );
}
