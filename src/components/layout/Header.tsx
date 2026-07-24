import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../context/GamificationContext';
import { SHOP_ITEMS } from '../../data/gamificationData';
import reactLogo from '../../assets/react.svg';
import './Header.css';

/**
 * Componente Header com navegação e informações do usuário
 */
export function Header() {
    const { userData, isGuest, logout, loading } = useAuth();
    const { gamification, currentLevel } = useGamification(); // Para ter o avatar atualizado em tempo real
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        }
    };

    const isActive = (path: string) => location.pathname === path;

    // Prioritize gamification streak (source of truth)
    const currentStreak = gamification?.streak?.currentStreak || 0;

    return (
        <header className="header">
            <div className="header__container">
                {/* Logo e nome do jogo */}
                <Link to="/" className="header__logo" aria-label="PyExplorer Página Inicial">
                    <span className="header__logo-icon" aria-hidden="true">
                        {(() => {
                            if (!userData && !isGuest) return '🐍';
                            const equippedAvatarId = gamification?.inventory?.equippedAvatar || 'avatar_snake_green';
                            const equippedFrameId = gamification?.inventory?.equippedFrame;
                            const avatarItem = SHOP_ITEMS.find(i => i.id === equippedAvatarId);
                            const frameItem = equippedFrameId ? SHOP_ITEMS.find(i => i.id === equippedFrameId) : null;
                            const avatarIcon = avatarItem?.icon || '🐍';

                            // Se tem moldura, envolve com borda
                            if (frameItem?.color) {
                                const borderColor = frameItem.color === 'rainbow'
                                    ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
                                    : frameItem.color;
                                return (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        padding: '3px',
                                        borderRadius: '50%',
                                        border: frameItem.color === 'rainbow' ? '3px solid transparent' : `3px solid ${borderColor}`,
                                        background: frameItem.color === 'rainbow' ? borderColor : 'transparent',
                                        backgroundClip: frameItem.color === 'rainbow' ? 'padding-box' : undefined,
                                    }}>
                                        <span style={{ fontSize: '24px', lineHeight: 1 }}>{avatarIcon}</span>
                                    </span>
                                );
                            }
                            return avatarIcon;
                        })()}
                    </span>
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
                    <Link
                        to="/learn"
                        className={`header__nav-link ${location.pathname.startsWith('/learn') ? 'header__nav-link--active' : ''}`}
                        aria-current={location.pathname.startsWith('/learn') ? 'page' : undefined}
                    >
                        <span aria-hidden="true">📚</span> Aprender
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
                                to="/certificate"
                                className={`header__nav-link ${location.pathname === '/certificate' ? 'header__nav-link--active' : ''}`}
                            >
                                <span aria-hidden="true" title="Certificado">📜</span>
                                <span className="header__nav-text">Certificado</span>
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
                                aria-label="Acessar Perfil"
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
                            <img src={reactLogo} className="header__avatar" alt="Avatar do usuário" />
                            <div className="header__user-details">
                                <span className="header__user-name">{userData.displayName}</span>
                                <p className="header__user-level">Nível {currentLevel?.level || 1}</p>
                                <span
                                    className="header__user-stars"
                                    title="Diamantes disponíveis"
                                    aria-label={`Diamantes disponíveis: ${userData.balance || 0}`}
                                >
                                    <span aria-hidden="true">💎</span> {userData.balance || 0}
                                </span>
                                <span
                                    className="header__user-streak"
                                    title="Ofensiva diária"
                                    aria-label={`Ofensiva diária: ${currentStreak} dias`}
                                >
                                    <span aria-hidden="true">🔥</span> {currentStreak}
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

