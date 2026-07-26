import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserDashboard } from '../UserDashboard';
import type { UserData } from '../../../types/question';

// Mock hooks
vi.mock('../../../hooks/useGamification', () => ({
    useGamification: () => mockGamificationReturn,
}));

vi.mock('../../../hooks/useProgress', () => ({
    useProgress: () => ({
        stats: { completed: 15 },
    }),
}));

let mockGamificationReturn = {
    currentLevel: { level: 1, name: 'Novato', icon: '🌱', minXP: 0, maxXP: 500, color: '#48bb78' },
    levelProgress: 50,
    streak: { currentStreak: 3, longestStreak: 5 },
};

const mockUserData: UserData = {
    uid: 'user123',
    displayName: 'Test User',
    avatar: 'avatar_snake_green',
    balance: 150,
    totalScore: 500,
    solvedCount: 15,
};

describe('UserDashboard', () => {
    it('renders user info and normal level progress text', () => {
        mockGamificationReturn = {
            currentLevel: { level: 1, name: 'Novato', icon: '🌱', minXP: 0, maxXP: 500, color: '#48bb78' },
            levelProgress: 50,
            streak: { currentStreak: 3, longestStreak: 5 },
        };

        render(
            <MemoryRouter>
                <UserDashboard userData={mockUserData} />
            </MemoryRouter>
        );

        expect(screen.getByText('👋 Olá, Test User!')).toBeInTheDocument();
        expect(screen.getByText('Novato')).toBeInTheDocument();
        expect(screen.getByText('50% para o próximo nível')).toBeInTheDocument();
    });

    it('renders "Nível máximo!" when at max level (maxXP is Infinity)', () => {
        mockGamificationReturn = {
            currentLevel: { level: 20, name: 'Pythonista Supremo', icon: '🐍', minXP: 7900, maxXP: Infinity, color: '#ffd700' },
            levelProgress: 100,
            streak: { currentStreak: 10, longestStreak: 15 },
        };

        render(
            <MemoryRouter>
                <UserDashboard userData={mockUserData} />
            </MemoryRouter>
        );

        expect(screen.getByText('Pythonista Supremo')).toBeInTheDocument();
        expect(screen.getByText('Nível máximo!')).toBeInTheDocument();
        expect(screen.queryByText('100% para o próximo nível')).not.toBeInTheDocument();
    });
});
