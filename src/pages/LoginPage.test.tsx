import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { useAuth } from '../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock do hook useAuth
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockLoginWithGoogle = vi.fn();
    const mockEnterAsGuest = vi.fn();
    const mockClearError = vi.fn();

    const renderLoginPage = () => {
        return render(
            <HelmetProvider>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </HelmetProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup padrão do mock useAuth
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            login: mockLogin,
            loginWithGoogle: mockLoginWithGoogle,
            enterAsGuest: mockEnterAsGuest,
            clearError: mockClearError,
            error: null,
            user: null,
        });
    });

    it('deve renderizar o formulário de login corretamente', () => {
        renderLoginPage();

        expect(screen.getByText('Entrar no PyExplorer')).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🚀 Entrar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeInTheDocument();
    });

    it('deve permitir digitar email e senha', () => {
        renderLoginPage();

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/senha/i);

        fireEvent.change(emailInput, { target: { value: 'teste@exemplo.com' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });

        expect(emailInput).toHaveValue('teste@exemplo.com');
        expect(passwordInput).toHaveValue('123456');
    });

    it('deve chamar a função login ao submeter o formulário', async () => {
        renderLoginPage();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'teste@exemplo.com' } });
        fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: '123456' } });

        const loginBtn = screen.getByRole('button', { name: '🚀 Entrar' });
        fireEvent.click(loginBtn);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('teste@exemplo.com', '123456');
        });
    });

    it('deve exibir mensagem de erro quando o contexto retorna erro', () => {
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            login: mockLogin,
            loginWithGoogle: mockLoginWithGoogle,
            enterAsGuest: mockEnterAsGuest,
            clearError: mockClearError,
            error: 'Email ou senha incorretos',
            user: null,
        });

        renderLoginPage();

        expect(screen.getByText('❌ Email ou senha incorretos')).toBeInTheDocument();
    });

    it('deve chamar loginWithGoogle ao clicar no botão do Google', () => {
        renderLoginPage();

        const googleBtn = screen.getByRole('button', { name: 'Entrar com Google' });
        fireEvent.click(googleBtn);

        expect(mockClearError).toHaveBeenCalled();
        expect(mockLoginWithGoogle).toHaveBeenCalled();
    });

    it('deve chamar enterAsGuest ao clicar em Jogar como Convidado', () => {
        renderLoginPage();

        const guestBtn = screen.getByRole('button', { name: /jogar como convidado/i });
        fireEvent.click(guestBtn);

        expect(mockEnterAsGuest).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/game', { replace: true });
    });
});
