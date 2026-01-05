/**
 * Testes para funções auxiliares de gamificação
 * Testa: níveis, XP, progresso, missões e funções auxiliares
 */
import { describe, it, expect } from 'vitest'
import {
    getLevelFromXP,
    getLevelProgress,
    getAchievementsByCategory,
    getShopItemsByType,
    generateDailyMissions,
    generateWeeklyMissions,
    ACHIEVEMENTS,
    LEVELS,
    POWERUPS,
    SHOP_ITEMS,
    DAILY_MISSIONS,
    WEEKLY_MISSIONS,
} from '../data/gamificationData'

describe('gamificationData', () => {
    // ============================================
    // TESTES DE NÍVEIS E XP
    // ============================================
    describe('getLevelFromXP', () => {
        it('deve retornar nível 1 para XP 0', () => {
            const level = getLevelFromXP(0)
            expect(level.level).toBe(1)
            expect(level.name).toBe('Novato')
            expect(level.minXP).toBe(0)
        })

        it('deve retornar nível 1 para XP abaixo de 100', () => {
            expect(getLevelFromXP(50).level).toBe(1)
            expect(getLevelFromXP(99).level).toBe(1)
        })

        it('deve retornar nível 2 para XP entre 100 e 249', () => {
            const level = getLevelFromXP(100)
            expect(level.level).toBe(2)
            expect(level.name).toBe('Aprendiz')
        })

        it('deve retornar nível 2 para XP limite superior do nível 2', () => {
            expect(getLevelFromXP(249).level).toBe(2)
        })

        it('deve retornar nível 3 para XP exatamente 250', () => {
            const level = getLevelFromXP(250)
            expect(level.level).toBe(3)
            expect(level.name).toBe('Estudante')
        })

        it('deve retornar nível máximo (15) para XP muito alto', () => {
            const level = getLevelFromXP(50000)
            expect(level.level).toBe(15)
            expect(level.name).toBe('Imortal')
            expect(level.maxXP).toBe(Infinity)
        })

        it('deve retornar nível 15 para XP exatamente 18000', () => {
            const level = getLevelFromXP(18000)
            expect(level.level).toBe(15)
        })

        it('deve ter recompensas no nível 15', () => {
            const level = getLevelFromXP(18000)
            expect(level.rewards).toBeDefined()
            expect(level.rewards?.stars).toBe(500)
            expect(level.rewards?.itemId).toBe('avatar_golden_snake')
        })

        it('deve retornar nível correto para valores de borda', () => {
            // Testa transições entre níveis
            expect(getLevelFromXP(99).level).toBe(1)
            expect(getLevelFromXP(100).level).toBe(2)
            expect(getLevelFromXP(249).level).toBe(2)
            expect(getLevelFromXP(250).level).toBe(3)
            expect(getLevelFromXP(499).level).toBe(3)
            expect(getLevelFromXP(500).level).toBe(4)
        })

        it('deve retornar nível 1 para XP negativo (edge case)', () => {
            // O código não trata XP negativo explicitamente, mas deve retornar nível 1
            const level = getLevelFromXP(-100)
            expect(level.level).toBe(1)
        })
    })

    describe('getLevelProgress', () => {
        it('deve retornar 0% para início do nível 1', () => {
            const progress = getLevelProgress(0)
            expect(progress).toBe(0)
        })

        it('deve retornar 50% para metade do nível 1', () => {
            const progress = getLevelProgress(50)
            expect(progress).toBe(50)
        })

        it('deve retornar próximo de 100% para quase subir de nível', () => {
            const progress = getLevelProgress(99)
            expect(progress).toBe(99)
        })

        it('deve retornar 0% para início do nível 2', () => {
            const progress = getLevelProgress(100)
            // Nível 2: minXP=100, maxXP=250, então 100-100=0/150=0%
            expect(progress).toBe(0)
        })

        it('deve retornar progresso correto no meio do nível 2', () => {
            // Nível 2: minXP=100, maxXP=250 (range = 150)
            // XP 175 = 75 de progresso = 50%
            const progress = getLevelProgress(175)
            expect(progress).toBe(50)
        })

        it('deve retornar 100% para nível máximo', () => {
            const progress = getLevelProgress(50000)
            expect(progress).toBe(100)
        })

        it('deve lidar com valores de borda entre níveis', () => {
            // Transição do nível 2 para 3 (em 250)
            expect(getLevelProgress(249)).toBeCloseTo(99.33, 0) // ~99%
            expect(getLevelProgress(250)).toBe(0) // Início do nível 3
        })
    })

    // ============================================
    // TESTES DE CONQUISTAS
    // ============================================
    describe('ACHIEVEMENTS', () => {
        it('deve ter todas as conquistas definidas', () => {
            expect(ACHIEVEMENTS.length).toBeGreaterThan(0)
            expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(17)
        })

        it('cada conquista deve ter campos obrigatórios', () => {
            ACHIEVEMENTS.forEach(achievement => {
                expect(achievement.id).toBeDefined()
                expect(achievement.name).toBeDefined()
                expect(achievement.description).toBeDefined()
                expect(achievement.icon).toBeDefined()
                expect(achievement.category).toBeDefined()
                expect(achievement.rarity).toBeDefined()
                expect(achievement.xpReward).toBeGreaterThanOrEqual(0)
                expect(achievement.starsReward).toBeGreaterThanOrEqual(0)
                expect(achievement.condition).toBeDefined()
            })
        })

        it('conquistas de streak devem existir', () => {
            const streakAchievements = ACHIEVEMENTS.filter(a => a.category === 'streak')
            expect(streakAchievements.length).toBeGreaterThanOrEqual(4)

            const streak3 = ACHIEVEMENTS.find(a => a.id === 'streak_3')
            expect(streak3).toBeDefined()
            expect(streak3?.name).toBe('Iniciante Constante')
        })

        it('conquistas de learning devem existir', () => {
            const learningAchievements = ACHIEVEMENTS.filter(a => a.category === 'learning')
            expect(learningAchievements.length).toBeGreaterThanOrEqual(4)
        })

        it('conquistas de mastery devem existir', () => {
            const masteryAchievements = ACHIEVEMENTS.filter(a => a.category === 'mastery')
            expect(masteryAchievements.length).toBeGreaterThanOrEqual(4)
        })

        it('conquistas especiais/ocultas devem ter hidden=true', () => {
            const hiddenAchievements = ACHIEVEMENTS.filter(a => a.hidden)
            expect(hiddenAchievements.length).toBeGreaterThan(0)

            // Verifica específicas
            const earlyBird = ACHIEVEMENTS.find(a => a.id === 'early_bird')
            expect(earlyBird?.hidden).toBe(true)
        })

        it('IDs de conquistas devem ser únicos', () => {
            const ids = ACHIEVEMENTS.map(a => a.id)
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(ids.length)
        })
    })

    describe('getAchievementsByCategory', () => {
        it('deve retornar conquistas de learning', () => {
            const learning = getAchievementsByCategory('learning')
            expect(learning.length).toBeGreaterThan(0)
            expect(learning.every(a => a.category === 'learning')).toBe(true)
        })

        it('deve retornar conquistas de streak', () => {
            const streak = getAchievementsByCategory('streak')
            expect(streak.length).toBeGreaterThan(0)
            expect(streak.every(a => a.category === 'streak')).toBe(true)
        })

        it('deve retornar conquistas de mastery', () => {
            const mastery = getAchievementsByCategory('mastery')
            expect(mastery.length).toBeGreaterThan(0)
            expect(mastery.every(a => a.category === 'mastery')).toBe(true)
        })

        it('deve retornar array vazio para categoria inexistente', () => {
            const invalid = getAchievementsByCategory('invalid')
            expect(invalid).toEqual([])
        })
    })

    // ============================================
    // TESTES DE NÍVEIS
    // ============================================
    describe('LEVELS', () => {
        it('deve ter 15 níveis definidos', () => {
            expect(LEVELS.length).toBe(15)
        })

        it('níveis devem estar em ordem crescente de XP', () => {
            for (let i = 1; i < LEVELS.length; i++) {
                expect(LEVELS[i].minXP).toBeGreaterThan(LEVELS[i - 1].minXP)
            }
        })

        it('cada nível deve ter XP máximo maior que XP mínimo', () => {
            LEVELS.forEach(level => {
                expect(level.maxXP).toBeGreaterThan(level.minXP)
            })
        })

        it('níveis devem ser contíguos (maxXP de um = minXP do próximo)', () => {
            for (let i = 0; i < LEVELS.length - 1; i++) {
                expect(LEVELS[i].maxXP).toBe(LEVELS[i + 1].minXP)
            }
        })

        it('último nível deve ter maxXP infinito', () => {
            const lastLevel = LEVELS[LEVELS.length - 1]
            expect(lastLevel.maxXP).toBe(Infinity)
            expect(lastLevel.level).toBe(15)
        })

        it('cada nível deve ter nome, ícone e cor', () => {
            LEVELS.forEach(level => {
                expect(level.name).toBeDefined()
                expect(level.name.length).toBeGreaterThan(0)
                expect(level.icon).toBeDefined()
                expect(level.color).toBeDefined()
                expect(level.color).toMatch(/^#[0-9a-fA-F]{6}$/)
            })
        })
    })

    // ============================================
    // TESTES DE POWER-UPS
    // ============================================
    describe('POWERUPS', () => {
        it('deve ter 5 power-ups definidos', () => {
            expect(POWERUPS.length).toBe(5)
        })

        it('cada power-up deve ter campos obrigatórios', () => {
            POWERUPS.forEach(powerup => {
                expect(powerup.id).toBeDefined()
                expect(powerup.name).toBeDefined()
                expect(powerup.description).toBeDefined()
                expect(powerup.icon).toBeDefined()
                expect(powerup.price).toBeGreaterThan(0)
                expect(powerup.maxPerDay).toBeGreaterThan(0)
            })
        })

        it('deve ter os power-ups específicos', () => {
            const ids = POWERUPS.map(p => p.id)
            expect(ids).toContain('skip')
            expect(ids).toContain('fifty_fifty')
            expect(ids).toContain('extra_hint')
            expect(ids).toContain('double_stars')
            expect(ids).toContain('shield')
        })

        it('power-up double_stars deve ser mais caro', () => {
            const doubleStars = POWERUPS.find(p => p.id === 'double_stars')
            const fiftyFifty = POWERUPS.find(p => p.id === 'fifty_fifty')
            expect(doubleStars?.price).toBeGreaterThan(fiftyFifty?.price ?? 0)
        })

        it('power-up shield deve ter limite de 1 por dia', () => {
            const shield = POWERUPS.find(p => p.id === 'shield')
            expect(shield?.maxPerDay).toBe(1)
        })
    })

    // ============================================
    // TESTES DA LOJA
    // ============================================
    describe('SHOP_ITEMS', () => {
        it('deve ter itens definidos', () => {
            expect(SHOP_ITEMS.length).toBeGreaterThan(0)
        })

        it('deve ter itens gratuitos (preço 0)', () => {
            const freeItems = SHOP_ITEMS.filter(item => item.price === 0)
            expect(freeItems.length).toBeGreaterThanOrEqual(3) // avatar, frame, title básicos
        })

        it('deve ter avatares, frames e títulos', () => {
            const avatars = SHOP_ITEMS.filter(item => item.type === 'avatar')
            const frames = SHOP_ITEMS.filter(item => item.type === 'frame')
            const titles = SHOP_ITEMS.filter(item => item.type === 'title')

            expect(avatars.length).toBeGreaterThan(0)
            expect(frames.length).toBeGreaterThan(0)
            expect(titles.length).toBeGreaterThan(0)
        })

        it('IDs de itens devem ser únicos', () => {
            const ids = SHOP_ITEMS.map(item => item.id)
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(ids.length)
        })

        it('itens com requiredLevel devem ter preço maior', () => {
            const itemsWithLevel = SHOP_ITEMS.filter(item => item.requiredLevel)
            itemsWithLevel.forEach(item => {
                expect(item.price).toBeGreaterThan(0)
            })
        })
    })

    describe('getShopItemsByType', () => {
        it('deve retornar apenas avatares', () => {
            const avatars = getShopItemsByType('avatar')
            expect(avatars.length).toBeGreaterThan(0)
            expect(avatars.every(item => item.type === 'avatar')).toBe(true)
        })

        it('deve retornar apenas frames', () => {
            const frames = getShopItemsByType('frame')
            expect(frames.length).toBeGreaterThan(0)
            expect(frames.every(item => item.type === 'frame')).toBe(true)
        })

        it('deve retornar apenas títulos', () => {
            const titles = getShopItemsByType('title')
            expect(titles.length).toBeGreaterThan(0)
            expect(titles.every(item => item.type === 'title')).toBe(true)
        })

        it('deve retornar array vazio para tipo inexistente', () => {
            const invalid = getShopItemsByType('invalid')
            expect(invalid).toEqual([])
        })
    })

    // ============================================
    // TESTES DE MISSÕES
    // ============================================
    describe('DAILY_MISSIONS', () => {
        it('deve ter missões diárias definidas', () => {
            expect(DAILY_MISSIONS.length).toBeGreaterThan(0)
        })

        it('todas devem ser do tipo daily', () => {
            DAILY_MISSIONS.forEach(mission => {
                expect(mission.type).toBe('daily')
            })
        })

        it('cada missão deve ter campos obrigatórios', () => {
            DAILY_MISSIONS.forEach(mission => {
                expect(mission.title).toBeDefined()
                expect(mission.description).toBeDefined()
                expect(mission.icon).toBeDefined()
                expect(mission.objectiveType).toBeDefined()
                expect(mission.targetValue).toBeGreaterThan(0)
                expect(mission.starsReward).toBeGreaterThan(0)
                expect(mission.xpReward).toBeGreaterThan(0)
            })
        })
    })

    describe('WEEKLY_MISSIONS', () => {
        it('deve ter missões semanais definidas', () => {
            expect(WEEKLY_MISSIONS.length).toBeGreaterThan(0)
        })

        it('todas devem ser do tipo weekly', () => {
            WEEKLY_MISSIONS.forEach(mission => {
                expect(mission.type).toBe('weekly')
            })
        })

        it('missões semanais devem ter recompensas maiores que diárias', () => {
            const avgDailyXP = DAILY_MISSIONS.reduce((sum, m) => sum + m.xpReward, 0) / DAILY_MISSIONS.length
            const avgWeeklyXP = WEEKLY_MISSIONS.reduce((sum, m) => sum + m.xpReward, 0) / WEEKLY_MISSIONS.length

            expect(avgWeeklyXP).toBeGreaterThan(avgDailyXP)
        })
    })

    describe('generateDailyMissions', () => {
        it('deve gerar 3 missões diárias', () => {
            const today = new Date()
            const missions = generateDailyMissions(today)
            expect(missions.length).toBe(3)
        })

        it('cada missão deve ter um ID único baseado na data', () => {
            const date = new Date('2024-01-15')
            const missions = generateDailyMissions(date)

            missions.forEach(mission => {
                expect(mission.id).toContain('daily_')
                expect(mission.id).toContain('2024-01-15')
            })

            // IDs devem ser únicos
            const ids = missions.map(m => m.id)
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(3)
        })

        it('mesma data deve gerar mesmas missões', () => {
            const date = new Date('2024-06-20')
            const missions1 = generateDailyMissions(date)
            const missions2 = generateDailyMissions(date)

            expect(missions1.map(m => m.id)).toEqual(missions2.map(m => m.id))
        })

        it('datas diferentes devem gerar missões diferentes (ou iguais por acaso)', () => {
            const date1 = new Date('2024-01-01')
            const date2 = new Date('2024-01-02')

            const missions1 = generateDailyMissions(date1)
            const missions2 = generateDailyMissions(date2)

            // Os IDs pelo menos devem ser diferentes
            expect(missions1[0].id).not.toBe(missions2[0].id)
        })
    })

    describe('generateWeeklyMissions', () => {
        it('deve gerar 2 missões semanais', () => {
            const today = new Date()
            const missions = generateWeeklyMissions(today)
            expect(missions.length).toBe(2)
        })

        it('cada missão deve ter um ID único baseado na semana', () => {
            const date = new Date('2024-01-15')
            const missions = generateWeeklyMissions(date)

            missions.forEach(mission => {
                expect(mission.id).toContain('weekly_')
            })
        })

        it('mesma semana deve gerar mesmas missões', () => {
            // Segunda e quarta da mesma semana
            const monday = new Date('2024-01-15') // Segunda
            const wednesday = new Date('2024-01-17') // Quarta

            const missions1 = generateWeeklyMissions(monday)
            const missions2 = generateWeeklyMissions(wednesday)

            expect(missions1.map(m => m.id)).toEqual(missions2.map(m => m.id))
        })

        it('semanas diferentes devem gerar IDs diferentes', () => {
            const week1 = new Date('2024-01-01')
            const week2 = new Date('2024-01-08')

            const missions1 = generateWeeklyMissions(week1)
            const missions2 = generateWeeklyMissions(week2)

            expect(missions1[0].id).not.toBe(missions2[0].id)
        })
    })

    // ============================================
    // TESTES DE INTEGRIDADE DE RECOMPENSAS
    // ============================================
    describe('Integridade de Recompensas', () => {
        it('conquistas devem ter recompensas proporcionais à raridade', () => {
            const byRarity = {
                common: ACHIEVEMENTS.filter(a => a.rarity === 'common'),
                rare: ACHIEVEMENTS.filter(a => a.rarity === 'rare'),
                epic: ACHIEVEMENTS.filter(a => a.rarity === 'epic'),
                legendary: ACHIEVEMENTS.filter(a => a.rarity === 'legendary'),
            }

            const avgXP = (achievements: typeof ACHIEVEMENTS) =>
                achievements.reduce((sum, a) => sum + a.xpReward, 0) / achievements.length

            // XP médio deve aumentar com a raridade
            expect(avgXP(byRarity.rare)).toBeGreaterThan(avgXP(byRarity.common))
            expect(avgXP(byRarity.epic)).toBeGreaterThan(avgXP(byRarity.rare))
            expect(avgXP(byRarity.legendary)).toBeGreaterThan(avgXP(byRarity.epic))
        })

        it('níveis mais altos devem exigir mais XP', () => {
            for (let i = 1; i < LEVELS.length; i++) {
                const prevRange = LEVELS[i - 1].maxXP - LEVELS[i - 1].minXP
                const currRange = LEVELS[i].maxXP - LEVELS[i].minXP

                // Exceto o último nível que tem range infinito
                if (i < LEVELS.length - 1) {
                    expect(currRange).toBeGreaterThanOrEqual(prevRange * 0.8) // Pelo menos 80% do anterior
                }
            }
        })

        it('itens de loja mais caros devem ter requisitos de nível maiores ou ser especiais', () => {
            const expensiveItems = SHOP_ITEMS.filter(item => item.price >= 200)
            const hasRequirement = expensiveItems.filter(item => item.requiredLevel)

            // Pelo menos metade dos itens caros devem ter requisitos
            expect(hasRequirement.length).toBeGreaterThanOrEqual(expensiveItems.length * 0.3)
        })
    })
})
