import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { resetLoginRedirectFlag } from '../utils/authRedirect';
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
    const mockSendPasswordReset = vi.fn();

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
        // Reset the global redirect flag to ensure tests are isolated
        resetLoginRedirectFlag();
        // Setup padrão do mock useAuth
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            login: mockLogin,
            loginWithGoogle: mockLoginWithGoogle,
            enterAsGuest: mockEnterAsGuest,
            clearError: mockClearError,
            sendPasswordReset: mockSendPasswordReset,
            error: null,
            user: null,
        });
    });

    it('deve renderizar o formulário de login corretamente', () => {
        renderLoginPage();

        expect(screen.getByText('Entrar no PyExplorer')).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i, { selector: 'input' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🚀 Entrar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeInTheDocument();
    });

    it('deve permitir digitar email e senha', () => {
        renderLoginPage();

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/senha/i, { selector: 'input' });

        fireEvent.change(emailInput, { target: { value: 'teste@exemplo.com' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });

        expect(emailInput).toHaveValue('teste@exemplo.com');
        expect(passwordInput).toHaveValue('123456');
    });

    it('deve chamar a função login ao submeter o formulário', async () => {
        renderLoginPage();

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'teste@exemplo.com' } });
        fireEvent.change(screen.getByLabelText(/senha/i, { selector: 'input' }), { target: { value: '123456' } });

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
            sendPasswordReset: mockSendPasswordReset,
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

    it('deve enviar email de redefinição de senha ao clicar em Esqueci minha senha', async () => {
        renderLoginPage();

        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'teste@exemplo.com' } });

        const forgotBtn = screen.getByText('Esqueci minha senha');
        fireEvent.click(forgotBtn);

        await waitFor(() => {
            expect(mockSendPasswordReset).toHaveBeenCalledWith('teste@exemplo.com');
            expect(screen.getByText(/email de redefinição enviado/i)).toBeInTheDocument();
        });
    });

    it('deve exibir erro se tentar redefinir senha sem email', async () => {
        renderLoginPage();

        const forgotBtn = screen.getByText('Esqueci minha senha');
        fireEvent.click(forgotBtn);

        await waitFor(() => {
            expect(mockSendPasswordReset).not.toHaveBeenCalled();
            expect(screen.getByText(/Digite seu email no campo acima para redefinir a senha/)).toBeInTheDocument();
        });
    });

    describe('Redirect Behavior', () => {
        it('deve redirecionar para /game quando usuário faz login', async () => {
            // Start with no user
            const { rerender } = render(
                <HelmetProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </HelmetProvider>
            );

            // User state was null, now changes to logged in
            (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                login: mockLogin,
                loginWithGoogle: mockLoginWithGoogle,
                enterAsGuest: mockEnterAsGuest,
                clearError: mockClearError,
                sendPasswordReset: mockSendPasswordReset,
                error: null,
                user: { uid: 'test-user-123', displayName: 'Test User' },
            });

            rerender(
                <HelmetProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </HelmetProvider>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/game', { replace: true });
            });
        });

        it('deve redirecionar para página anterior quando definida em location.state', async () => {
            // Start with no user
            const { rerender } = render(
                <HelmetProvider>
                    <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/profile' } } }]}>
                        <LoginPage />
                    </MemoryRouter>
                </HelmetProvider>
            );

            // User logs in
            (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                login: mockLogin,
                loginWithGoogle: mockLoginWithGoogle,
                enterAsGuest: mockEnterAsGuest,
                clearError: mockClearError,
                sendPasswordReset: mockSendPasswordReset,
                error: null,
                user: { uid: 'test-user-123', displayName: 'Test User' },
            });

            rerender(
                <HelmetProvider>
                    <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/profile' } } }]}>
                        <LoginPage />
                    </MemoryRouter>
                </HelmetProvider>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
            });
        });

        it('não deve redirecionar se já redirecionou (evita loop)', async () => {
            // User already logged in (simulate arriving at /login with user already present)
            (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
                login: mockLogin,
                loginWithGoogle: mockLoginWithGoogle,
                enterAsGuest: mockEnterAsGuest,
                clearError: mockClearError,
                sendPasswordReset: mockSendPasswordReset,
                error: null,
                user: { uid: 'test-user-123', displayName: 'Test User' },
            });

            render(
                <HelmetProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </HelmetProvider>
            );

            // First call will happen
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalled();
            });

            const callCount = mockNavigate.mock.calls.length;

            // Remount the component (simulating navigation back to /login)
            // But user is still logged in - should NOT redirect again due to flag
            render(
                <HelmetProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </HelmetProvider>
            );

            // Wait a tick
            await new Promise(r => setTimeout(r, 100));

            // Call count should NOT have increased (flag prevents re-redirect)
            expect(mockNavigate.mock.calls.length).toBe(callCount);
        });
    });
});
