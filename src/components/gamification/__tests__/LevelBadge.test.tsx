import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelBadge } from '../LevelBadge/LevelBadge';
import type { LevelInfo } from '../../../types/gamification';

describe('LevelBadge', () => {
    const mockLevel: LevelInfo = {
        level: 5,
        name: 'Pythonista Junior',
        minXP: 1000,
        maxXP: 2000,
        icon: '🐍',
        color: '#ff0000'
    };

    it('renders level info correctly', () => {
        render(<LevelBadge level={mockLevel} currentXP={1500} />);

        expect(screen.getByText('Nível 5')).toBeInTheDocument();
        expect(screen.getByText('Pythonista Junior')).toBeInTheDocument();
        expect(screen.getByText('🐍')).toBeInTheDocument();
    });

    it('shows progress bar when requested', () => {
        render(<LevelBadge level={mockLevel} currentXP={1500} showProgress={true} />);

        // 1500 XP out of 1000-2000 range means 500/1000 = 50%
        expect(screen.getByText('500/1000 XP')).toBeInTheDocument();
    });

    it('handles max level (infinite XP)', () => {
        const maxLevel = { ...mockLevel, maxXP: Infinity };
        render(<LevelBadge level={maxLevel} currentXP={5000} showProgress={true} />);

        expect(screen.getByText('MAX')).toBeInTheDocument();
    });

    it('calls onClick handler', () => {
        const handleClick = vi.fn();
        render(<LevelBadge level={mockLevel} currentXP={1500} onClick={handleClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalled();
    });

    it('applies size class', () => {
        const { container } = render(<LevelBadge level={mockLevel} currentXP={1500} size="small" />);
        expect(container.firstChild).toHaveClass('level-badge--small');
    });
});
