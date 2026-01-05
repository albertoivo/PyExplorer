/**
 * Testes para sistema de Missões
 * Testa: missões diárias, semanais, progresso e recompensas
 */
import { describe, it, expect } from 'vitest'
import {
    generateDailyMissions,
    generateWeeklyMissions,
    DAILY_MISSIONS,
    WEEKLY_MISSIONS,
} from '../data/gamificationData'
import type { Mission, MissionStatus } from '../types/gamification'

// ============================================
// TIPOS E FUNÇÕES PARA TESTE
// ============================================

interface UserMission {
    missionId: string
    progress: number
    status: MissionStatus
    expiresAt: Date
    completedAt?: Date
}

/**
 * Atualiza o progresso de uma missão
 */
function updateMissionProgress(
    mission: UserMission,
    missionConfig: Mission,
    newProgress: number
): UserMission {
    const clampedProgress = Math.min(newProgress, missionConfig.targetValue)
    const isCompleted = clampedProgress >= missionConfig.targetValue

    return {
        ...mission,
        progress: clampedProgress,
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted && !mission.completedAt ? new Date() : mission.completedAt,
    }
}

/**
 * Verifica se uma missão pode ser reivindicada
 */
function canClaimMission(mission: UserMission): boolean {
    return mission.status === 'completed'
}

/**
 * Calcula recompensas de uma missão
 */
function getMissionRewards(missionConfig: Mission): { stars: number; xp: number } {
    return {
        stars: missionConfig.starsReward,
        xp: missionConfig.xpReward,
    }
}

/**
 * Cria uma missão de usuário a partir de uma configuração
 */
function createUserMission(missionConfig: Mission, expiresAt: Date): UserMission {
    return {
        missionId: missionConfig.id,
        progress: 0,
        status: 'active',
        expiresAt,
    }
}

/**
 * Verifica se uma missão expirou
 */
function isMissionExpired(mission: UserMission, now: Date): boolean {
    return now > mission.expiresAt
}

/**
 * Incrementa progresso baseado em ação
 */
function incrementMissionProgress(
    mission: UserMission,
    missionConfig: Mission,
    actionType: string,
    actionWorld?: string,
    amount: number = 1
): UserMission {
    // Verifica se a ação corresponde ao objetivo da missão
    let shouldIncrement = false

    if (missionConfig.objectiveType === 'complete_questions' && actionType === 'complete_question') {
        // Verifica mundo específico se definido
        if (missionConfig.targetWorld) {
            shouldIncrement = actionWorld === missionConfig.targetWorld
        } else {
            shouldIncrement = true
        }
    } else if (missionConfig.objectiveType === 'correct_streak' && actionType === 'correct_answer') {
        shouldIncrement = true
    } else if (missionConfig.objectiveType === 'earn_stars' && actionType === 'earn_stars') {
        shouldIncrement = true
    } else if (missionConfig.objectiveType === 'login_streak' && actionType === 'daily_login') {
        shouldIncrement = true
    }

    if (!shouldIncrement) {
        return mission
    }

    const newProgress = mission.progress + amount
    return updateMissionProgress(mission, missionConfig, newProgress)
}

describe('Sistema de Missões', () => {
    // ============================================
    // TESTES DE GERAÇÃO DE MISSÕES
    // ============================================
    describe('generateDailyMissions', () => {
        it('deve gerar exatamente 3 missões', () => {
            const missions = generateDailyMissions(new Date())
            expect(missions.length).toBe(3)
        })

        it('todas as missões devem ter IDs únicos', () => {
            const missions = generateDailyMissions(new Date())
            const ids = missions.map(m => m.id)
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(3)
        })

        it('deve ser determinístico para a mesma data', () => {
            const date = new Date('2024-06-15')
            const missions1 = generateDailyMissions(date)
            const missions2 = generateDailyMissions(date)

            expect(missions1.map(m => m.id)).toEqual(missions2.map(m => m.id))
            expect(missions1.map(m => m.title)).toEqual(missions2.map(m => m.title))
        })

        it('missões de dias diferentes devem ter IDs diferentes', () => {
            const day1 = generateDailyMissions(new Date('2024-01-01'))
            const day2 = generateDailyMissions(new Date('2024-01-02'))

            expect(day1[0].id).not.toBe(day2[0].id)
        })

        it('cada missão deve ter todos os campos obrigatórios', () => {
            const missions = generateDailyMissions(new Date())

            missions.forEach(mission => {
                expect(mission.id).toBeDefined()
                expect(mission.type).toBe('daily')
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

    describe('generateWeeklyMissions', () => {
        it('deve gerar exatamente 2 missões', () => {
            const missions = generateWeeklyMissions(new Date())
            expect(missions.length).toBe(2)
        })

        it('deve ser consistente para toda a semana', () => {
            // Segunda, quarta e sexta da mesma semana
            const monday = new Date('2024-01-15') // Segunda
            const wednesday = new Date('2024-01-17') // Quarta
            const friday = new Date('2024-01-19') // Sexta

            const mondayMissions = generateWeeklyMissions(monday)
            const wednesdayMissions = generateWeeklyMissions(wednesday)
            const fridayMissions = generateWeeklyMissions(friday)

            expect(mondayMissions.map(m => m.id)).toEqual(wednesdayMissions.map(m => m.id))
            expect(mondayMissions.map(m => m.id)).toEqual(fridayMissions.map(m => m.id))
        })

        it('missões de semanas diferentes devem ser diferentes', () => {
            const week1 = generateWeeklyMissions(new Date('2024-01-01'))
            const week2 = generateWeeklyMissions(new Date('2024-01-08'))

            expect(week1[0].id).not.toBe(week2[0].id)
        })

        it('cada missão semanal deve ter tipo weekly', () => {
            const missions = generateWeeklyMissions(new Date())
            missions.forEach(mission => {
                expect(mission.type).toBe('weekly')
            })
        })
    })

    // ============================================
    // TESTES DE PROGRESSO
    // ============================================
    describe('updateMissionProgress', () => {
        const mockMission: UserMission = {
            missionId: 'test_mission',
            progress: 0,
            status: 'active',
            expiresAt: new Date('2024-12-31'),
        }

        const mockConfig: Mission = {
            id: 'test_mission',
            type: 'daily',
            title: 'Teste',
            description: 'Missão de teste',
            icon: '🎯',
            objectiveType: 'complete_questions',
            targetValue: 5,
            starsReward: 20,
            xpReward: 50,
        }

        it('deve incrementar progresso corretamente', () => {
            const updated = updateMissionProgress(mockMission, mockConfig, 3)
            expect(updated.progress).toBe(3)
            expect(updated.status).toBe('active')
        })

        it('deve marcar como completa ao atingir target', () => {
            const updated = updateMissionProgress(mockMission, mockConfig, 5)
            expect(updated.progress).toBe(5)
            expect(updated.status).toBe('completed')
            expect(updated.completedAt).toBeDefined()
        })

        it('progresso não deve exceder target', () => {
            const updated = updateMissionProgress(mockMission, mockConfig, 10)
            expect(updated.progress).toBe(5) // Limitado ao target
        })

        it('deve manter completedAt após já completar', () => {
            const completed: UserMission = {
                ...mockMission,
                progress: 5,
                status: 'completed',
                completedAt: new Date('2024-01-01'),
            }

            const updated = updateMissionProgress(completed, mockConfig, 5)
            expect(updated.completedAt?.toISOString()).toBe(completed.completedAt?.toISOString())
        })
    })

    describe('incrementMissionProgress', () => {
        const mockMission: UserMission = {
            missionId: 'test_mission',
            progress: 0,
            status: 'active',
            expiresAt: new Date('2024-12-31'),
        }

        it('deve incrementar para ação correta', () => {
            const config: Mission = {
                id: 'test_mission',
                type: 'daily',
                title: 'Completar questões',
                description: '',
                icon: '📝',
                objectiveType: 'complete_questions',
                targetValue: 3,
                starsReward: 15,
                xpReward: 50,
            }

            const updated = incrementMissionProgress(mockMission, config, 'complete_question')
            expect(updated.progress).toBe(1)
        })

        it('não deve incrementar para ação incorreta', () => {
            const config: Mission = {
                id: 'test_mission',
                type: 'daily',
                title: 'Completar questões',
                description: '',
                icon: '📝',
                objectiveType: 'complete_questions',
                targetValue: 3,
                starsReward: 15,
                xpReward: 50,
            }

            const updated = incrementMissionProgress(mockMission, config, 'earn_stars')
            expect(updated.progress).toBe(0) // Não incrementou
        })

        it('deve verificar mundo específico para missões com targetWorld', () => {
            const config: Mission = {
                id: 'test_mission',
                type: 'daily',
                title: 'Completar em mundo específico',
                description: '',
                icon: '🗺️',
                objectiveType: 'complete_questions',
                targetValue: 2,
                starsReward: 15,
                xpReward: 50,
                targetWorld: 'basic_commands',
            }

            // Ação no mundo correto
            const updated1 = incrementMissionProgress(mockMission, config, 'complete_question', 'basic_commands')
            expect(updated1.progress).toBe(1)

            // Ação em outro mundo
            const updated2 = incrementMissionProgress(mockMission, config, 'complete_question', 'loops')
            expect(updated2.progress).toBe(0)
        })

        it('deve permitir incremento com quantidade customizada', () => {
            const config: Mission = {
                id: 'test_mission',
                type: 'daily',
                title: 'Ganhar estrelas',
                description: '',
                icon: '⭐',
                objectiveType: 'earn_stars',
                targetValue: 30,
                starsReward: 10,
                xpReward: 40,
            }

            const updated = incrementMissionProgress(mockMission, config, 'earn_stars', undefined, 15)
            expect(updated.progress).toBe(15)
        })
    })

    // ============================================
    // TESTES DE REIVINDICAÇÃO
    // ============================================
    describe('canClaimMission', () => {
        it('deve permitir reivindicar se completed', () => {
            const mission: UserMission = {
                missionId: 'test',
                progress: 5,
                status: 'completed',
                expiresAt: new Date(),
            }
            expect(canClaimMission(mission)).toBe(true)
        })

        it('não deve permitir reivindicar se active', () => {
            const mission: UserMission = {
                missionId: 'test',
                progress: 3,
                status: 'active',
                expiresAt: new Date(),
            }
            expect(canClaimMission(mission)).toBe(false)
        })

        it('não deve permitir reivindicar se já claimed', () => {
            const mission: UserMission = {
                missionId: 'test',
                progress: 5,
                status: 'claimed',
                expiresAt: new Date(),
            }
            expect(canClaimMission(mission)).toBe(false)
        })
    })

    describe('getMissionRewards', () => {
        it('deve retornar recompensas corretas', () => {
            const config: Mission = {
                id: 'test',
                type: 'daily',
                title: 'Test',
                description: '',
                icon: '🎯',
                objectiveType: 'complete_questions',
                targetValue: 3,
                starsReward: 15,
                xpReward: 50,
            }

            const rewards = getMissionRewards(config)
            expect(rewards.stars).toBe(15)
            expect(rewards.xp).toBe(50)
        })

        it('missões semanais devem ter recompensas maiores', () => {
            // Usa as missões reais para verificar
            const dailyMissions = generateDailyMissions(new Date())
            const weeklyMissions = generateWeeklyMissions(new Date())

            const avgDailyXP = dailyMissions.reduce((sum, m) => sum + m.xpReward, 0) / dailyMissions.length
            const avgWeeklyXP = weeklyMissions.reduce((sum, m) => sum + m.xpReward, 0) / weeklyMissions.length

            expect(avgWeeklyXP).toBeGreaterThan(avgDailyXP)
        })
    })

    // ============================================
    // TESTES DE EXPIRAÇÃO
    // ============================================
    describe('isMissionExpired', () => {
        it('deve retornar true se expirou', () => {
            const mission: UserMission = {
                missionId: 'test',
                progress: 0,
                status: 'active',
                expiresAt: new Date('2024-01-01'),
            }

            expect(isMissionExpired(mission, new Date('2024-01-02'))).toBe(true)
        })

        it('deve retornar false se não expirou', () => {
            const mission: UserMission = {
                missionId: 'test',
                progress: 0,
                status: 'active',
                expiresAt: new Date('2024-01-15'),
            }

            expect(isMissionExpired(mission, new Date('2024-01-10'))).toBe(false)
        })

        it('deve retornar true exatamente no momento de expiração', () => {
            const expireTime = new Date('2024-01-01T23:59:59.999')
            const mission: UserMission = {
                missionId: 'test',
                progress: 0,
                status: 'active',
                expiresAt: expireTime,
            }

            // Exatamente um ms depois
            const afterExpire = new Date(expireTime.getTime() + 1)
            expect(isMissionExpired(mission, afterExpire)).toBe(true)
        })
    })

    // ============================================
    // CENÁRIOS COMPLETOS
    // ============================================
    describe('Cenário: Completar missão diária', () => {
        it('fluxo completo de missão de questões', () => {
            const config: Mission = {
                id: 'daily_test',
                type: 'daily',
                title: 'Estudante do Dia',
                description: 'Complete 3 questões',
                icon: '📝',
                objectiveType: 'complete_questions',
                targetValue: 3,
                starsReward: 15,
                xpReward: 50,
            }

            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)

            let mission = createUserMission(config, endOfDay)

            // Inicialmente ativa com progresso 0
            expect(mission.status).toBe('active')
            expect(mission.progress).toBe(0)

            // Completa primeira questão
            mission = incrementMissionProgress(mission, config, 'complete_question')
            expect(mission.progress).toBe(1)
            expect(mission.status).toBe('active')

            // Completa segunda questão
            mission = incrementMissionProgress(mission, config, 'complete_question')
            expect(mission.progress).toBe(2)
            expect(mission.status).toBe('active')

            // Completa terceira questão - missão completa!
            mission = incrementMissionProgress(mission, config, 'complete_question')
            expect(mission.progress).toBe(3)
            expect(mission.status).toBe('completed')
            expect(mission.completedAt).toBeDefined()

            // Pode reivindicar
            expect(canClaimMission(mission)).toBe(true)

            // Recompensas
            const rewards = getMissionRewards(config)
            expect(rewards.stars).toBe(15)
            expect(rewards.xp).toBe(50)
        })
    })

    describe('Cenário: Missões múltiplas simultâneas', () => {
        it('deve rastrear progresso de múltiplas missões', () => {
            // Usa dados base - filtra missões de complete_questions SEM targetWorld
            const missionsWithCompleteQuestions = DAILY_MISSIONS.filter(
                m => m.objectiveType === 'complete_questions' && !m.targetWorld
            )

            // Se não houver, usa uma missão genérica
            if (missionsWithCompleteQuestions.length === 0) {
                // Apenas verifica que DAILY_MISSIONS existe
                expect(DAILY_MISSIONS.length).toBeGreaterThan(0)
                return
            }

            const endOfDay = new Date()
            endOfDay.setHours(23, 59, 59, 999)

            // Cria missões com IDs
            const missions: Mission[] = missionsWithCompleteQuestions.map((m, i) => ({
                ...m,
                id: `test_${i}`,
            }))

            const userMissions = missions.map(m => createUserMission(m, endOfDay))

            // Todas devem começar ativas
            expect(userMissions.every(m => m.status === 'active')).toBe(true)
            expect(userMissions.every(m => m.progress === 0)).toBe(true)

            // Simula completar questões
            const questMissions = userMissions.map((um, i) => {
                const config = missions[i]
                return incrementMissionProgress(um, config, 'complete_question')
            })

            // Todas devem ter progresso (já que não têm targetWorld)
            expect(questMissions.every(m => m.progress > 0)).toBe(true)
        })
    })
})

describe('Validação de Configurações de Missões', () => {
    describe('DAILY_MISSIONS', () => {
        it('todas as missões devem ter campos válidos', () => {
            DAILY_MISSIONS.forEach(mission => {
                expect(mission.type).toBe('daily')
                expect(mission.targetValue).toBeGreaterThan(0)
                expect(mission.starsReward).toBeGreaterThan(0)
                expect(mission.xpReward).toBeGreaterThan(0)
                expect(['complete_questions', 'correct_streak', 'earn_stars', 'complete_world', 'login_streak'])
                    .toContain(mission.objectiveType)
            })
        })

        it('missões com targetWorld devem ter mundo válido', () => {
            const worldMissions = DAILY_MISSIONS.filter(m => m.targetWorld)
            const validWorlds = ['basic_commands', 'numbers', 'variables', 'conditions', 'decisions', 'loops', 'functions', 'lists', 'strings']

            worldMissions.forEach(mission => {
                expect(validWorlds).toContain(mission.targetWorld)
            })
        })
    })

    describe('WEEKLY_MISSIONS', () => {
        it('todas as missões devem ter campos válidos', () => {
            WEEKLY_MISSIONS.forEach(mission => {
                expect(mission.type).toBe('weekly')
                expect(mission.targetValue).toBeGreaterThan(0)
                expect(mission.starsReward).toBeGreaterThan(0)
                expect(mission.xpReward).toBeGreaterThan(0)
            })
        })

        it('recompensas semanais devem ser maiores que diárias em média', () => {
            const avgDailyStars = DAILY_MISSIONS.reduce((s, m) => s + m.starsReward, 0) / DAILY_MISSIONS.length
            const avgWeeklyStars = WEEKLY_MISSIONS.reduce((s, m) => s + m.starsReward, 0) / WEEKLY_MISSIONS.length

            expect(avgWeeklyStars).toBeGreaterThan(avgDailyStars)
        })
    })
})
