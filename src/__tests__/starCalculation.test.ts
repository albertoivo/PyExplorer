import { describe, it, expect } from 'vitest';
import { calculateStars, mergeStars, TIME_LIMITS } from '../utils/starCalculation';

describe('calculateStars', () => {
    describe('3 estrelas (perfeito)', () => {
        it('deve dar 3 estrelas: 1ª tentativa + tempo dentro do limite (easy)', () => {
            expect(calculateStars(true, 1, 20, 'easy')).toBe(3);
            expect(calculateStars(true, 1, 25, 'easy')).toBe(3); // exatamente no limite
        });

        it('deve dar 3 estrelas: 1ª tentativa + tempo dentro do limite (medium)', () => {
            expect(calculateStars(true, 1, 30, 'medium')).toBe(3);
            expect(calculateStars(true, 1, 45, 'medium')).toBe(3);
        });

        it('deve dar 3 estrelas: 1ª tentativa + tempo dentro do limite (hard)', () => {
            expect(calculateStars(true, 1, 60, 'hard')).toBe(3);
            expect(calculateStars(true, 1, 90, 'hard')).toBe(3);
        });
    });

    describe('2 estrelas (1ª tentativa, mas devagar)', () => {
        it('deve dar 2 estrelas: 1ª tentativa + tempo acima do limite', () => {
            expect(calculateStars(true, 1, 26, 'easy')).toBe(2);
            expect(calculateStars(true, 1, 46, 'medium')).toBe(2);
            expect(calculateStars(true, 1, 91, 'hard')).toBe(2);
        });

        it('deve dar 2 estrelas mesmo com tempo muito alto na 1ª tentativa', () => {
            expect(calculateStars(true, 1, 999, 'easy')).toBe(2);
        });
    });

    describe('1 estrela (múltiplas tentativas)', () => {
        it('deve dar 1 estrela: 2 tentativas', () => {
            expect(calculateStars(true, 2, 10, 'easy')).toBe(1);
            expect(calculateStars(true, 2, 10, 'hard')).toBe(1);
        });

        it('deve dar 1 estrela: muitas tentativas', () => {
            expect(calculateStars(true, 10, 5, 'easy')).toBe(1);
        });

        it('deve dar 1 estrela mesmo sendo rápido em múltiplas tentativas', () => {
            expect(calculateStars(true, 3, 10, 'easy')).toBe(1);
        });
    });

    describe('0 estrelas (não passou)', () => {
        it('deve dar 0 estrelas se não passou', () => {
            expect(calculateStars(false, 1, 10, 'easy')).toBe(0);
            expect(calculateStars(false, 5, 10, 'hard')).toBe(0);
        });
    });

    describe('TIME_LIMITS', () => {
        it('deve ter limites corretos por dificuldade', () => {
            expect(TIME_LIMITS.easy).toBe(25);
            expect(TIME_LIMITS.medium).toBe(45);
            expect(TIME_LIMITS.hard).toBe(90);
        });
    });
});

describe('mergeStars', () => {
    it('deve manter o maior valor', () => {
        expect(mergeStars(0, 3)).toBe(3);
        expect(mergeStars(3, 1)).toBe(3);
        expect(mergeStars(2, 2)).toBe(2);
    });

    it('estrelas nunca diminuem', () => {
        expect(mergeStars(3, 0)).toBe(3);
        expect(mergeStars(2, 1)).toBe(2);
    });
});
