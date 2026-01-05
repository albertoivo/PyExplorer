import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

/**
 * Página de login
 */
export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, enterAsGuest, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: Location })?.from?.pathname || '/game';
    const requireLogin = (location.state as { requireLogin?: boolean })?.requireLogin;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setIsLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            // Erro já é tratado pelo contexto
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestMode = () => {
        const guestName = prompt('Digite seu apelido para jogar como convidado:');
        if (guestName && guestName.trim()) {
            enterAsGuest(guestName.trim());
            navigate('/game', { replace: true });
        }
    };

    return (
        <div className="auth-page">
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

                {error && (
                    <div className="auth-alert auth-alert--error">
                        ❌ {error}
                    </div>
                )}

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
                        <input
                            id="password"
                            type="password"
                            className="form-input"
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
