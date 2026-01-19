import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from '../components/gamification/Leaderboard/Leaderboard';

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
        {
            uid: 'user3',
            displayName: 'Test User',
            avatar: '👩‍🚀',
            totalScore: 1500,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]),
}));

describe('Leaderboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        render(<Leaderboard currentUserId="user3" />);

        // Should show title
        expect(screen.getByText('🏆 Ranking')).toBeDefined();

        // Should show loading state
        expect(screen.getByText(/Carregando ranking/)).toBeDefined();

        // Wait for loading to finish to avoid act() warning
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });
    });

    it('renders correctly with user data after loading', async () => {
        render(<Leaderboard currentUserId="user3" />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });

        // Should show mock users from getTopUsers
        expect(screen.getByText('Ana Code')).toBeDefined();
        expect(screen.getByText('Pedro Python')).toBeDefined();
        expect(screen.getByText('Test User')).toBeDefined();
    });

    it('shows top 3 on podium', async () => {
        render(<Leaderboard currentUserId="user3" />);

        // Wait for data to load
        await waitFor(() => {
            expect(screen.queryByText(/Carregando/)).toBeNull();
        });

        // Should show rank emojis for podium
        expect(screen.getByText('🥇')).toBeDefined();
        expect(screen.getByText('🥈')).toBeDefined();
        expect(screen.getByText('🥉')).toBeDefined();
    });
});
