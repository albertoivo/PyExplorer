/**
 * Testes para lógica de Streak e Conquistas
 * Testa: cálculo de streak diário, verificação de conquistas
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// ============================================
// FUNÇÕES EXTRAÍDAS DA LÓGICA DE STREAK
// ============================================

interface UserStreak {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string
    activityHistory: string[]
}

/**
 * Calcula o novo streak baseado na última atividade
 * Extraído de useGamification.ts recordDailyActivity
 */
function calculateNewStreak(
    lastActivityDate: string,
    currentStreak: number,
    today: Date
): number {
    const todayStr = today.toISOString().split('T')[0]

    // Se já registrou hoje, não faz nada
    if (lastActivityDate === todayStr) {
        return currentStreak
    }

    // Calcula ontem
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActivityDate === yesterdayStr) {
        // Continuou o streak
        return currentStreak + 1
    } else if (lastActivityDate === '') {
        // Primeira atividade
        return 1
    } else {
        // Perdeu o streak
        return 1
    }
}

/**
 * Atualiza o histórico de atividades
 */
function updateActivityHistory(
    history: string[],
    today: string,
    maxDays: number = 30
): string[] {
    if (history.includes(today)) {
        return history
    }
    return [...history, today].slice(-maxDays)
}

/**
 * Verifica se deve resetar power-ups diários
 */
function shouldResetDailyPowerUps(lastResetDate: string, today: string): boolean {
    return lastResetDate !== today
}

/**
 * Verifica conquistas de streak que devem ser desbloqueadas
 */
function getStreakAchievementsToUnlock(streak: number): string[] {
    const achievements: string[] = []
    if (streak >= 3) achievements.push('streak_3')
    if (streak >= 7) achievements.push('streak_7')
    if (streak >= 30) achievements.push('streak_30')
    if (streak >= 100) achievements.push('streak_100')
    return achievements
}

/**
 * Verifica conquistas de questões que devem ser desbloqueadas
 */
function getQuestionAchievementsToUnlock(
    totalCompleted: number,
    consecutiveCorrect: number
): string[] {
    const achievements: string[] = []

    // Questões completadas
    if (totalCompleted >= 1) achievements.push('first_question')
    if (totalCompleted >= 10) achievements.push('ten_questions')
    if (totalCompleted >= 50) achievements.push('fifty_questions')
    if (totalCompleted >= 100) achievements.push('hundred_questions')

    // Acertos consecutivos
    if (consecutiveCorrect >= 5) achievements.push('perfect_5')
    if (consecutiveCorrect >= 10) achievements.push('perfect_10')
    if (consecutiveCorrect >= 25) achievements.push('perfect_25')

    return achievements
}

describe('Lógica de Streak', () => {
    // ============================================
    // TESTES DE CÁLCULO DE STREAK
    // ============================================
    describe('calculateNewStreak', () => {
        it('primeira atividade deve iniciar streak em 1', () => {
            const today = new Date('2024-01-15')
            const streak = calculateNewStreak('', 0, today)
            expect(streak).toBe(1)
        })

        it('atividade no mesmo dia não deve alterar streak', () => {
            const today = new Date('2024-01-15')
            const streak = calculateNewStreak('2024-01-15', 5, today)
            expect(streak).toBe(5)
        })

        it('atividade no dia seguinte deve incrementar streak', () => {
            const today = new Date('2024-01-15')
            const streak = calculateNewStreak('2024-01-14', 5, today)
            expect(streak).toBe(6)
        })

        it('pular um dia deve resetar streak para 1', () => {
            const today = new Date('2024-01-15')
            const streak = calculateNewStreak('2024-01-13', 10, today)
            expect(streak).toBe(1)
        })

        it('pular vários dias deve resetar streak para 1', () => {
            const today = new Date('2024-01-15')
            const streak = calculateNewStreak('2024-01-01', 100, today)
            expect(streak).toBe(1)
        })

        it('deve funcionar na virada de mês', () => {
            const today = new Date('2024-02-01')
            const streak = calculateNewStreak('2024-01-31', 5, today)
            expect(streak).toBe(6)
        })

        it('deve funcionar na virada de ano', () => {
            const today = new Date('2024-01-01')
            const streak = calculateNewStreak('2023-12-31', 10, today)
            expect(streak).toBe(11)
        })
    })

    // ============================================
    // TESTES DE HISTÓRICO DE ATIVIDADES
    // ============================================
    describe('updateActivityHistory', () => {
        it('deve adicionar nova data ao histórico', () => {
            const history = ['2024-01-01', '2024-01-02']
            const updated = updateActivityHistory(history, '2024-01-03')
            expect(updated).toEqual(['2024-01-01', '2024-01-02', '2024-01-03'])
        })

        it('não deve duplicar data existente', () => {
            const history = ['2024-01-01', '2024-01-02']
            const updated = updateActivityHistory(history, '2024-01-02')
            expect(updated).toEqual(['2024-01-01', '2024-01-02'])
        })

        it('deve manter apenas últimos N dias', () => {
            const history = Array.from({ length: 30 }, (_, i) =>
                `2024-01-${String(i + 1).padStart(2, '0')}`
            )
            const updated = updateActivityHistory(history, '2024-01-31', 30)
            expect(updated.length).toBe(30)
            expect(updated[updated.length - 1]).toBe('2024-01-31')
        })

        it('deve remover datas antigas quando excede limite', () => {
            const history = ['2024-01-01', '2024-01-02', '2024-01-03']
            const updated = updateActivityHistory(history, '2024-01-04', 3)
            expect(updated).toEqual(['2024-01-02', '2024-01-03', '2024-01-04'])
        })

        it('histórico vazio deve funcionar', () => {
            const updated = updateActivityHistory([], '2024-01-01')
            expect(updated).toEqual(['2024-01-01'])
        })
    })

    // ============================================
    // TESTES DE RESET DIÁRIO
    // ============================================
    describe('shouldResetDailyPowerUps', () => {
        it('deve retornar true se data é diferente', () => {
            expect(shouldResetDailyPowerUps('2024-01-14', '2024-01-15')).toBe(true)
        })

        it('deve retornar false se data é igual', () => {
            expect(shouldResetDailyPowerUps('2024-01-15', '2024-01-15')).toBe(false)
        })

        it('deve funcionar na virada de mês', () => {
            expect(shouldResetDailyPowerUps('2024-01-31', '2024-02-01')).toBe(true)
        })
    })
})

describe('Conquistas', () => {
    // ============================================
    // TESTES DE CONQUISTAS DE STREAK
    // ============================================
    describe('getStreakAchievementsToUnlock', () => {
        it('streak 0 não desbloqueia nada', () => {
            expect(getStreakAchievementsToUnlock(0)).toEqual([])
        })

        it('streak 1-2 não desbloqueia nada', () => {
            expect(getStreakAchievementsToUnlock(1)).toEqual([])
            expect(getStreakAchievementsToUnlock(2)).toEqual([])
        })

        it('streak 3 desbloqueia streak_3', () => {
            const achievements = getStreakAchievementsToUnlock(3)
            expect(achievements).toContain('streak_3')
            expect(achievements.length).toBe(1)
        })

        it('streak 7 desbloqueia streak_3 e streak_7', () => {
            const achievements = getStreakAchievementsToUnlock(7)
            expect(achievements).toContain('streak_3')
            expect(achievements).toContain('streak_7')
            expect(achievements.length).toBe(2)
        })

        it('streak 30 desbloqueia até streak_30', () => {
            const achievements = getStreakAchievementsToUnlock(30)
            expect(achievements).toContain('streak_3')
            expect(achievements).toContain('streak_7')
            expect(achievements).toContain('streak_30')
            expect(achievements.length).toBe(3)
        })

        it('streak 100 desbloqueia todas', () => {
            const achievements = getStreakAchievementsToUnlock(100)
            expect(achievements).toContain('streak_3')
            expect(achievements).toContain('streak_7')
            expect(achievements).toContain('streak_30')
            expect(achievements).toContain('streak_100')
            expect(achievements.length).toBe(4)
        })

        it('streak acima de 100 mantém todas', () => {
            const achievements = getStreakAchievementsToUnlock(500)
            expect(achievements.length).toBe(4)
        })
    })

    // ============================================
    // TESTES DE CONQUISTAS DE QUESTÕES
    // ============================================
    describe('getQuestionAchievementsToUnlock', () => {
        it('0 questões não desbloqueia nada', () => {
            expect(getQuestionAchievementsToUnlock(0, 0)).toEqual([])
        })

        it('primeira questão desbloqueia first_question', () => {
            const achievements = getQuestionAchievementsToUnlock(1, 0)
            expect(achievements).toContain('first_question')
        })

        it('10 questões desbloqueia ten_questions', () => {
            const achievements = getQuestionAchievementsToUnlock(10, 0)
            expect(achievements).toContain('first_question')
            expect(achievements).toContain('ten_questions')
        })

        it('50 questões desbloqueia fifty_questions', () => {
            const achievements = getQuestionAchievementsToUnlock(50, 0)
            expect(achievements).toContain('fifty_questions')
        })

        it('100 questões desbloqueia hundred_questions', () => {
            const achievements = getQuestionAchievementsToUnlock(100, 0)
            expect(achievements).toContain('hundred_questions')
        })

        it('5 acertos consecutivos desbloqueia perfect_5', () => {
            const achievements = getQuestionAchievementsToUnlock(0, 5)
            expect(achievements).toContain('perfect_5')
            expect(achievements).not.toContain('perfect_10')
        })

        it('10 acertos consecutivos desbloqueia perfect_5 e perfect_10', () => {
            const achievements = getQuestionAchievementsToUnlock(0, 10)
            expect(achievements).toContain('perfect_5')
            expect(achievements).toContain('perfect_10')
        })

        it('25 acertos consecutivos desbloqueia todas de acertos', () => {
            const achievements = getQuestionAchievementsToUnlock(0, 25)
            expect(achievements).toContain('perfect_5')
            expect(achievements).toContain('perfect_10')
            expect(achievements).toContain('perfect_25')
        })

        it('combinação de questões e acertos funciona', () => {
            const achievements = getQuestionAchievementsToUnlock(50, 10)
            expect(achievements).toContain('first_question')
            expect(achievements).toContain('ten_questions')
            expect(achievements).toContain('fifty_questions')
            expect(achievements).toContain('perfect_5')
            expect(achievements).toContain('perfect_10')
        })
    })

    // ============================================
    // CENÁRIOS COMPLETOS
    // ============================================
    describe('Cenários de Progressão de Conquistas', () => {
        it('jogador iniciante (1 questão, streak 1)', () => {
            const questionAch = getQuestionAchievementsToUnlock(1, 1)
            const streakAch = getStreakAchievementsToUnlock(1)

            expect(questionAch).toEqual(['first_question'])
            expect(streakAch).toEqual([])
        })

        it('jogador casual (15 questões, streak 5)', () => {
            const questionAch = getQuestionAchievementsToUnlock(15, 3)
            const streakAch = getStreakAchievementsToUnlock(5)

            expect(questionAch).toContain('first_question')
            expect(questionAch).toContain('ten_questions')
            expect(questionAch).not.toContain('fifty_questions')
            expect(streakAch).toContain('streak_3')
            expect(streakAch).not.toContain('streak_7')
        })

        it('jogador dedicado (100 questões, streak 30, 25 acertos)', () => {
            const questionAch = getQuestionAchievementsToUnlock(100, 25)
            const streakAch = getStreakAchievementsToUnlock(30)

            // Questões
            expect(questionAch).toContain('first_question')
            expect(questionAch).toContain('ten_questions')
            expect(questionAch).toContain('fifty_questions')
            expect(questionAch).toContain('hundred_questions')

            // Acertos
            expect(questionAch).toContain('perfect_5')
            expect(questionAch).toContain('perfect_10')
            expect(questionAch).toContain('perfect_25')

            // Streak
            expect(streakAch).toContain('streak_3')
            expect(streakAch).toContain('streak_7')
            expect(streakAch).toContain('streak_30')
        })
    })
})

describe('Simulação de Jornada do Usuário', () => {
    it('jornada completa de streak de 7 dias', () => {
        let streak: UserStreak = {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: '',
            activityHistory: [],
        }

        const startDate = new Date('2024-01-01')

        for (let day = 0; day < 7; day++) {
            const today = new Date(startDate)
            today.setDate(today.getDate() + day)
            const todayStr = today.toISOString().split('T')[0]

            const newStreak = calculateNewStreak(
                streak.lastActivityDate,
                streak.currentStreak,
                today
            )

            streak = {
                currentStreak: newStreak,
                longestStreak: Math.max(streak.longestStreak, newStreak),
                lastActivityDate: todayStr,
                activityHistory: updateActivityHistory(streak.activityHistory, todayStr),
            }
        }

        expect(streak.currentStreak).toBe(7)
        expect(streak.longestStreak).toBe(7)
        expect(streak.activityHistory.length).toBe(7)

        const achievements = getStreakAchievementsToUnlock(streak.currentStreak)
        expect(achievements).toContain('streak_3')
        expect(achievements).toContain('streak_7')
    })

    it('jornada com quebra de streak', () => {
        let streak: UserStreak = {
            currentStreak: 5,
            longestStreak: 5,
            lastActivityDate: '2024-01-05',
            activityHistory: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
        }

        // Pula 2 dias (vai de 05 para 08)
        const today = new Date('2024-01-08')
        const todayStr = today.toISOString().split('T')[0]

        const newStreak = calculateNewStreak(
            streak.lastActivityDate,
            streak.currentStreak,
            today
        )

        expect(newStreak).toBe(1) // Reset

        streak = {
            currentStreak: newStreak,
            longestStreak: Math.max(streak.longestStreak, newStreak),
            lastActivityDate: todayStr,
            activityHistory: updateActivityHistory(streak.activityHistory, todayStr),
        }

        expect(streak.longestStreak).toBe(5) // Mantém o melhor
        expect(streak.currentStreak).toBe(1) // Resetou
    })
})
