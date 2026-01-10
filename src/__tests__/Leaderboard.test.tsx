import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Leaderboard } from '../components/gamification/Leaderboard';
import type { UserData } from '../types/question';

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
    it('renders correctly with user data', () => {
        render(<Leaderboard currentUser={mockUser} />);

        // Should show title
        expect(screen.getByText('🏆 Ranking Global')).toBeDefined();

        // Should show the user
        expect(screen.getByText(/Test User/i)).toBeDefined();
        expect(screen.getByText(/\(Você\)/)).toBeDefined();

        // Should show mock users (Ana Code has 2500, so she should be there)
        expect(screen.getByText('Ana Code')).toBeDefined();
    });

    it('ranks user correctly based on score', () => {
        render(<Leaderboard currentUser={mockUser} />);

        // Mock users:
        // Ana Code: 2500
        // Pedro Python: 1800
        // Test User: 1500
        // Lucas Loop: 1200

        // Test User should be 3rd
        const userRow = screen.getByText(/Test User/i).closest('.leaderboard-item');
        expect(userRow?.textContent).toContain('🥉'); // 3rd place
    });

    it('ranks user first if score is highest', () => {
        const highScoreUser = { ...mockUser, totalScore: 5000 };
        render(<Leaderboard currentUser={highScoreUser} />);

        const userRow = screen.getByText(/Test User/i).closest('.leaderboard-item');
        expect(userRow?.textContent).toContain('🥇');
    });
});
