import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthContext } from '../../context/AuthContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock do contexto para testar se o hook consome corretamente
describe('useAuth Re-export', () => {
    it('should correctly consume AuthContext', () => {
        const mockAuthContext = {
            currentUser: null,
            userData: null,
            loading: false,
            error: null,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            loginWithGoogle: vi.fn(),
            updateUserData: vi.fn(),
            refreshUserData: vi.fn(),
            isAuthenticated: false,
            isGuest: false,
            loginAsGuest: vi.fn(),
            user: null,
            sendPasswordReset: vi.fn(),
            enterAsGuest: vi.fn(),
            clearError: vi.fn(),
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthContext.Provider value={mockAuthContext}>
                {children}
            </AuthContext.Provider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current).toBe(mockAuthContext);
    });
});
