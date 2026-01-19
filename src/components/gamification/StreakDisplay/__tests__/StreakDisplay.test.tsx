import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from '../StreakDisplay';
import type { UserStreak } from '../../../../types/gamification';

const mockStreak: UserStreak = {
    currentStreak: 5,
    longestStreak: 10,
    lastActivityDate: '2025-01-05',
    activityHistory: ['2025-01-04', '2025-01-05']
};

describe('StreakDisplay', () => {
    beforeEach(() => {
        // Set fixed date: 2025-01-05 (Sunday)
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-05T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders compact mode correctly', () => {
        render(<StreakDisplay streak={mockStreak} compact={true} />);

        expect(screen.getByText('5')).toBeDefined();
        expect(screen.getByText('🔥')).toBeDefined();
        // Should NOT have "dias seguidos"
        expect(screen.queryByText('dias seguidos')).toBeNull();
    });

    it('renders full mode with current streak and record', () => {
        render(<StreakDisplay streak={mockStreak} />);

        expect(screen.getByText('5')).toBeDefined();
        expect(screen.getByText('dias seguidos')).toBeDefined();
        expect(screen.getByText('Recorde: 10')).toBeDefined();
    });

    it('hides record if current streak equals longest streak', () => {
        const bestStreak = { ...mockStreak, currentStreak: 10, longestStreak: 10 };
        render(<StreakDisplay streak={bestStreak} />);

        expect(screen.queryByText(/Recorde/)).toBeNull();
    });

    it('renders the calendar with correct active days', () => {
        // Mock Today is 2025-01-05
        // History has 2025-01-04 and 2025-01-05

        const { container } = render(<StreakDisplay streak={mockStreak} />);

        // Find days
        const days = container.querySelectorAll('.streak-display__day');
        expect(days.length).toBe(7);

        // Check 6th day (2025-01-04) - Index 5 (0-6)
        // 0: Jan-29 (-6)
        // ...
        // 5: Jan-04 (-1) -> Should be active
        // 6: Jan-05 (Today) -> Should be active

        const dayYesterday = days[5];
        expect(dayYesterday.textContent).toContain('🔥');

        const dayToday = days[6];
        expect(dayToday.textContent).toContain('🔥');
        expect(dayToday.className).toContain('streak-display__day--today');

        // Check day before yesterday (2025-01-03) - Index 4 -> Inactive
        const dayBefore = days[4];
        expect(dayBefore.textContent).toContain('⚪');
    });

    it('renders bonus message when streak >= 7', () => {
        const highStreak = { ...mockStreak, currentStreak: 8 };
        render(<StreakDisplay streak={highStreak} />);

        expect(screen.getByText(/Bônus de streak/)).toBeDefined();
        expect(screen.getByText(/\+8% XP/)).toBeDefined();
    });

    it('caps bonus message at 30%', () => {
        const highStreak = { ...mockStreak, currentStreak: 50 };
        render(<StreakDisplay streak={highStreak} />);

        expect(screen.getByText(/\+30% XP/)).toBeDefined();
    });
});
