import type { UserGamification } from '../../types/gamification';

export function buyShopItemLogic(
    state: UserGamification,
    itemId: string,
    price: number,
    userBalance: number
): { success: boolean, newState: UserGamification } {
    if (state.inventory.ownedItems.includes(itemId)) {
        return { success: false, newState: state };
    }
    if (userBalance < price) {
        return { success: false, newState: state };
    }

    return {
        success: true,
        newState: {
            ...state,
            inventory: {
                ...state.inventory,
                ownedItems: [...state.inventory.ownedItems, itemId],
            },
        }
    };
}

export function equipItemLogic(
    state: UserGamification,
    itemId: string,
    type: 'avatar' | 'frame' | 'title'
): UserGamification {
    const updatedInventory = { ...state.inventory };

    switch (type) {
        case 'avatar': updatedInventory.equippedAvatar = itemId; break;
        case 'frame': updatedInventory.equippedFrame = itemId; break;
        case 'title': updatedInventory.equippedTitle = itemId; break;
    }

    return {
        ...state,
        inventory: updatedInventory,
    };
}

// ============================================
// POWER-UPS
// ============================================
