import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineIndicator } from '../OfflineIndicator';
import * as useOfflineHook from '../../../hooks/useOffline';
import * as usePWAHook from '../../../hooks/usePWA';

vi.mock('../../../hooks/useOffline');
vi.mock('../../../hooks/usePWA');

describe('OfflineIndicator', () => {
    const mockSyncPendingProgress = vi.fn();
    const mockInstallPWA = vi.fn();
    const mockApplyUpdate = vi.fn();

    const defaultOfflineState = {
        isOnline: true,
        pendingSync: 0,
        isSyncing: false,
        syncPendingProgress: mockSyncPendingProgress,
        lastSync: null,
        cachedQuestions: [],
        cacheQuestions: vi.fn(),
        getQuestions: vi.fn(),
        saveOfflineProgress: vi.fn(),
    };

    const defaultPWAState = {
        isPWA: true,
        canInstall: false,
        installPWA: mockInstallPWA,
        updateAvailable: false,
        applyUpdate: mockApplyUpdate,
        isUpdating: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useOfflineHook.useOffline as any).mockReturnValue({ ...defaultOfflineState });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (usePWAHook.usePWA as any).mockReturnValue({ ...defaultPWAState });
    });

    it('renders nothing when online, nothing pending, no update available, and is already PWA', () => {
        const { container } = render(<OfflineIndicator />);
        expect(container.firstChild).toBeNull();
    });

    it('renders offline indicator when user is offline', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useOfflineHook.useOffline as any).mockReturnValue({
            ...defaultOfflineState,
            isOnline: false,
            pendingSync: 2,
        });

        render(<OfflineIndicator />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Sem conexão/i)).toBeInTheDocument();
        expect(screen.getByText(/2 pendentes/i)).toBeInTheDocument();
    });

    it('renders syncing indicator and handles sync click', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useOfflineHook.useOffline as any).mockReturnValue({
            ...defaultOfflineState,
            isOnline: true,
            pendingSync: 3,
            isSyncing: false,
        });

        render(<OfflineIndicator />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        const syncBtn = screen.getByRole('button', { name: /Sincronizar/i });
        fireEvent.click(syncBtn);
        expect(mockSyncPendingProgress).toHaveBeenCalledTimes(1);
    });

    it('renders install prompt when canInstall is true and not yet PWA', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (usePWAHook.usePWA as any).mockReturnValue({
            ...defaultPWAState,
            isPWA: false,
            canInstall: true,
        });

        render(<OfflineIndicator />);
        const installBtn = screen.getByRole('button', { name: /Instalar/i });
        expect(installBtn).toBeInTheDocument();
        fireEvent.click(installBtn);
        expect(mockInstallPWA).toHaveBeenCalledTimes(1);
    });

    it('renders update prompt and triggers applyUpdate when button is clicked', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (usePWAHook.usePWA as any).mockReturnValue({
            ...defaultPWAState,
            updateAvailable: true,
            isUpdating: false,
        });

        render(<OfflineIndicator />);
        expect(screen.getByText(/Nova versão disponível!/i)).toBeInTheDocument();
        const updateBtn = screen.getByRole('button', { name: /Atualizar/i });
        expect(updateBtn).not.toBeDisabled();
        fireEvent.click(updateBtn);
        expect(mockApplyUpdate).toHaveBeenCalledTimes(1);
    });

    it('disables update button and shows updating label when isUpdating is true', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (usePWAHook.usePWA as any).mockReturnValue({
            ...defaultPWAState,
            updateAvailable: true,
            isUpdating: true,
        });

        render(<OfflineIndicator />);
        const updateBtn = screen.getByRole('button', { name: /Atualizando.../i });
        expect(updateBtn).toBeInTheDocument();
        expect(updateBtn).toBeDisabled();
    });
});
