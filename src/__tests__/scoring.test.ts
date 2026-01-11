/**
 * Testes para lógica de cálculo de pontuação
 * Testa: cálculo de score, adicional de pontos, progressão
 */
import { describe, it, expect } from 'vitest'

/**
 * Função extraída da lógica de recordAttempt em useProgress.ts
 * Calcula o score adicional ganho em uma tentativa
 */
function calculateAdditionalScore(
    passed: boolean,
    newScore: number,
    existingScore: number = 0
): number {
    if (!passed) return 0
    if (newScore <= existingScore) return 0
    return newScore - existingScore
}

/**
 * Função extraída da lógica de recordAttempt
 * Calcula o novo score após uma tentativa
 */
function calculateNewScore(
    passed: boolean,
    attemptScore: number,
    existingScore: number = 0
): number {
    if (!passed) return existingScore
    return Math.max(existingScore, attemptScore)
}

/**
 * Função para calcular estrelas baseado na dificuldade e tentativas
 */
function calculateStarsForQuestion(
    difficulty: 'easy' | 'medium' | 'hard',
    attempts: number,
    basePoints: number = 10
): number {
    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
    }

    // Penalidade por tentativas extras (máximo de 50% de penalidade)
    const attemptPenalty = Math.min(0.5, (attempts - 1) * 0.1)
    const multiplier = difficultyMultiplier[difficulty] * (1 - attemptPenalty)

    return Math.round(basePoints * multiplier)
}

describe('Cálculo de Pontuação', () => {
    // ============================================
    // TESTES DE SCORE ADICIONAL
    // ============================================
    describe('calculateAdditionalScore', () => {
        it('deve retornar 0 se não passou', () => {
            expect(calculateAdditionalScore(false, 10, 0)).toBe(0)
            expect(calculateAdditionalScore(false, 100, 50)).toBe(0)
        })

        it('deve retornar diferença se passou e score é maior', () => {
            expect(calculateAdditionalScore(true, 10, 0)).toBe(10)
            expect(calculateAdditionalScore(true, 100, 50)).toBe(50)
            expect(calculateAdditionalScore(true, 25, 20)).toBe(5)
        })

        it('deve retornar 0 se passou mas score não é maior', () => {
            expect(calculateAdditionalScore(true, 10, 10)).toBe(0)
            expect(calculateAdditionalScore(true, 10, 15)).toBe(0)
            expect(calculateAdditionalScore(true, 0, 0)).toBe(0)
        })

        it('deve funcionar sem score existente', () => {
            expect(calculateAdditionalScore(true, 10)).toBe(10)
            expect(calculateAdditionalScore(false, 10)).toBe(0)
        })
    })

    // ============================================
    // TESTES DE NOVO SCORE
    // ============================================
    describe('calculateNewScore', () => {
        it('deve manter score existente se não passou', () => {
            expect(calculateNewScore(false, 10, 5)).toBe(5)
            expect(calculateNewScore(false, 100, 50)).toBe(50)
        })

        it('deve retornar maior valor se passou', () => {
            expect(calculateNewScore(true, 10, 5)).toBe(10)
            expect(calculateNewScore(true, 5, 10)).toBe(10)
            expect(calculateNewScore(true, 10, 10)).toBe(10)
        })

        it('deve funcionar sem score existente', () => {
            expect(calculateNewScore(true, 10)).toBe(10)
            expect(calculateNewScore(false, 10)).toBe(0)
        })

        it('deve sempre retornar 0 ou mais', () => {
            expect(calculateNewScore(true, 0, 0)).toBe(0)
            expect(calculateNewScore(false, 0, 0)).toBe(0)
        })
    })

    // ============================================
    // TESTES DE ESTRELAS POR QUESTÃO
    // ============================================
    describe('calculateStarsForQuestion', () => {
        it('questão fácil na primeira tentativa deve dar pontos base', () => {
            expect(calculateStarsForQuestion('easy', 1, 10)).toBe(10)
        })

        it('questão média deve dar 1.5x mais pontos', () => {
            expect(calculateStarsForQuestion('medium', 1, 10)).toBe(15)
        })

        it('questão difícil deve dar 2x mais pontos', () => {
            expect(calculateStarsForQuestion('hard', 1, 10)).toBe(20)
        })

        it('mais tentativas devem reduzir pontos', () => {
            const firstAttempt = calculateStarsForQuestion('easy', 1, 10)
            const secondAttempt = calculateStarsForQuestion('easy', 2, 10)
            const thirdAttempt = calculateStarsForQuestion('easy', 3, 10)

            expect(secondAttempt).toBeLessThan(firstAttempt)
            expect(thirdAttempt).toBeLessThan(secondAttempt)
        })

        it('penalidade máxima deve ser 50%', () => {
            const firstAttempt = calculateStarsForQuestion('easy', 1, 10)
            const manyAttempts = calculateStarsForQuestion('easy', 10, 10)

            expect(manyAttempts).toBeGreaterThanOrEqual(firstAttempt * 0.5)
        })

        it('deve arredondar para inteiro', () => {
            const result = calculateStarsForQuestion('medium', 2, 10)
            expect(Number.isInteger(result)).toBe(true)
        })
    })

    // ============================================
    // CENÁRIOS DE PROGRESSÃO
    // ============================================
    describe('Cenários de Progressão', () => {
        it('primeiro acerto deve dar pontuação completa', () => {
            const score = 15
            const additional = calculateAdditionalScore(true, score, 0)
            expect(additional).toBe(15)
        })

        it('melhorar score deve dar diferença', () => {
            const existingScore = 10
            const newAttemptScore = 15
            const additional = calculateAdditionalScore(true, newAttemptScore, existingScore)
            expect(additional).toBe(5)
        })

        it('não melhorar score não deve dar pontos extras', () => {
            const existingScore = 15
            const newAttemptScore = 12
            const additional = calculateAdditionalScore(true, newAttemptScore, existingScore)
            expect(additional).toBe(0)

            const newScore = calculateNewScore(true, newAttemptScore, existingScore)
            expect(newScore).toBe(15) // Mantém o maior
        })

        it('errar após acertar deve manter score', () => {
            const currentScore = 20

            // Erra a questão
            const newScore = calculateNewScore(false, 0, currentScore)
            expect(newScore).toBe(20) // Mantém

            const additional = calculateAdditionalScore(false, 0, currentScore)
            expect(additional).toBe(0) // Não ganha nada
        })

        it('simulação de múltiplas tentativas', () => {
            let totalScore = 0
            let questionScore = 0

            // Tentativa 1: erra
            questionScore = calculateNewScore(false, 0, questionScore)
            totalScore += calculateAdditionalScore(false, 0, questionScore)
            expect(questionScore).toBe(0)
            expect(totalScore).toBe(0)

            // Tentativa 2: acerta com 10
            const attempt2Score = 10
            totalScore += calculateAdditionalScore(true, attempt2Score, questionScore)
            questionScore = calculateNewScore(true, attempt2Score, questionScore)
            expect(questionScore).toBe(10)
            expect(totalScore).toBe(10)

            // Tentativa 3: acerta com 15 (melhorou)
            const attempt3Score = 15
            totalScore += calculateAdditionalScore(true, attempt3Score, questionScore)
            questionScore = calculateNewScore(true, attempt3Score, questionScore)
            expect(questionScore).toBe(15)
            expect(totalScore).toBe(15)

            // Tentativa 4: acerta com 12 (não melhorou)
            const attempt4Score = 12
            totalScore += calculateAdditionalScore(true, attempt4Score, questionScore)
            questionScore = calculateNewScore(true, attempt4Score, questionScore)
            expect(questionScore).toBe(15) // Mantém
            expect(totalScore).toBe(15) // Não aumenta
        })
    })

    // ============================================
    // TESTES DE REFAZER QUESTÃO (modo prática)
    // ============================================
    describe('Refazer Questão Completada (modo prática)', () => {
        /**
         * Simula a lógica de recordAttempt em useProgress.ts
         * wasAlreadyCompleted impede ganho de pontos ao refazer
         */
        function calculateAdditionalScoreWithCompletionCheck(
            passed: boolean,
            newScore: number,
            existingScore: number,
            wasAlreadyCompleted: boolean
        ): number {
            // Se já estava completed, NÃO adiciona pontos (refazer é só prática)
            if (wasAlreadyCompleted) return 0
            if (!passed) return 0
            if (newScore <= existingScore) return 0
            return newScore - existingScore
        }

        it('NÃO deve dar pontos ao refazer questão já completada', () => {
            const existingScore = 15
            const wasAlreadyCompleted = true
            const newAttemptScore = 20 // Mesmo sendo maior, não deve dar pontos

            const additional = calculateAdditionalScoreWithCompletionCheck(
                true,
                newAttemptScore,
                existingScore,
                wasAlreadyCompleted
            )

            expect(additional).toBe(0)
        })

        it('DEVE dar pontos na primeira conclusão', () => {
            const existingScore = 0
            const wasAlreadyCompleted = false
            const newAttemptScore = 15

            const additional = calculateAdditionalScoreWithCompletionCheck(
                true,
                newAttemptScore,
                existingScore,
                wasAlreadyCompleted
            )

            expect(additional).toBe(15)
        })

        it('DEVE dar pontos ao melhorar score antes de completar', () => {
            const existingScore = 10 // status: in_progress
            const wasAlreadyCompleted = false
            const newAttemptScore = 20

            const additional = calculateAdditionalScoreWithCompletionCheck(
                true,
                newAttemptScore,
                existingScore,
                wasAlreadyCompleted
            )

            expect(additional).toBe(10) // Diferença
        })

        it('NÃO deve dar pontos ao errar após ter completado', () => {
            const existingScore = 15
            const wasAlreadyCompleted = true // Já tinha completado antes

            const additional = calculateAdditionalScoreWithCompletionCheck(
                false, // Errou
                0,
                existingScore,
                wasAlreadyCompleted
            )

            expect(additional).toBe(0)
        })

        it('simulação completa: completar, refazer, não ganhar pontos', () => {
            let totalScore = 0
            let questionScore = 0
            let status = 'not_started'

            // Passo 1: Primeira tentativa - acerta com 15 pontos
            const wasCompleted1 = status === 'completed'
            const attempt1Score = 15
            const additional1 = calculateAdditionalScoreWithCompletionCheck(
                true,
                attempt1Score,
                questionScore,
                wasCompleted1
            )
            questionScore = Math.max(questionScore, attempt1Score)
            totalScore += additional1
            status = 'completed'

            expect(additional1).toBe(15)
            expect(totalScore).toBe(15)

            // Passo 2: Refaz a questão (já completed) - acerta com 20 pontos
            const wasCompleted2 = status === 'completed'
            const attempt2Score = 20
            const additional2 = calculateAdditionalScoreWithCompletionCheck(
                true,
                attempt2Score,
                questionScore,
                wasCompleted2
            )
            questionScore = Math.max(questionScore, attempt2Score)
            totalScore += additional2

            expect(additional2).toBe(0) // NÃO ganha pontos
            expect(totalScore).toBe(15) // Total permanece 15
            expect(questionScore).toBe(20) // Mas o questionScore pode atualizar se quisermos
        })
    })

    // ============================================
    // EDGE CASES
    // ============================================
    describe('Edge Cases', () => {
        it('score zero deve ser tratado corretamente', () => {
            expect(calculateAdditionalScore(true, 0, 0)).toBe(0)
            expect(calculateNewScore(true, 0, 0)).toBe(0)
        })

        it('scores muito altos devem funcionar', () => {
            expect(calculateAdditionalScore(true, 10000, 5000)).toBe(5000)
            expect(calculateNewScore(true, 10000, 5000)).toBe(10000)
        })

        it('valores decimais em calculateStarsForQuestion', () => {
            const result = calculateStarsForQuestion('medium', 3, 7)
            expect(Number.isInteger(result)).toBe(true)
            expect(result).toBeGreaterThan(0)
        })
    })
})
