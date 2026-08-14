import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../../context/GamificationContext';
import { SHOP_ITEMS } from '../../data/gamificationData';
import { LanguageSwitcher } from './LanguageSwitcher';
import reactLogo from '../../assets/react.svg';
import './Header.css';

/**
 * Componente Header com navegação e informações do usuário
 * Design moderno com Glassmorphism, Quick Stats Pill e Drawer Responsivo
 */
export function Header() {
    const { userData, isGuest, logout, loading } = useAuth();
    const { gamification, currentLevel } = useGamification();

    const { t } = useTranslation('common');
    const [menuOpen, setMenuOpen] = useState(false);

    // Previne scroll da página quando o menu drawer mobile está aberto
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            setMenuOpen(false);
            await logout();
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        }
    };



    // Prioritize gamification streak (source of truth)
    const currentStreak = gamification?.streak?.currentStreak || 0;

    return (
        <header className="header">
            <div className="header__container">
                {/* Logo e Nome do PyExplorer */}
                <Link to="/" className="header__logo" aria-label="PyExplorer Página Inicial">
                    <span className="header__logo-icon-wrapper">
                        {(() => {
                            if (!userData && !isGuest) return <span className="header__logo-emoji">🐍</span>;
                            const equippedAvatarId = gamification?.inventory?.equippedAvatar || 'avatar_snake_green';
                            const equippedFrameId = gamification?.inventory?.equippedFrame;
                            const avatarItem = SHOP_ITEMS.find(i => i.id === equippedAvatarId);
                            const frameItem = equippedFrameId ? SHOP_ITEMS.find(i => i.id === equippedFrameId) : null;
                            const avatarIcon = avatarItem?.icon || '🐍';

                            if (frameItem?.color) {
                                const borderColor = frameItem.color === 'rainbow'
                                    ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
                                    : frameItem.color;
                                return (
                                    <span className="header__logo-avatar-frame" style={{
                                        border: frameItem.color === 'rainbow' ? '2px solid transparent' : `2px solid ${borderColor}`,
                                        background: frameItem.color === 'rainbow' ? borderColor : 'transparent',
                                    }}>
                                        <span className="header__logo-emoji">{avatarIcon}</span>
                                    </span>
                                );
                            }
                            return <span className="header__logo-emoji">{avatarIcon}</span>;
                        })()}
                    </span>
                    <span className="header__logo-text">PyExplorer</span>
                </Link>

                {/* Quick Stats Pill para Mobile (Visível apenas em telas pequenas quando logado) */}
                {userData && (
                    <div className="header__quick-stats" aria-label={t('nav.stats')}>
                        <span className="quick-stat" title={t('diamonds')}>
                            <span aria-hidden="true">💎</span> {userData.balance || 0}
                        </span>
                        <span className="quick-stat" title={t('streak')}>
                            <span aria-hidden="true">🔥</span> {currentStreak}
                        </span>
                    </div>
                )}

                {/* Ações do Header à Direita (Desktop & Botão Hambúrguer Mobile) */}
                <div className="header__actions">
                    <LanguageSwitcher />
                    <button
                        className={`header__hamburger ${menuOpen ? 'header__hamburger--active' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                        aria-expanded={menuOpen}
                    >
                        <span className="header__hamburger-bar"></span>
                        <span className="header__hamburger-bar"></span>
                        <span className="header__hamburger-bar"></span>
                    </button>
                </div>

                {/* Navegação principal + Perfil User (Mobile Drawer / Desktop Inline) */}
                <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
                    {/* Cabeçalho do Perfil dentro do Drawer Mobile */}
                    {userData && (
                        <div className="header__mobile-profile">
                            <div className="mobile-profile__avatar-container">
                                <img src={reactLogo} className="mobile-profile__avatar" alt="Avatar" />
                                <span className="mobile-profile__level-badge">{t('nav.level')} {currentLevel?.level || 1}</span>
                            </div>
                            <div className="mobile-profile__info">
                                <span className="mobile-profile__name">{userData.displayName}</span>
                                <span className="mobile-profile__title">{currentLevel?.name || t('nav.explorer')}</span>
                            </div>
                        </div>
                    )}

                    {/* Links de Navegação */}
                    <div className="header__nav-links">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                            end
                        >
                            <span className="nav-icon" aria-hidden="true">🏠</span> {t('nav.home')}
                        </NavLink>

                        <NavLink
                            to="/learn"
                            className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="nav-icon" aria-hidden="true">📚</span> {t('nav.learn')}
                        </NavLink>

                        {userData && (
                            <>
                                <NavLink
                                    to="/game"
                                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="nav-icon" aria-hidden="true">🎮</span> {t('nav.play')}
                                </NavLink>

                                <NavLink
                                    to="/certificate"
                                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="nav-icon" aria-hidden="true">📜</span> {t('nav.certificate')}
                                </NavLink>

                                <NavLink
                                    to="/rewards"
                                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="nav-icon" aria-hidden="true">🏆</span> {t('nav.rewards')}
                                </NavLink>

                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="nav-icon" aria-hidden="true">👤</span> {t('nav.profile')}
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* Área do usuário / Auth no Desktop & Footer do Drawer no Mobile */}
                    <div className="header__user-desktop">
                        {loading ? (
                            <div className="header__loading">{t('nav.loading')}</div>
                        ) : userData ? (
                            <div className="header__user-pill">
                                <div className="user-pill__stats">
                                    <span className="stat-item" title={t('diamonds')}>
                                        <span aria-hidden="true">💎</span> {userData.balance || 0}
                                    </span>
                                    <span className="stat-item" title={t('streak')}>
                                        <span aria-hidden="true">🔥</span> {currentStreak}
                                    </span>
                                </div>
                                <div className="user-pill__profile">
                                    <img src={reactLogo} className="user-pill__avatar" alt="Avatar" />
                                    <div className="user-pill__details">
                                        <span className="user-pill__name">{userData.displayName}</span>
                                        <span className="user-pill__level">{t('nav.level')} {currentLevel?.level || 1}</span>
                                        {isGuest && <span className="header__user-guest">({t('nav.guest')})</span>}
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="header__logout-btn" title={t('nav.logout')}>
                                    <span aria-hidden="true">🚪</span> {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="header__auth-links">
                                <Link to="/login" className="header__auth-link" onClick={() => setMenuOpen(false)}>
                                    {t('nav.login')}
                                </Link>
                                <Link to="/register" className="header__auth-link header__auth-link--primary" onClick={() => setMenuOpen(false)}>
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

