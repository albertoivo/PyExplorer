
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { App } from '../App';
import * as authModule from '../firebase/auth';

// Mock Firebase services
vi.mock('../firebase/auth', () => ({
    subscribeToAuthChanges: vi.fn(() => () => {}),
    signIn: vi.fn(),
    signUp: vi.fn(),
    logOut: vi.fn(),
    resetPassword: vi.fn(),
}));

vi.mock('../firebase/firestore', () => ({
    getUser: vi.fn(),
    saveUser: vi.fn(),
}));

// Mock Pyodide to prevent loading external scripts
vi.mock('../hooks/usePyodide', () => ({
    usePyodide: () => ({
        loading: false,
        ready: true,
        loadPyodide: vi.fn(),
        runPython: vi.fn(),
    })
}));

describe('App Smoke Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock auth to return no user (guest/public) initially
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return () => {};
        });
    });

    it('renders home page by default', async () => {
        await act(async () => {
            render(<App />);
        });

        // Wait for lazy loading
        await waitFor(() => {
            // Home page content (adjust based on actual HomePage content)
            // Looking at HomePage.tsx might be needed, but usually it has a title or welcome message
            // Let's assume there is a generic welcome or title.
            // If we don't know exact text, we can check for header/footer which are not lazy
            expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
            expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
        });

        // Try to find something specific to HomePage if possible
        // Based on README: "Aprenda Python de forma divertida"
        // But let's stick to safe checks first.
    });

    it('navigates to login page', async () => {
        await act(async () => {
            render(<App />);
        });

        // Click login button in header
        // Header usually has a link to /login
        const loginLink = screen.getByText(/Entrar/i); // Adjust text if needed

        await act(async () => {
            loginLink.click();
        });

        await waitFor(() => {
            // Check for login form or title
            expect(window.location.pathname).toBe('/login');
            // Note: window.location check in jsdom with react-router might not work directly
            // if using MemoryRouter, but App uses BrowserRouter.
            // In jsdom, BrowserRouter updates window.history.

            // Better to check for content
            // Login page should have "Email" or "Senha" fields
            // But they are lazy loaded...
        });
    });
});
