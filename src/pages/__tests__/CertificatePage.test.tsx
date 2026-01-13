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
const mockUseQuestionsFirestore = vi.fn();
const mockUseProgress = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('../../hooks/useQuestionsFirestore', () => ({
    useQuestionsFirestore: () => mockUseQuestionsFirestore(),
}));

vi.mock('../../hooks/useProgress', () => ({
    useProgress: () => mockUseProgress(),
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
        // Default mocks
        mockUseAuth.mockReturnValue({ user: { displayName: 'User' }, userData: {} });
        mockUseQuestionsFirestore.mockReturnValue({ questions: [], loading: false });
        mockUseProgress.mockReturnValue({ allProgress: [], loading: false });
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

    it('shows loading state while fetching data', () => {
        mockUseQuestionsFirestore.mockReturnValue({ questions: [], loading: true });
        renderPage();
        expect(screen.getByText(/Verificando sua jornada/i)).toBeInTheDocument();
    });

    it('shows locked state if user has NOT completed all questions', () => {
        mockUseQuestionsFirestore.mockReturnValue({
            questions: [{ id: 'q1' }, { id: 'q2' }],
            loading: false
        });
        mockUseProgress.mockReturnValue({
            allProgress: [{ questionId: 'q1', status: 'completed' }], // Only 1 completed
            loading: false
        });

        renderPage();

        expect(screen.getByText('Certificado em Andamento')).toBeInTheDocument();
        expect(screen.getByText('Você ainda não completou todas as missões!')).toBeInTheDocument();
        expect(screen.getByText(/1 de 2 questões resolvidas/)).toBeInTheDocument();
        expect(screen.queryByTestId('certificate-generator')).not.toBeInTheDocument();
    });

    it('shows certificate if user completed ALL questions', () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Master' },
            userData: {},
        });
        mockUseQuestionsFirestore.mockReturnValue({
            questions: [{ id: 'q1' }, { id: 'q2' }],
            loading: false
        });
        mockUseProgress.mockReturnValue({
            allProgress: [
                { questionId: 'q1', status: 'completed' },
                { questionId: 'q2', status: 'completed' }
            ],
            loading: false
        });

        renderPage();

        expect(screen.getByText('Parabéns, Master! 🎉')).toBeInTheDocument();
        expect(screen.getByTestId('certificate-generator')).toBeInTheDocument();
    });

    it('uses fallback name if display name is missing', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@test.com' }, // No display name
            userData: { displayName: null },
        });
        mockUseQuestionsFirestore.mockReturnValue({ questions: [], loading: false }); // Empty means completed (0/0) -> actually loop logic says >0 required.
        // Wait, my logic is: totalQuestions > 0 && completed >= total.
        // If totalQuestions is 0, isCompleted is false.
        // Let's provide questions.
        mockUseQuestionsFirestore.mockReturnValue({
            questions: [{ id: 'q1' }],
            loading: false
        });
        mockUseProgress.mockReturnValue({
            allProgress: [{ questionId: 'q1', status: 'completed' }],
            loading: false
        });

        renderPage();

        expect(screen.getByText(/Parabéns, Apreciador!/)).toBeInTheDocument();
    });
});
