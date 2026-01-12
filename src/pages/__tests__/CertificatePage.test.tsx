import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CertificatePage } from '../CertificatePage';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

// Mocks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock hooks
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock child components to avoid deep rendering issues
vi.mock('../../components/game/CertificateGenerator', () => ({
    CertificateGenerator: ({ studentName }: { studentName: string }) => (
        <div data-testid="certificate-generator">Generated for {studentName}</div>
    ),
}));

vi.mock('../../components/common/SEO', () => ({
    SEO: () => null,
}));

describe('CertificatePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderPage = () => {
        return render(
            <HelmetProvider>
                <MemoryRouter>
                    <CertificatePage />
                </MemoryRouter>
            </HelmetProvider>
        );
    };

    it('redirects to login if user is guest (null)', () => {
        mockUseAuth.mockReturnValue({ user: null, userData: null });
        renderPage();

        expect(screen.getByText('🔒 Acesso Restrito')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Entrar'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('shows locked state if user has NOT completed 8 worlds', () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Noob' },
            userData: { unlockedWorlds: ['world1', 'world2'] }, // Only 2
        });
        renderPage();

        expect(screen.getByText('Certificado em Andamento')).toBeInTheDocument();
        expect(screen.getByText('Você ainda não completou todos os mundos!')).toBeInTheDocument();
        expect(screen.queryByTestId('certificate-generator')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Continuar Jogando'));
        expect(mockNavigate).toHaveBeenCalledWith('/game');
    });

    it('shows certificate and donation prompt if user completed >= 8 worlds', () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Master' },
            userData: { unlockedWorlds: new Array(8).fill('world') }, // 8 worlds
        });
        renderPage();

        expect(screen.getByText('Parabéns, Master! 🎉')).toBeInTheDocument();
        expect(screen.getAllByText('💜 Apoie o Projeto').length).toBeGreaterThan(0);
        expect(screen.getByTestId('certificate-generator')).toBeInTheDocument();
    });

    it('uses fallback name if display name is missing', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@test.com' }, // No display name
            userData: { unlockedWorlds: new Array(8).fill('world') },
        });
        renderPage();

        expect(screen.getByText(/Parabéns, Apreciador!/)).toBeInTheDocument();
    });
});
