import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorldMap } from '../WorldMap';
import type { World } from '../../../types/question';

// Mock AuthContext hook
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        userData: {
            totalScore: 5000,
            unlockedWorlds: ['basic_commands', 'variables', 'numbers', 'user_input'],
        },
        isGuest: false,
    }),
}));

// Mock GamificationContext hook
vi.mock('../../../context/GamificationContext', () => ({
    useGamification: () => ({
        gamification: {
            level: { totalXP: 5000 },
        },
    }),
}));

// Mock getTutorialByWorld para evitar overlay de tutorial durante o teste da historinha
vi.mock('../../../data/educationContent', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../data/educationContent')>();
    return {
        ...actual,
        getTutorialByWorld: () => null,
    };
});

describe('WorldMap Component', () => {
    const mockOnSelectWorld = vi.fn();
    const mockWorldProgress = new Map<World, { completed: number; total: number }>([
        ['basic_commands', { completed: 3, total: 4 }],
        ['variables', { completed: 2, total: 4 }],
    ]);

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders the header and all saga tabs', () => {
        render(
            <WorldMap
                onSelectWorld={mockOnSelectWorld}
                worldProgress={mockWorldProgress}
            />
        );

        expect(screen.getByText('🗺️ A Jornada do Desenvolvedor')).toBeInTheDocument();
        expect(screen.getByText('✨ Todas as Sagas')).toBeInTheDocument();
        expect(screen.getByTestId('saga-tab-saga_1')).toBeInTheDocument();
        expect(screen.getByTestId('saga-tab-saga_2')).toBeInTheDocument();
        expect(screen.getByTestId('saga-tab-saga_3')).toBeInTheDocument();
        expect(screen.getByTestId('saga-tab-saga_4')).toBeInTheDocument();
    });

    it('filters worlds by selected saga tab', () => {
        render(
            <WorldMap
                onSelectWorld={mockOnSelectWorld}
                worldProgress={mockWorldProgress}
            />
        );

        // Clica na Saga 3 (Arquiteto)
        const saga3Tab = screen.getByTestId('saga-tab-saga_3');
        fireEvent.click(saga3Tab);

        expect(screen.getByTestId('saga-banner-saga_3')).toBeInTheDocument();
        expect(screen.queryByTestId('saga-banner-saga_1')).not.toBeInTheDocument();
    });

    it('opens story modal on first click of basic_commands, and calls onSelectWorld upon skipping story', () => {
        render(
            <WorldMap
                onSelectWorld={mockOnSelectWorld}
                worldProgress={mockWorldProgress}
            />
        );

        // Clica no mundo Primeiros Passos (possuí historinha de introdução)
        const worldButton = screen.getByRole('button', { name: /Primeiros Passos/i });
        fireEvent.click(worldButton);

        // Verifica que o modal da historinha abriu
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('O Início da Jornada')).toBeInTheDocument();

        // Clica no botão de pular historinha para avançar
        const skipBtn = screen.getByRole('button', { name: /Pular/i });
        fireEvent.click(skipBtn);

        // Verifica se o mundo foi selecionado com sucesso
        expect(mockOnSelectWorld).toHaveBeenCalledWith('basic_commands');
    });
});
