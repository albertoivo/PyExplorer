import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from '../components/gamification/Leaderboard';
import type { UserData } from '../types/question';

// Mock getTopUsers from firestore
vi.mock('../firebase/firestore', () => ({
    getTopUsers: vi.fn().mockResolvedValue([
        {
            uid: 'user1',
            displayName: 'Ana Code',
            avatar: '👩‍💻',
            totalScore: 2500,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            uid: 'user2',
            displayName: 'Pedro Python',
            avatar: '🧑‍💻',
            totalScore: 1800,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]),
}));

// Mock user data
const mockUser: UserData = {
    uid: 'user123',
    displayName: 'Test User',
    avatar: '👩‍🚀',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    totalScore: 1500,
    balance: 500,
    unlockedWorlds: ['basic_commands'],
    streak: 5,
    lastActiveDate: '2023-01-01',
    inventory: [],
    equippedAvatar: 'default'
};

describe('Leaderboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        render(<Leaderboard currentUser={mockUser} />);

        // Should show title
        expect(screen.getByText('🏆 Ranking Global')).toBeDefined();

        // Should show loading state
        expect(screen.getByText(/Carregando ranking/)).toBeDefined();

        // Wait for loading to finish to avoid act() warning
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });
    });

    it('renders correctly with user data after loading', async () => {
        render(<Leaderboard currentUser={mockUser} />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });

        // Should show the current user
        expect(screen.getByText(/Test User/i)).toBeDefined();
        expect(screen.getByText(/\(Você\)/)).toBeDefined();

        // Should show mock users from getTopUsers
        expect(screen.getByText('Ana Code')).toBeDefined();
        expect(screen.getByText('Pedro Python')).toBeDefined();
    });

    it('ranks user correctly based on score', async () => {
        render(<Leaderboard currentUser={mockUser} />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });

        // Mock users + current user:
        // Ana Code: 2500 -> 1st
        // Pedro Python: 1800 -> 2nd
        // Test User: 1500 -> 3rd

        const userRow = screen.getByText(/Test User/i).closest('.leaderboard-item');
        expect(userRow?.textContent).toContain('🥉'); // 3rd place
    });

    it('ranks user first if score is highest', async () => {
        const highScoreUser = { ...mockUser, totalScore: 5000 };
        render(<Leaderboard currentUser={highScoreUser} />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });

        const userRow = screen.getByText(/Test User/i).closest('.leaderboard-item');
        expect(userRow?.textContent).toContain('🥇');
    });
});
