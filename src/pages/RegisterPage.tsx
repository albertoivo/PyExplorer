import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
    const [localError, setLocalError] = useState<string | null>(null);

    const { register, enterAsGuest, error, clearError, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/game', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        // Validações básicas
        if (displayName.trim().length < 2) {
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
            await register(email, password, displayName.trim());
            navigate('/game', { replace: true });
        } catch {
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
                    <div className="auth-card__icon">🎮</div>
                    <h1 className="auth-card__title">Criar sua Conta</h1>
                    <p className="auth-card__subtitle">
                        Junte-se à aventura de aprender Python!
                    </p>
                </div>

                {(error || localError) && (
                    <div className="auth-alert auth-alert--error">
                        ❌ {error || localError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="displayName" className="form-label">
                            👤 Como podemos te chamar?
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            className="form-input"
                            placeholder="Seu apelido no jogo"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            🔑 Crie uma senha secreta
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            🔐 Confirme a senha
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="Digite a senha novamente"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? '⏳ Criando...' : '🌟 Criar Conta'}
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
                        Já tem uma conta?{' '}
                        <Link to="/login" className="auth-link">
                            Fazer login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
