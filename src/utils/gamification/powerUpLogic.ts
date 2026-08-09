import type { UserGamification, PowerUpType } from '../../types/gamification';
import { POWERUPS } from '../../data/gamificationData';

export function consumePowerUpLogic(state: UserGamification, powerUpType: PowerUpType): { success: boolean, newState: UserGamification } {
    const currentCount = state.powerUps.inventory[powerUpType] || 0;

    if (currentCount <= 0) {
        return { success: false, newState: state };
    }

    const powerUpConfig = POWERUPS.find(p => p.id === powerUpType);
    const maxPerDay = powerUpConfig ? powerUpConfig.maxPerDay : Infinity;
    const currentUsesToday = state.powerUps.usesToday[powerUpType] || 0;

    if (currentUsesToday >= maxPerDay) {
        return { success: false, newState: state };
    }

    const { inventory, usesToday } = state.powerUps;

    return {
        success: true,
        newState: {
            ...state,
            powerUps: {
                ...state.powerUps,
                inventory: {
                    ...inventory,
                    [powerUpType]: inventory[powerUpType] - 1,
                },
                usesToday: {
                    ...usesToday,
                    [powerUpType]: usesToday[powerUpType] + 1,
                },
            },
        }
    };
}

export function buyPowerUpLogic(
    state: UserGamification,
    powerUpType: PowerUpType,
    price: number,
    userBalance: number
): { success: boolean, newState: UserGamification } {
    if (userBalance < price) {
        return { success: false, newState: state };
    }

    return {
        success: true,
        newState: {
            ...state,
            powerUps: {
                ...state.powerUps,
                inventory: {
                    ...state.powerUps.inventory,
                    [powerUpType]: state.powerUps.inventory[powerUpType] + 1,
                },
            },
        }
    };
}

// ============================================
// MISSIONS
// ============================================
