import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PowerUpBar, PowerUpBarCompact } from '../PowerUpBar';
import type { UserPowerUps } from '../../../../types/gamification';

// Mock POWERUPS
vi.mock('../../../../data/gamificationData', () => ({
    POWERUPS: [
        {
            id: 'skip',
            name: 'Pular',
            description: 'Pular questão',
            icon: '⏭️',
            price: 50,
            maxPerDay: 2,
        },
        {
            id: 'hint',
            name: 'Dica',
            description: 'Dica extra',
            icon: '💡',
            price: 20,
            maxPerDay: 5,
        }
    ]
}));

const mockUserPowerUps: UserPowerUps = {
    inventory: {
        skip: 1, // Has 1
        hint: 0, // Has 0
        fifty_fifty: 0,
        double_stars: 0,
        shield: 0
    },
    usesToday: {
        skip: 0,
        hint: 0,
        fifty_fifty: 0,
        double_stars: 0,
        shield: 0
    },
    lastResetDate: new Date().toISOString().split('T')[0]
};

describe('PowerUpBar', () => {
    const mockOnUse = vi.fn();
    const mockOnBuy = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all powerups correctly', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockOnUse}
                onBuyPowerUp={mockOnBuy}
            />
        );

        expect(screen.getByText('Pular')).toBeDefined();
        expect(screen.getByText('Dica')).toBeDefined();
        expect(screen.getByText('1x')).toBeDefined(); // Skip quantity
        expect(screen.getByText('Esgotado')).toBeDefined(); // Hint quantity
    });

    it('shows USE button for owned items and BUY button for unowned items', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockOnUse}
                onBuyPowerUp={mockOnBuy}
            />
        );

        // Skip (owned) -> Use button
        const useBtn = screen.getByLabelText('Usar Pular');
        expect(useBtn).toBeDefined();
        expect(useBtn.textContent).toBe('Usar');

        // Hint (unowned) -> Buy button
        const buyBtn = screen.getByLabelText('Comprar Dica por 20 estrelas');
        expect(buyBtn).toBeDefined();
        expect(buyBtn.textContent).toContain('20');
    });

    it('calls onUsePowerUp when USE button clicked', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockOnUse}
                onBuyPowerUp={mockOnBuy}
            />
        );

        fireEvent.click(screen.getByLabelText('Usar Pular'));
        expect(mockOnUse).toHaveBeenCalledWith('skip');
    });

    it('calls onBuyPowerUp when BUY button clicked', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockOnUse}
                onBuyPowerUp={mockOnBuy}
            />
        );

        fireEvent.click(screen.getByLabelText('Comprar Dica por 20 estrelas'));
        expect(mockOnBuy).toHaveBeenCalledWith('hint', 20);
    });

    it('disables BUY button if insufficient stars', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={10} // Less than 20
                onUsePowerUp={mockOnUse}
                onBuyPowerUp={mockOnBuy}
            />
        );

        const buyBtn = screen.getByLabelText('Comprar Dica por 20 estrelas') as HTMLButtonElement;
        expect(buyBtn.disabled).toBe(true);
    });

    it('disables USE button if daily limit reached', () => {
        const maxUsedPowerUps: UserPowerUps = {
            ...mockUserPowerUps,
            usesToday: {
                ...mockUserPowerUps.usesToday,
                skip: 2 // Max is 2
            }
        };

        render(
            <PowerUpBar
                userPowerUps={maxUsedPowerUps}
                userStars={100}
                onUsePowerUp={mockOnUse}
                onBuyPowerUp={mockOnBuy}
            />
        );

        const useBtn = screen.getByLabelText('Usar Pular') as HTMLButtonElement;
        expect(useBtn.disabled).toBe(true);
        expect(useBtn.title).toBe('Limite diário atingido');
    });

    it('renders COMPACT version showing ONLY owned items', () => {
        render(
            <PowerUpBarCompact
                userPowerUps={mockUserPowerUps}
                onUsePowerUp={mockOnUse}
            />
        );

        // Should show 'skip' (owned)
        expect(screen.getByLabelText(/Usar Pular/)).toBeDefined();

        // Should NOT show 'hint' (unowned)
        expect(screen.queryByLabelText(/Usar Dica/)).toBeNull();
    });
});
