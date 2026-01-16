import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../Header';
import { useAuth } from '../../../hooks/useAuth';
import { useGamification } from '../../../hooks/useGamification';
import { MemoryRouter } from 'react-router-dom';

// Mock hooks
vi.mock('../../../hooks/useAuth');
vi.mock('../../../hooks/useGamification');

describe('Header Component', () => {
    const mockLogout = vi.fn();

    // Default mock values
    const defaultGamification = {
        inventory: {
            equippedAvatar: 'avatar_snake_green',
            equippedFrame: null
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (useGamification as any).mockReturnValue({
            gamification: defaultGamification
        });

        // Default to guest/logged out
        (useAuth as any).mockReturnValue({
            userData: null,
            isGuest: false,
            loading: false,
            logout: mockLogout
        });
    });

    const renderHeader = (initialEntries = ['/']) => {
        render(
            <MemoryRouter initialEntries={initialEntries}>
                <Header />
            </MemoryRouter>
        );
    };

    it('should render public links when not logged in', () => {
        renderHeader();

        expect(screen.getByText('PyExplorer')).toBeInTheDocument();
        expect(screen.getByText('Início')).toBeInTheDocument();
        expect(screen.getByText('Entrar')).toBeInTheDocument();
        expect(screen.getByText('Criar Conta')).toBeInTheDocument();

        // Should not show protected links
        expect(screen.queryByText('Jogar')).not.toBeInTheDocument();
        expect(screen.queryByText('Perfil')).not.toBeInTheDocument();
    });

    it('should show loading state', () => {
        (useAuth as any).mockReturnValue({
            userData: null,
            loading: true
        });

        renderHeader();
        expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('should render user info and protected links when logged in', () => {
        (useAuth as any).mockReturnValue({
            userData: {
                displayName: 'Test User',
                balance: 100,
                streak: 5,
                uid: '123'
            },
            isGuest: false,
            loading: false,
            logout: mockLogout
        });

        renderHeader();

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument(); // Stars
        expect(screen.getByText('5')).toBeInTheDocument(); // Streak

        expect(screen.getByText('Jogar')).toBeInTheDocument();
        expect(screen.getByText('Certificado')).toBeInTheDocument();
        expect(screen.getByText('Recompensas')).toBeInTheDocument();
        expect(screen.getByText('Perfil')).toBeInTheDocument();
        expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('should show (Convidado) label for guest users', () => {
        (useAuth as any).mockReturnValue({
            userData: {
                displayName: 'Guest User',
                balance: 0,
                streak: 0
            },
            isGuest: true, // Guest!
            loading: false,
            logout: mockLogout
        });

        renderHeader();
        expect(screen.getByText('(Convidado)')).toBeInTheDocument();
    });

    it('should call logout on button click', () => {
        (useAuth as any).mockReturnValue({
            userData: { displayName: 'User' },
            logout: mockLogout
        });

        renderHeader();

        const logoutBtn = screen.getByText('Sair');
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
    });

    it('should highlight active link', () => {
        (useAuth as any).mockReturnValue({ userData: { displayName: 'User' } });

        // Render at /game path
        renderHeader(['/game']);

        const gameLink = screen.getByText('Jogar').closest('a');
        expect(gameLink).toHaveClass('header__nav-link--active');
        expect(gameLink).toHaveAttribute('aria-current', 'page');

        const homeLink = screen.getByText('Início').closest('a');
        expect(homeLink).not.toHaveClass('header__nav-link--active');
    });

    it('should render custom avatar and frame from gamification', () => {
        (useAuth as any).mockReturnValue({ userData: { displayName: 'User' } });
        (useGamification as any).mockReturnValue({
            gamification: {
                inventory: {
                    equippedAvatar: 'avatar_robot', // Robot icon 🤖
                    equippedFrame: 'frame_fire' // Fire frame
                }
            }
        });

        renderHeader();

        const logo = screen.getByLabelText('PyExplorer Página Inicial');
        expect(logo).toHaveTextContent('🤖');
    });
});
