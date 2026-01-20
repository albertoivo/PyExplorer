import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from '../HomePage';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../hooks/useGamification';
import { useProgress } from '../../hooks/useProgress';

// Mock hooks
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useGamification');
vi.mock('../../hooks/useProgress');

// Mock components
vi.mock('../../components/common/SEO', () => ({
    SEO: () => <div data-testid="seo-mock" />
}));

describe('HomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mocks
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ userData: null });
        (useGamification as ReturnType<typeof vi.fn>).mockReturnValue({
            currentLevel: { level: 1, name: 'Novato', icon: '🌱' },
            levelProgress: 0,
            streak: { currentStreak: 0, longestStreak: 0 }
        });
        (useProgress as ReturnType<typeof vi.fn>).mockReturnValue({
            stats: { completed: 0 }
        });
    });

    const renderPage = () => render(
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    );

    it('renders hero section for guest users', () => {
        renderPage();

        // Hero title parts
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/Aprenda/);
        expect(heading).toHaveTextContent(/Python/);
        expect(heading).toHaveTextContent(/como um Herói!/);

        // Guest buttons
        expect(screen.getByText('🎮 Começar a Jogar')).toBeInTheDocument();
        expect(screen.getByText('Já tenho conta')).toBeInTheDocument();
    });

    it('renders user progress for logged in users', () => {
        const mockUser = { displayName: 'TestUser', balance: 50, totalScore: 200 };
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ userData: mockUser });
        (useGamification as ReturnType<typeof vi.fn>).mockReturnValue({
            currentLevel: { level: 5, name: 'Explorador', icon: '🗺️' },
            levelProgress: 75,
            streak: { currentStreak: 3, longestStreak: 10 }
        });
        (useProgress as ReturnType<typeof vi.fn>).mockReturnValue({
            stats: { completed: 15 }
        });

        renderPage();

        expect(screen.getByText('👋 Olá, TestUser!')).toBeInTheDocument();
        expect(screen.getByText('Explorador')).toBeInTheDocument();
        expect(screen.getByText('75% para o próximo nível')).toBeInTheDocument();
        expect(screen.getByText('3 dias')).toBeInTheDocument(); // Streak
        expect(screen.getByText('50')).toBeInTheDocument(); // Stars (balance)
        expect(screen.getByText('15')).toBeInTheDocument(); // Questions

        // Logged in buttons
        expect(screen.getAllByText('🎮 Jogar Agora')).toHaveLength(1); // One in progress section
        expect(screen.getByText('🚀 Continuar Aventura')).toBeInTheDocument(); // One in hero section
    });

    it('renders features section', () => {
        renderPage();

        expect(screen.getByText('Por que o PyExplorer é Especial?')).toBeInTheDocument();
        expect(screen.getByText('Questões Interativas')).toBeInTheDocument();
        expect(screen.getByText('11 Mundos para Explorar')).toBeInTheDocument();
        expect(screen.getByText('Python no Navegador')).toBeInTheDocument();
    });

    it('renders worlds preview', () => {
        renderPage();

        expect(screen.getByText('Mundos do PyExplorer')).toBeInTheDocument();
        // Check for first world (usually Basic Commands)
        // Note: WORLDS data might change, so checking for the container or generic structure
        const previews = document.querySelectorAll('.world-preview');
        expect(previews.length).toBeGreaterThan(0);
    });

    it('renders Learn Section preview', () => {
        renderPage();

        expect(screen.getByText(/Aprenda Python Gratuitamente/)).toBeInTheDocument();
        expect(screen.getByText('O que é Python?')).toBeInTheDocument();
        expect(screen.getByText('Guia para Pais')).toBeInTheDocument();
    });

    it('renders SEO component', () => {
        renderPage();
        expect(screen.getByTestId('seo-mock')).toBeInTheDocument();
    });

    it('preloads pyodide on hover over play button (logged in)', () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ userData: { displayName: 'User' } });
        renderPage();

        const playBtn = screen.getByText('🚀 Continuar Aventura');

        // Note: document.head is shared in JSDOM, might need cleanup
        const headAppendSpy = vi.spyOn(document.head, 'appendChild');

        // Simulate hover
        fireEvent.mouseEnter(playBtn);

        // Should try to append link
        expect(headAppendSpy).toHaveBeenCalled();
        const callArg = headAppendSpy.mock.calls[0][0] as HTMLLinkElement;
        expect(callArg.rel).toBe('prefetch');
        expect(callArg.href).toContain('pyodide.js');
    });
});
