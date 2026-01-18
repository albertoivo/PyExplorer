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

    const createMission = (type: 'speedrun' | 'improve_stars' | 'syntax_master', index: number = 0, overrides?: Partial<UserMission>): UserMission => ({
        missionId: `endgame_${type}_${index}`,
        progress: 0,
        status: 'active',
        expiresAt: new Date(),
        ...overrides
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

        it('should NOT increment if response time is missing (fallback to 999s)', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('speedrun')],
            };

            const { newState } = recordQuestionLogic(state, true, 10, {
                // no responseTimeSeconds
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

    describe('Edge Cases & Robustness', () => {
        it('should ignore missions that are not active', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('speedrun', 0, { status: 'completed', progress: 3 })],
            };

            const { newState } = recordQuestionLogic(state, true, 10, { responseTimeSeconds: 5 });

            const mission = newState.activeMissions[0];
            expect(mission.progress).toBe(3); // Should not change
            expect(mission.status).toBe('completed');
        });

        it('should handle mission definitions that are not found', () => {
            const state = {
                ...initialState,
                activeMissions: [{
                    missionId: 'endgame_unknown_999',
                    progress: 0,
                    status: 'active',
                    expiresAt: new Date()
                } as UserMission],
            };

            // Should not crash
            const { newState } = recordQuestionLogic(state, true, 10);

            const mission = newState.activeMissions.find(m => m.missionId === 'endgame_unknown_999');
            expect(mission?.progress).toBe(0); // No change
        });

        it('should respect target world restrictions if applicable', () => {
            // Mock a mission with a target world (none of current endgame missions have one, but logic supports it)
            // We can't easily mock the data file here without module mocking,
            // but we can verify the logic branch if we had a mission with targetWorld.
            // Since we rely on real data, we can test that passing a DIFFERENT world doesn't break things
            // for non-restricted missions.

            const state = {
                ...initialState,
                activeMissions: [createMission('speedrun')],
            };

            const { newState } = recordQuestionLogic(state, true, 10, {
                worldId: 'variables',
                responseTimeSeconds: 10
            });

            const mission = newState.activeMissions[0];
            expect(mission.progress).toBe(1); // Should still progress as Speedrun has no targetWorld
        });

        it('should cap progress at target value and mark completed', () => {
            const state = {
                ...initialState,
                activeMissions: [createMission('speedrun')],
            };

            // Speedrun target is 3. Let's simulate 3 steps.
            let currentState = state;

            // 1
            currentState = recordQuestionLogic(currentState, true, 10, { responseTimeSeconds: 10 }).newState;
            expect(currentState.activeMissions[0].progress).toBe(1);
            expect(currentState.activeMissions[0].status).toBe('active');

            // 2
            currentState = recordQuestionLogic(currentState, true, 10, { responseTimeSeconds: 10 }).newState;
            expect(currentState.activeMissions[0].progress).toBe(2);

            // 3 (Auto-Claimed now)
            currentState = recordQuestionLogic(currentState, true, 10, { responseTimeSeconds: 10 }).newState;
            expect(currentState.activeMissions[0].progress).toBe(3);
            expect(currentState.activeMissions[0].status).toBe('claimed'); // Auto-claim sets to 'claimed' directly
            expect(currentState.activeMissions[0].completedAt).toBeDefined();

            // 4 (Overfill)
            currentState = recordQuestionLogic(currentState, true, 10, { responseTimeSeconds: 10 }).newState;
            expect(currentState.activeMissions[0].progress).toBe(3); // Capped
        });
    });
});
