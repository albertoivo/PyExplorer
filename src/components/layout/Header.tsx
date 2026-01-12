import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

/**
 * Componente Header com navegação e informações do usuário
 */
export function Header() {
    const { userData, isGuest, logout, loading } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        }
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="header">
            <div className="header__container">
                {/* Logo e nome do jogo */}
                <Link to="/" className="header__logo" aria-label="PyExplorer Página Inicial">
                    <span className="header__logo-icon" aria-hidden="true">🐍</span>
                    <span className="header__logo-text">PyExplorer</span>
                </Link>

                {/* Navegação principal */}
                <nav className="header__nav">
                    <Link
                        to="/"
                        className={`header__nav-link ${isActive('/') ? 'header__nav-link--active' : ''}`}
                        aria-current={isActive('/') ? 'page' : undefined}
                    >
                        <span aria-hidden="true">🏠</span> Início
                    </Link>

                    {userData && (
                        <>
                            <Link
                                to="/game"
                                className={`header__nav-link ${isActive('/game') ? 'header__nav-link--active' : ''}`}
                                aria-current={isActive('/game') ? 'page' : undefined}
                            >
                                <span aria-hidden="true">🎮</span> Jogar
                            </Link>
                            <Link
                                to="/rewards"
                                className={`header__nav-link ${isActive('/rewards') ? 'header__nav-link--active' : ''}`}
                                aria-current={isActive('/rewards') ? 'page' : undefined}
                            >
                                <span aria-hidden="true">🏆</span> Recompensas
                            </Link>
                            <Link
                                to="/profile"
                                className={`header__nav-link ${isActive('/profile') ? 'header__nav-link--active' : ''}`}
                                aria-current={isActive('/profile') ? 'page' : undefined}
                            >
                                <span aria-hidden="true">👤</span> Perfil
                            </Link>
                        </>
                    )}
                </nav>

                {/* Área do usuário */}
                <div className="header__user">
                    {loading ? (
                        <div className="header__loading">Carregando...</div>
                    ) : userData ? (
                        <div className="header__user-info">
                            <div className="header__user-details">
                                <span className="header__user-name">{userData.displayName}</span>
                                <span
                                    className="header__user-stars"
                                    title="Estrelas disponíveis"
                                    aria-label={`Estrelas disponíveis: ${userData.balance || 0}`}
                                >
                                    <span aria-hidden="true">⭐</span> {userData.balance || 0}
                                </span>
                                <span
                                    className="header__user-streak"
                                    title="Ofensiva diária"
                                    aria-label={`Ofensiva diária: ${userData.streak || 0} dias`}
                                >
                                    <span aria-hidden="true">🔥</span> {userData.streak || 0}
                                </span>
                                {isGuest && <span className="header__user-guest">(Convidado)</span>}
                            </div>
                            <button onClick={handleLogout} className="header__logout-btn">
                                Sair
                            </button>
                        </div>
                    ) : (
                        <div className="header__auth-links">
                            <Link to="/login" className="header__auth-link">
                                Entrar
                            </Link>
                            <Link to="/register" className="header__auth-link header__auth-link--primary">
                                Criar Conta
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
