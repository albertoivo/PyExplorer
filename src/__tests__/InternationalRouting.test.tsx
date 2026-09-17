import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { App } from '../App';
import * as authModule from '../firebase/auth';
import i18n from '../i18n';

// Mock Firebase services
vi.mock('../firebase/auth', () => ({
    subscribeToAuthChanges: vi.fn(() => () => {}),
    signIn: vi.fn(),
    signUp: vi.fn(),
    logOut: vi.fn(),
    resetPassword: vi.fn(),
    checkRedirectResult: vi.fn().mockResolvedValue(null),
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

describe('International Routing and i18n SEO Support', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        await i18n.changeLanguage('pt');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return () => {};
        });
    });

    it('synchronizes language to English when navigating to /en', async () => {
        window.history.pushState({}, '', '/en');

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(i18n.language.startsWith('en')).toBe(true);
        });
    });

    it('synchronizes language to Spanish when navigating to /es/about', async () => {
        window.history.pushState({}, '', '/es/about');

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(i18n.language.startsWith('es')).toBe(true);
        });
    });

    it('synchronizes language to Hindi when navigating to /hi/learn', async () => {
        window.history.pushState({}, '', '/hi/learn');

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(i18n.language.startsWith('hi')).toBe(true);
        });
    });

    it('renders 404 NotFoundPage for invalid language prefixes', async () => {
        window.history.pushState({}, '', '/fr/about');

        await act(async () => {
            render(<App />);
        });

        await waitFor(() => {
            expect(document.querySelector('.not-found-page')).toBeInTheDocument();
        });
    });
});
