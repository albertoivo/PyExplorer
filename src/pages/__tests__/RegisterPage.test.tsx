import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterPage } from '../RegisterPage';
import { useAuth } from '../../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock do hook useAuth
vi.mock('../../hooks/useAuth', () => ({
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

describe('RegisterPage', () => {
    const mockRegister = vi.fn();
    const mockLoginWithGoogle = vi.fn();
    const mockEnterAsGuest = vi.fn();
    const mockClearError = vi.fn();

    const renderRegisterPage = () => {
        return render(
            <HelmetProvider>
                <MemoryRouter>
                    <RegisterPage />
                </MemoryRouter>
            </HelmetProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            register: mockRegister,
            loginWithGoogle: mockLoginWithGoogle,
            enterAsGuest: mockEnterAsGuest,
            clearError: mockClearError,
            error: null,
            user: null,
        });
    });

    it('deve validar senha curta (menos de 8 caracteres)', async () => {
        renderRegisterPage();

        const nameInput = screen.getByLabelText(/como podemos te chamar/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/crie uma senha/i, { selector: 'input' });
        const confirmInput = screen.getByLabelText(/confirme a senha/i, { selector: 'input' });
        const submitBtn = screen.getByRole('button', { name: /criar conta/i });

        fireEvent.change(nameInput, { target: { value: 'TestUser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '1234567' } }); // 7 chars
        fireEvent.change(confirmInput, { target: { value: '1234567' } });

        fireEvent.click(submitBtn);

        expect(await screen.findByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
        expect(mockRegister).not.toHaveBeenCalled();
    });

    it('deve aceitar senha de 8 caracteres', async () => {
        renderRegisterPage();

        const nameInput = screen.getByLabelText(/como podemos te chamar/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/crie uma senha/i, { selector: 'input' });
        const confirmInput = screen.getByLabelText(/confirme a senha/i, { selector: 'input' });
        const submitBtn = screen.getByRole('button', { name: /criar conta/i });

        fireEvent.change(nameInput, { target: { value: 'TestUser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '12345678' } }); // 8 chars
        fireEvent.change(confirmInput, { target: { value: '12345678' } });

        fireEvent.click(submitBtn);

        await waitFor(() => {
             expect(mockRegister).toHaveBeenCalledWith('test@example.com', '12345678', 'TestUser');
        });
    });
});
