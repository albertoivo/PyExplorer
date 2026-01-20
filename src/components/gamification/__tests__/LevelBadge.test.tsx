import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelBadge } from '../LevelBadge/LevelBadge';
import type { LevelInfo } from '../../../types/gamification';

describe('LevelBadge Component', () => {
    const mockLevel: LevelInfo = {
        level: 5,
        name: 'Explorador',
        minXP: 1000,
        maxXP: 2000,
        icon: '🗺️',
        color: '#ff0000'
    };

    it('renders basic info correctly', () => {
        render(<LevelBadge level={mockLevel} currentXP={1500} />);

        expect(screen.getByText('Nível 5')).toBeInTheDocument();
        expect(screen.getByText('Explorador')).toBeInTheDocument();
        expect(screen.getByText('🗺️')).toBeInTheDocument();

        // CSS Variable
        const badge = document.querySelector('.level-badge');
        expect(badge).toHaveStyle({ '--level-color': '#ff0000' });
    });

    it('renders progress bar when enabled', () => {
        render(<LevelBadge level={mockLevel} currentXP={1500} showProgress={true} />);

        // 1500 is exactly middle between 1000 and 2000 -> 500/1000 = 50%
        expect(screen.getByText('500/1000 XP')).toBeInTheDocument();

        const fill = document.querySelector('.level-badge__progress-fill');
        expect(fill).toHaveStyle({ width: '50%' });
    });

    it('handles max level (Infinity XP)', () => {
        const maxLevel = { ...mockLevel, maxXP: Infinity };
        render(<LevelBadge level={maxLevel} currentXP={5000} showProgress={true} />);

        expect(screen.getByText('MAX')).toBeInTheDocument();
        const fill = document.querySelector('.level-badge__progress-fill');
        expect(fill).toHaveStyle({ width: '100%' });
    });

    it('handles interaction', () => {
        const handleClick = vi.fn();
        render(<LevelBadge level={mockLevel} currentXP={1500} onClick={handleClick} />);

        const badge = document.querySelector('.level-badge');
        expect(badge).toHaveAttribute('role', 'button');

        fireEvent.click(badge!);
        expect(handleClick).toHaveBeenCalled();
    });

    it('renders different sizes', () => {
        render(<LevelBadge level={mockLevel} currentXP={1500} size="large" />);
        const badge = document.querySelector('.level-badge');
        expect(badge).toHaveClass('level-badge--large');
    });
});
