import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from '../StreakDisplay/StreakDisplay';
import type { UserStreak } from '../../../types/gamification';

describe('StreakDisplay Component', () => {
    const mockStreak: UserStreak = {
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: new Date().toISOString().split('T')[0],
        activityHistory: [] // Will be populated in tests if needed
    };

    it('renders compact mode correctly', () => {
        render(<StreakDisplay streak={mockStreak} compact={true} />);

        expect(screen.getByText('🔥')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.queryByText('dias seguidos')).not.toBeInTheDocument();
    });

    it('renders full mode correctly', () => {
        render(<StreakDisplay streak={mockStreak} />);

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('dias seguidos')).toBeInTheDocument();
        expect(screen.getByText('Recorde: 10')).toBeInTheDocument();
    });

    it('shows bonus message when streak is >= 7', () => {
        const highStreak = { ...mockStreak, currentStreak: 7 };
        render(<StreakDisplay streak={highStreak} />);

        expect(screen.getByText(/Bônus de streak/)).toBeInTheDocument();
    });

    it('does not show record if current streak equals longest', () => {
        const equalStreak = { ...mockStreak, currentStreak: 10, longestStreak: 10 };
        render(<StreakDisplay streak={equalStreak} />);

        expect(screen.queryByText(/Recorde:/)).not.toBeInTheDocument();
    });

    it('renders calendar with active days', () => {
        // Mock activity history for today and yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const history = [
            today.toISOString().split('T')[0],
            yesterday.toISOString().split('T')[0]
        ];

        const streakWithHistory = { ...mockStreak, activityHistory: history };
        render(<StreakDisplay streak={streakWithHistory} />);

        // Should find multiple fire icons (one in header, some in calendar)
        const fireIcons = screen.getAllByText('🔥');
        expect(fireIcons.length).toBeGreaterThan(1);
    });
});
