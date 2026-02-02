import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import * as authContext from '../../../hooks/useAuth';
import * as gamificationContext from '../../../context/GamificationContext';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../../hooks/useAuth');
vi.mock('../../../context/GamificationContext');

// Helper to render with Router
const renderWithRouter = (ui: React.ReactNode) => {
    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    );
};

describe('Header', () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mocks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (gamificationContext.useGamification as any).mockReturnValue({
            gamification: {
                streak: { currentStreak: 5 },
                inventory: { equippedAvatar: 'default', equippedFrame: 'default' }
            }
        });
    });

    it('renders login/register links when guest (no user)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authContext.useAuth as any).mockReturnValue({
            userData: null,
            isGuest: false,
            loading: false,
            logout: mockLogout
        });

        renderWithRouter(<Header />);

        expect(screen.getByText('Entrar')).toBeInTheDocument();
        expect(screen.getByText('Criar Conta')).toBeInTheDocument();
        expect(screen.queryByText('Sair')).not.toBeInTheDocument();
    });

    it('renders user info when logged in', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authContext.useAuth as any).mockReturnValue({
            userData: {
                uid: '123',
                displayName: 'Test User',
                balance: 100
            },
            isGuest: false,
            loading: false,
            logout: mockLogout
        });

        renderWithRouter(<Header />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument(); // Balance
        expect(screen.getByText('5')).toBeInTheDocument(); // Streak from gamification
        expect(screen.getByText('Sair')).toBeInTheDocument();

        // Check navigation links for logged user
        expect(screen.getByText('Jogar')).toBeInTheDocument();
        expect(screen.getByText('Perfil')).toBeInTheDocument();
    });

    it('shows guest label for guest users', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authContext.useAuth as any).mockReturnValue({
            userData: { displayName: 'Guest' },
            isGuest: true,
            loading: false,
            logout: mockLogout
        });

        renderWithRouter(<Header />);

        expect(screen.getByText('(Convidado)')).toBeInTheDocument();
    });

    it('calls logout when clicking exit', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authContext.useAuth as any).mockReturnValue({
            userData: { displayName: 'User' },
            isGuest: false,
            loading: false,
            logout: mockLogout
        });

        renderWithRouter(<Header />);

        fireEvent.click(screen.getByText('Sair'));
        expect(mockLogout).toHaveBeenCalled();
    });

    it('shows loading state', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authContext.useAuth as any).mockReturnValue({
            userData: null,
            loading: true
        });

        renderWithRouter(<Header />);

        expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
});
