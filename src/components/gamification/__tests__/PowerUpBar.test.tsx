import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PowerUpBar, PowerUpBarCompact } from '../PowerUpBar/PowerUpBar';
import type { UserPowerUps } from '../../../types/gamification';
import { getLocalDateStr } from '../../../utils/gamificationUtils';

describe('PowerUpBar', () => {
    const mockUserPowerUps: UserPowerUps = {
        inventory: {
            skip: 1,
            fifty_fifty: 0,
            extra_hint: 2,
            double_stars: 0,
            shield: 0
        },
        usesToday: {
            skip: 0,
            fifty_fifty: 0,
            extra_hint: 1,
            double_stars: 0,
            shield: 0
        },
        lastResetDate: getLocalDateStr()
    };

    const mockHandlers = {
        onUsePowerUp: vi.fn(),
        onBuyPowerUp: vi.fn(),
    };

    it('renders all power-ups', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockHandlers.onUsePowerUp}
                onBuyPowerUp={mockHandlers.onBuyPowerUp}
            />
        );

        // Check for specific powerup names (assuming default names in POWERUPS data)
        expect(screen.getByText('Pular Questão (Sem Penalidade)')).toBeInTheDocument();
        expect(screen.getByText('50/50')).toBeInTheDocument();
    });

    it('displays quantity and buttons correctly', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockHandlers.onUsePowerUp}
                onBuyPowerUp={mockHandlers.onBuyPowerUp}
            />
        );

        // Skip has 1, should show "1x" and "Usar"
        const skipButton = screen.getByRole('button', { name: /Usar Pular Questão/i });
        expect(skipButton).toBeEnabled();
        expect(screen.getAllByText('1x')).toHaveLength(1);

        // Fifty-fifty has 0, should show price button
        // Assuming price is 50 for 50/50 (check actual data or generic check)
        // Since we don't know exact price from here without importing data, we look for buy button behavior
        const buyButtons = screen.getAllByRole('button', { name: /Comprar/i });
        expect(buyButtons.length).toBeGreaterThan(0);
    });

    it('calls onUsePowerUp when clicking use', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockHandlers.onUsePowerUp}
                onBuyPowerUp={mockHandlers.onBuyPowerUp}
            />
        );

        const useBtn = screen.getByRole('button', { name: /Usar Pular Questão/i });
        fireEvent.click(useBtn);
        expect(mockHandlers.onUsePowerUp).toHaveBeenCalledWith('skip');
    });

    it('calls onBuyPowerUp when clicking buy', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={100}
                onUsePowerUp={mockHandlers.onUsePowerUp}
                onBuyPowerUp={mockHandlers.onBuyPowerUp}
            />
        );

        // Find a buy button (e.g., for 50/50)
        const buyBtn = screen.getByRole('button', { name: /Comprar 50\/50/i });
        fireEvent.click(buyBtn);
        expect(mockHandlers.onBuyPowerUp).toHaveBeenCalled();
    });

    it('disables use button if max uses reached', () => {
        const exhaustedPowerUps = {
            ...mockUserPowerUps,
            usesToday: { ...mockUserPowerUps.usesToday, skip: 999 } // Assuming max is < 999
        };

        render(
            <PowerUpBar
                userPowerUps={exhaustedPowerUps}
                userStars={100}
                onUsePowerUp={mockHandlers.onUsePowerUp}
                onBuyPowerUp={mockHandlers.onBuyPowerUp}
            />
        );

        const useBtn = screen.getByRole('button', { name: /Usar Pular Questão/i });
        expect(useBtn).toBeDisabled();
    });

    it('disables buy button if not enough stars', () => {
        render(
            <PowerUpBar
                userPowerUps={mockUserPowerUps}
                userStars={0} // Poor user
                onUsePowerUp={mockHandlers.onUsePowerUp}
                onBuyPowerUp={mockHandlers.onBuyPowerUp}
            />
        );

        const buyButtons = screen.getAllByRole('button', { name: /Comprar/i });
        buyButtons.forEach(btn => {
            expect(btn).toBeDisabled();
        });
    });
});

describe('PowerUpBarCompact', () => {
    const mockUserPowerUps: UserPowerUps = {
        inventory: {
            skip: 1,
            fifty_fifty: 0,
            extra_hint: 0,
            double_stars: 0,
            shield: 0
        },
        usesToday: {
            skip: 0,
            fifty_fifty: 0,
            extra_hint: 0,
            double_stars: 0,
            shield: 0
        },
        lastResetDate: getLocalDateStr()
    };

    const onUse = vi.fn();

    it('renders only available power-ups', () => {
        render(
            <PowerUpBarCompact
                userPowerUps={mockUserPowerUps}
                onUsePowerUp={onUse}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(1); // Only 'skip'
    });

    it('handles click', () => {
        render(
            <PowerUpBarCompact
                userPowerUps={mockUserPowerUps}
                onUsePowerUp={onUse}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        expect(onUse).toHaveBeenCalledWith('skip');
    });

    it('renders nothing if no powerups available', () => {
        // Create a userPowerUps object where all inventory items are 0
        const emptyUserPowerUps: UserPowerUps = {
            ...mockUserPowerUps,
            inventory: {
                skip: 0,
                fifty_fifty: 0,
                extra_hint: 0,
                double_stars: 0,
                shield: 0
            }
        };

        render(
            <PowerUpBarCompact
                userPowerUps={emptyUserPowerUps}
                onUsePowerUp={onUse}
            />
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders empty gameplay powerups when onBuyPowerUp is provided', () => {
        const emptyUserPowerUps: UserPowerUps = {
            ...mockUserPowerUps,
            inventory: {
                skip: 0,
                fifty_fifty: 0,
                extra_hint: 0,
                double_stars: 0,
                shield: 0
            }
        };

        const onBuy = vi.fn();

        render(
            <PowerUpBarCompact
                userPowerUps={emptyUserPowerUps}
                onUsePowerUp={onUse}
                userStars={100}
                onBuyPowerUp={onBuy}
            />
        );

        // 4 gameplay powerups (skip, fifty_fifty, extra_hint, double_stars), excluding passive shield
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(4);
    });

    it('opens buy confirm overlay and calls buy+use when clicking empty powerup', () => {
        const emptyUserPowerUps: UserPowerUps = {
            ...mockUserPowerUps,
            inventory: {
                skip: 0,
                fifty_fifty: 0,
                extra_hint: 0,
                double_stars: 0,
                shield: 0
            }
        };

        const onBuy = vi.fn().mockReturnValue(true);
        const onUseMock = vi.fn();

        render(
            <PowerUpBarCompact
                userPowerUps={emptyUserPowerUps}
                onUsePowerUp={onUseMock}
                userStars={100}
                onBuyPowerUp={onBuy}
            />
        );

        // Click the 50/50 button (which has quantity 0)
        const fiftyButton = screen.getByRole('button', { name: /Comprar 50\/50/i });
        fireEvent.click(fiftyButton);

        // Overlay should open
        expect(screen.getByText('Comprar 50/50?')).toBeInTheDocument();

        // Confirm buy
        const confirmBtn = screen.getByRole('button', { name: /Comprar e Usar/i });
        fireEvent.click(confirmBtn);

        expect(onBuy).toHaveBeenCalledWith('fifty_fifty', 10);
        expect(onUseMock).toHaveBeenCalledWith('fifty_fifty');
    });

    it('disables confirm button if userStars is insufficient in compact mode', () => {
        const emptyUserPowerUps: UserPowerUps = {
            ...mockUserPowerUps,
            inventory: {
                skip: 0,
                fifty_fifty: 0,
                extra_hint: 0,
                double_stars: 0,
                shield: 0
            }
        };

        const onBuy = vi.fn();

        render(
            <PowerUpBarCompact
                userPowerUps={emptyUserPowerUps}
                onUsePowerUp={onUse}
                userStars={5} // 50/50 costs 10
                onBuyPowerUp={onBuy}
            />
        );

        const fiftyButton = screen.getByRole('button', { name: /Comprar 50\/50/i });
        fireEvent.click(fiftyButton);

        const confirmBtn = screen.getByRole('button', { name: /Estrelas Insuficientes/i });
        expect(confirmBtn).toBeDisabled();
    });
});
