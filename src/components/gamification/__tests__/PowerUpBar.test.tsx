import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PowerUpBar, PowerUpBarCompact } from '../PowerUpBar/PowerUpBar';
import type { UserPowerUps } from '../../../types/gamification';

// Mock data to control test environment
vi.mock('../../../data/gamificationData', () => ({
    POWERUPS: [
        { id: 'skip', name: 'Skip', icon: '⏭️', price: 10, maxPerDay: 2, description: 'Skip question' },
        { id: 'hint', name: 'Hint', icon: '💡', price: 5, maxPerDay: 3, description: 'Get a hint' },
    ]
}));

describe('PowerUpBar Component', () => {
    const mockUserPowerUps: UserPowerUps = {
        inventory: {
            skip: 2,
            hint: 0
        },
        usesToday: {
            skip: 1,
            hint: 0
        },
        lastResetDate: new Date().toISOString().split('T')[0]
    };

    const mockHandlers = {
        onUsePowerUp: vi.fn(),
        onBuyPowerUp: vi.fn(),
    };

    it('renders inventory correctly', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                {...mockHandlers}
            />
        );

        // Check if items are rendered
        expect(screen.getByText('Skip')).toBeInTheDocument();
        expect(screen.getByText('Hint')).toBeInTheDocument();

        // Check quantities
        expect(screen.getByText('2x')).toBeInTheDocument();
        expect(screen.getByText('Esgotado')).toBeInTheDocument();
    });

    it('allows using available power-ups', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                {...mockHandlers}
            />
        );

        const useBtn = screen.getByLabelText('Usar Skip');
        fireEvent.click(useBtn);
        expect(mockHandlers.onUsePowerUp).toHaveBeenCalledWith('skip');
    });

    it('allows buying active power-ups when out of stock', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                {...mockHandlers}
            />
        );

        const buyBtn = screen.getByLabelText('Comprar Hint por 5 estrelas');
        fireEvent.click(buyBtn);
        expect(mockHandlers.onBuyPowerUp).toHaveBeenCalledWith('hint', 5);
    });

    it('disables buy button if insufficient stars', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={2} // Less than 5 for hint
                {...mockHandlers}
            />
        );

        const buyBtn = screen.getByLabelText('Comprar Hint por 5 estrelas');
        expect(buyBtn).toBeDisabled();
    });

    it('disables use button if daily limit reached', () => {
        const exhaustedPowerUps = {
            ...mockUserPowerUps,
            usesToday: { skip: 2, hint: 0 } // Max per day for skip is 2
        };

        render(
            <PowerUpBar
                userPowerUps={exhaustedPowerUps}
                userStars={100}
                {...mockHandlers}
            />
        );

        const useBtn = screen.getByRole('button', { name: /Usar Skip/i }); // Using regex because title/aria might vary slightly
        expect(useBtn).toBeDisabled();
    });

    it('shows active state', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                {...mockHandlers}
                activePowerUp="skip"
            />
        );

        expect(screen.getByText('Ativo!')).toBeInTheDocument();
    });
});

describe('PowerUpBarCompact Component', () => {
     const mockUserPowerUps: UserPowerUps = {
        inventory: {
            skip: 2,
            hint: 0
        },
        usesToday: {
            skip: 0,
            hint: 0
        },
        lastResetDate: new Date().toISOString().split('T')[0]
    };
    const mockHandlers = {
        onUsePowerUp: vi.fn(),
    };

    it('renders only available power-ups', () => {
        render(
            <PowerUpBarCompact
                userPowerUps={mockUserPowerUps}
                {...mockHandlers}
            />
        );

        // Skip has inventory 2 -> should show
        expect(screen.getByText('2')).toBeInTheDocument();

        // Hint has inventory 0 -> should NOT show
        expect(screen.queryByText('Hint')).not.toBeInTheDocument();
        // Check by icon if name is hidden
        expect(screen.queryByLabelText(/Usar Hint/)).not.toBeInTheDocument();
    });

    it('handles click correctly', () => {
        render(
            <PowerUpBarCompact
                userPowerUps={mockUserPowerUps}
                {...mockHandlers}
            />
        );

        const btn = screen.getByLabelText(/Usar Skip/);
        fireEvent.click(btn);
        expect(mockHandlers.onUsePowerUp).toHaveBeenCalledWith('skip');
    });
});
