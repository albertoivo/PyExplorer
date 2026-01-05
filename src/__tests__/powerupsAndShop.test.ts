/**
 * Testes para sistema de Power-ups e Loja
 * Testa: uso de power-ups, compras, inventário e equipamentos
 */
import { describe, it, expect } from 'vitest'
import { POWERUPS, SHOP_ITEMS } from '../data/gamificationData'
import type { PowerUpType } from '../types/gamification'

// ============================================
// TIPOS E FUNÇÕES EXTRAÍDAS DA LÓGICA
// ============================================

interface UserPowerUps {
    inventory: Record<PowerUpType, number>
    usesToday: Record<PowerUpType, number>
    lastResetDate: string
}


/**
 * Verifica se um power-up pode ser usado
 */
function canUsePowerUp(
    type: PowerUpType,
    inventory: Record<PowerUpType, number>,
    usesToday: Record<PowerUpType, number>,
    maxPerDay: number
): { canUse: boolean; reason?: string } {
    if (inventory[type] <= 0) {
        return { canUse: false, reason: 'Não tem power-up disponível' }
    }
    if (usesToday[type] >= maxPerDay) {
        return { canUse: false, reason: 'Limite diário atingido' }
    }
    return { canUse: true }
}

/**
 * Usa um power-up e retorna novo estado
 */
function usePowerUp(
    type: PowerUpType,
    powerUps: UserPowerUps,
    today: string
): UserPowerUps | null {
    const powerUpConfig = POWERUPS.find(p => p.id === type)
    if (!powerUpConfig) return null

    // Reset diário se necessário
    let current = powerUps
    if (current.lastResetDate !== today) {
        current = {
            ...current,
            usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            lastResetDate: today,
        }
    }

    // Verifica disponibilidade
    const check = canUsePowerUp(type, current.inventory, current.usesToday, powerUpConfig.maxPerDay)
    if (!check.canUse) return null

    // Usa o power-up
    return {
        ...current,
        inventory: { ...current.inventory, [type]: current.inventory[type] - 1 },
        usesToday: { ...current.usesToday, [type]: current.usesToday[type] + 1 },
    }
}

/**
 * Compra um power-up
 */
function buyPowerUp(
    type: PowerUpType,
    powerUps: UserPowerUps,
    userStars: number
): { success: boolean; newStars: number; newPowerUps: UserPowerUps } | null {
    const powerUpConfig = POWERUPS.find(p => p.id === type)
    if (!powerUpConfig) return null

    if (userStars < powerUpConfig.price) {
        return null // Sem estrelas suficientes
    }

    return {
        success: true,
        newStars: userStars - powerUpConfig.price,
        newPowerUps: {
            ...powerUps,
            inventory: { ...powerUps.inventory, [type]: powerUps.inventory[type] + 1 },
        },
    }
}

/**
 * Compra um item da loja
 */
function buyShopItem(
    itemId: string,
    userStars: number,
    userLevel: number,
    ownedItems: string[]
): { success: boolean; newStars: number; reason?: string } | null {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return { success: false, reason: 'Item não encontrado', newStars: userStars }

    if (ownedItems.includes(itemId)) {
        return { success: false, reason: 'Item já possuído', newStars: userStars }
    }

    if (item.requiredLevel && userLevel < item.requiredLevel) {
        return { success: false, reason: 'Nível insuficiente', newStars: userStars }
    }

    if (userStars < item.price) {
        return { success: false, reason: 'Estrelas insuficientes', newStars: userStars }
    }

    return {
        success: true,
        newStars: userStars - item.price,
    }
}

/**
 * Verifica se um item pode ser equipado
 */
function canEquipItem(
    itemId: string,
    ownedItems: string[]
): boolean {
    return ownedItems.includes(itemId)
}

describe('Sistema de Power-ups', () => {
    const getInitialPowerUps = (): UserPowerUps => ({
        inventory: { skip: 2, fifty_fifty: 3, extra_hint: 3, double_stars: 1, shield: 1 },
        usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
        lastResetDate: '2024-01-15',
    })

    // ============================================
    // TESTES DE VERIFICAÇÃO DE USO
    // ============================================
    describe('canUsePowerUp', () => {
        it('deve permitir usar power-up disponível', () => {
            const inventory: Record<PowerUpType, number> = { skip: 1, fifty_fifty: 1, extra_hint: 1, double_stars: 1, shield: 1 }
            const usesToday: Record<PowerUpType, number> = { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }

            const result = canUsePowerUp('skip', inventory, usesToday, 3)
            expect(result.canUse).toBe(true)
        })

        it('não deve permitir usar se inventário vazio', () => {
            const inventory: Record<PowerUpType, number> = { skip: 0, fifty_fifty: 1, extra_hint: 1, double_stars: 1, shield: 1 }
            const usesToday: Record<PowerUpType, number> = { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }

            const result = canUsePowerUp('skip', inventory, usesToday, 3)
            expect(result.canUse).toBe(false)
            expect(result.reason).toContain('disponível')
        })

        it('não deve permitir usar se limite diário atingido', () => {
            const inventory: Record<PowerUpType, number> = { skip: 5, fifty_fifty: 1, extra_hint: 1, double_stars: 1, shield: 1 }
            const usesToday: Record<PowerUpType, number> = { skip: 3, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }

            const result = canUsePowerUp('skip', inventory, usesToday, 3)
            expect(result.canUse).toBe(false)
            expect(result.reason).toContain('Limite')
        })
    })

    // ============================================
    // TESTES DE USO DE POWER-UP
    // ============================================
    describe('usePowerUp', () => {
        it('deve decrementar inventário ao usar', () => {
            const powerUps = getInitialPowerUps()
            const result = usePowerUp('skip', powerUps, '2024-01-15')

            expect(result).not.toBeNull()
            expect(result?.inventory.skip).toBe(1) // Era 2, virou 1
            expect(result?.usesToday.skip).toBe(1)
        })

        it('deve retornar null se não puder usar', () => {
            const powerUps: UserPowerUps = {
                ...getInitialPowerUps(),
                inventory: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            }
            const result = usePowerUp('skip', powerUps, '2024-01-15')

            expect(result).toBeNull()
        })

        it('deve resetar contagem diária em novo dia', () => {
            const powerUps: UserPowerUps = {
                ...getInitialPowerUps(),
                usesToday: { skip: 2, fifty_fifty: 2, extra_hint: 2, double_stars: 2, shield: 1 },
                lastResetDate: '2024-01-14', // Ontem
            }

            const result = usePowerUp('skip', powerUps, '2024-01-15')

            expect(result).not.toBeNull()
            expect(result?.usesToday.skip).toBe(1) // Resetou e usou 1
            expect(result?.usesToday.fifty_fifty).toBe(0) // Resetou
            expect(result?.lastResetDate).toBe('2024-01-15')
        })

        it('shield deve ter limite de 1 por dia', () => {
            const powerUps: UserPowerUps = {
                ...getInitialPowerUps(),
                inventory: { skip: 2, fifty_fifty: 2, extra_hint: 2, double_stars: 2, shield: 2 },
                usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 1 },
            }

            const result = usePowerUp('shield', powerUps, '2024-01-15')
            expect(result).toBeNull() // Não pode usar mais hoje
        })
    })

    // ============================================
    // TESTES DE COMPRA DE POWER-UP
    // ============================================
    describe('buyPowerUp', () => {
        it('deve permitir compra com estrelas suficientes', () => {
            const powerUps = getInitialPowerUps()
            const result = buyPowerUp('skip', powerUps, 50)

            expect(result).not.toBeNull()
            expect(result?.success).toBe(true)
            expect(result?.newStars).toBe(50 - 15) // skip custa 15
            expect(result?.newPowerUps.inventory.skip).toBe(3) // Era 2, comprou 1
        })

        it('deve falhar sem estrelas suficientes', () => {
            const powerUps = getInitialPowerUps()
            const result = buyPowerUp('shield', powerUps, 10) // shield custa 25

            expect(result).toBeNull()
        })

        it('deve deduzir preço correto de cada power-up', () => {
            const powerUps = getInitialPowerUps()

            const skipResult = buyPowerUp('skip', powerUps, 100)
            expect(skipResult?.newStars).toBe(100 - 15)

            const doubleResult = buyPowerUp('double_stars', powerUps, 100)
            expect(doubleResult?.newStars).toBe(100 - 20)

            const shieldResult = buyPowerUp('shield', powerUps, 100)
            expect(shieldResult?.newStars).toBe(100 - 25)
        })
    })
})

describe('Sistema de Loja', () => {
    // ============================================
    // TESTES DE COMPRA DE ITEM
    // ============================================
    describe('buyShopItem', () => {
        it('deve permitir compra de item gratuito', () => {
            const result = buyShopItem('avatar_snake_green', 0, 1, [])

            expect(result).not.toBeNull()
            expect(result?.success).toBe(true)
            expect(result?.newStars).toBe(0)
        })

        it('deve permitir compra de item com estrelas suficientes', () => {
            const result = buyShopItem('avatar_robot', 100, 1, [])

            expect(result).not.toBeNull()
            expect(result?.success).toBe(true)
            expect(result?.newStars).toBe(100 - 30) // robot custa 30
        })

        it('deve falhar se já possui o item', () => {
            const result = buyShopItem('avatar_robot', 100, 1, ['avatar_robot'])

            expect(result?.success).toBe(false)
            expect(result?.reason).toContain('possuído')
        })

        it('deve falhar sem estrelas suficientes', () => {
            const result = buyShopItem('avatar_ninja', 50, 1, []) // ninja custa 100

            expect(result?.success).toBe(false)
            expect(result?.reason).toContain('Estrelas')
        })

        it('deve falhar sem nível suficiente', () => {
            const result = buyShopItem('avatar_dragon', 500, 3, []) // dragon requer nível 5

            expect(result?.success).toBe(false)
            expect(result?.reason).toContain('Nível')
        })

        it('deve permitir compra com nível suficiente', () => {
            const result = buyShopItem('avatar_dragon', 500, 5, [])

            expect(result?.success).toBe(true)
            expect(result?.newStars).toBe(500 - 150) // dragon custa 150
        })

        it('deve retornar erro para item inexistente', () => {
            const result = buyShopItem('item_inexistente', 100, 1, [])

            expect(result?.success).toBe(false)
            expect(result?.reason).toContain('não encontrado')
        })
    })

    // ============================================
    // TESTES DE EQUIPAMENTO
    // ============================================
    describe('canEquipItem', () => {
        it('deve permitir equipar item possuído', () => {
            const owned = ['avatar_snake_green', 'frame_fire']

            expect(canEquipItem('avatar_snake_green', owned)).toBe(true)
            expect(canEquipItem('frame_fire', owned)).toBe(true)
        })

        it('não deve permitir equipar item não possuído', () => {
            const owned = ['avatar_snake_green']

            expect(canEquipItem('avatar_golden_snake', owned)).toBe(false)
        })

        it('deve funcionar com inventário vazio', () => {
            expect(canEquipItem('avatar_snake_green', [])).toBe(false)
        })
    })

    // ============================================
    // CENÁRIOS DE COMPRA
    // ============================================
    describe('Cenários de Compra', () => {
        it('compra progressiva de avatares', () => {
            let stars = 100
            const owned: string[] = []

            // Compra avatar básico (grátis)
            let result = buyShopItem('avatar_snake_green', stars, 1, owned)
            expect(result?.success).toBe(true)
            owned.push('avatar_snake_green')
            stars = result?.newStars ?? stars
            expect(stars).toBe(100)

            // Compra robot (30 estrelas)
            result = buyShopItem('avatar_robot', stars, 1, owned)
            expect(result?.success).toBe(true)
            owned.push('avatar_robot')
            stars = result?.newStars ?? stars
            expect(stars).toBe(70)

            // Compra wizard (50 estrelas)
            result = buyShopItem('avatar_wizard', stars, 1, owned)
            expect(result?.success).toBe(true)
            owned.push('avatar_wizard')
            stars = result?.newStars ?? stars
            expect(stars).toBe(20)

            // Tenta comprar ninja (100 estrelas) - falha
            result = buyShopItem('avatar_ninja', stars, 1, owned)
            expect(result?.success).toBe(false)
        })

        it('tentativa de compra duplicada', () => {
            const owned = ['avatar_robot']

            const result = buyShopItem('avatar_robot', 1000, 10, owned)
            expect(result?.success).toBe(false)
            expect(result?.newStars).toBe(1000) // Não desconta
        })
    })
})

describe('Integração Power-ups e Loja', () => {
    it('fluxo completo: ganhar estrelas -> comprar power-up -> usar', () => {
        let stars = 0
        let powerUps: UserPowerUps = {
            inventory: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            lastResetDate: '2024-01-15',
        }

        // Ganha estrelas
        stars += 50
        expect(stars).toBe(50)

        // Compra power-up skip (15 estrelas)
        const buyResult = buyPowerUp('skip', powerUps, stars)
        expect(buyResult).not.toBeNull()
        stars = buyResult?.newStars ?? stars
        powerUps = buyResult?.newPowerUps ?? powerUps

        expect(stars).toBe(35)
        expect(powerUps.inventory.skip).toBe(1)

        // Usa o power-up
        const useResult = usePowerUp('skip', powerUps, '2024-01-15')
        expect(useResult).not.toBeNull()
        powerUps = useResult ?? powerUps

        expect(powerUps.inventory.skip).toBe(0)
        expect(powerUps.usesToday.skip).toBe(1)

        // Tenta usar novamente - falha (inventário vazio)
        const useAgain = usePowerUp('skip', powerUps, '2024-01-15')
        expect(useAgain).toBeNull()
    })
})
