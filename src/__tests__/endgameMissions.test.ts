import { describe, it, expect } from 'vitest';
import { recordQuestionLogic } from '../utils/gamificationState';
import type { UserGamification, UserMission } from '../types/gamification';

describe('Endgame Missions Logic', () => {
    const initialState: UserGamification = {
        level: { level: 1, currentXP: 0, totalXP: 0 },
        streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: '', activityHistory: [] },
        achievements: [],
        activeMissions: [],
        inventory: { ownedItems: [], equippedAvatar: '', equippedFrame: '', equippedTitle: '' },
        powerUps: { inventory: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }, usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }, lastResetDate: '' },
        stats: {
            totalQuestionsCompleted: 0,
            totalCorrectAnswers: 0,
            consecutiveCorrect: 0,
            bestConsecutiveCorrect: 0,
            weekendQuestionsCount: 0,
            lastWeekendDate: '',
            totalPlayTime: 0,
            worldsCompleted: 1, // Unlock condition met
            perfectWorlds: 0,
            bossesDefeated: 0,
            consecutiveFastAnswers: 0,
        },
    };

    const createMission = (type: 'speedrun' | 'improve_stars' | 'syntax_master', index: number = 0): UserMission => ({
        missionId: `endgame_${type}_${index}`,
        progress: 0,
        status: 'active',
        expiresAt: new Date(),
    });

    describe('Speedrun Mission', () => {
        it('should increment progress when answered within time limit', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('speedrun')],
            };

            // ENDGAME_MISSIONS[0] is Speedrun with 45s limit
            const { newState } = recordQuestionLogic(state, true, 10, {
                responseTimeSeconds: 30
            });

            const mission = newState.activeMissions.find(m => m.missionId.startsWith('endgame_speedrun'));
            expect(mission?.progress).toBe(1);
        });

        it('should NOT increment progress when answered too slowly', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('speedrun')],
            };

            // Limit is 45s
            const { newState } = recordQuestionLogic(state, true, 10, {
                responseTimeSeconds: 50
            });

            const mission = newState.activeMissions.find(m => m.missionId.startsWith('endgame_speedrun'));
            expect(mission?.progress).toBe(0);
        });
    });

    describe('Improvement (Gabarito) Mission', () => {
        it('should increment progress when starsEarned > 0', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('improve_stars')],
            };

            const { newState } = recordQuestionLogic(state, true, 10, {
                starsEarned: 1,
                previousStars: 1
            });

            const mission = newState.activeMissions.find(m => m.missionId.startsWith('endgame_improve'));
            expect(mission?.progress).toBe(1);
        });

        it('should NOT increment progress when no new stars earned', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('improve_stars')],
            };

            const { newState } = recordQuestionLogic(state, true, 10, {
                starsEarned: 0,
                previousStars: 3
            });

            const mission = newState.activeMissions.find(m => m.missionId.startsWith('endgame_improve'));
            expect(mission?.progress).toBe(0);
        });
    });

    describe('Syntax Master Mission', () => {
        it('should increment progress on correct answer', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('syntax_master')],
            };

            const { newState } = recordQuestionLogic(state, true, 10);

            const mission = newState.activeMissions.find(m => m.missionId.startsWith('endgame_syntax'));
            expect(mission?.progress).toBe(1);
        });

        it('should reset progress on incorrect answer', () => {
            const state = {
                ...initialState,
                activeMissions: [{
                    ...createMission('syntax_master'),
                    progress: 3
                }],
            };

            const { newState } = recordQuestionLogic(state, false, 0);

            const mission = newState.activeMissions.find(m => m.missionId.startsWith('endgame_syntax'));
            expect(mission?.progress).toBe(0);
        });
    });
});
