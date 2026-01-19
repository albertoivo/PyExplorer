import {
    initializeTestEnvironment,
    assertSucceeds,
    assertFails,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'pyexplorer-test';

describe('Firestore security rules', () => {
    let testEnv: RulesTestEnvironment;

    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                rules: readFileSync('firestore.rules', 'utf8'),
                host: '127.0.0.1',
                port: 8080,
            },
        });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
    });

    // --- USERS COLLECTION ---
    describe('users collection', () => {
        it('should allow a user to read their own profile', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users/alice'), {
                    uid: 'alice',
                    displayName: 'Alice',
                    email: 'alice@example.com'
                });
            });
            await assertSucceeds(getDoc(doc(aliceDb, 'users/alice')));
        });

        it('should deny a user from reading another user profile', async () => {
            const bobDb = testEnv.authenticatedContext('bob').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users/alice'), {
                    uid: 'alice'
                });
            });
            await assertFails(getDoc(doc(bobDb, 'users/alice')));
        });

        it('should allow a user to create their initial profile with valid fields', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                email: 'alice@example.com',
                extraField: 'any value is fine now'
            }));
        });

        it('should DENY creating user with negative totalScore', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                email: 'alice@example.com',
                totalScore: -100
            }));
        });

        it('should DENY creating user with negative balance', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                email: 'alice@example.com',
                balance: -50
            }));
        });

        it('should DENY creating user with streak > 9999', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                email: 'alice@example.com',
                streak: 10000
            }));
        });

        it('should ALLOW creating user with valid numeric limits', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                email: 'alice@example.com',
                totalScore: 9999999,
                balance: 1000,
                streak: 9999
            }));
        });

        it('should DENY creating user with displayName > 50 chars', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'A'.repeat(51),
                email: 'alice@example.com'
            }));
        });

        it('should ALLOW creating user with valid unlockedWorlds list', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                unlockedWorlds: ['world1', 'world2']
            }));
        });

        it('should DENY creating user with invalid unlockedWorlds type', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                displayName: 'Alice',
                unlockedWorlds: 'not a list'
            }));
        });
    });

    // --- QUESTIONS COLLECTION ---
    describe('questions collection', () => {
        it('should allow public read access to questions', async () => {
            const unauthDb = testEnv.unauthenticatedContext().firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'questions/q1'), { title: 'Test Question' });
            });
            await assertSucceeds(getDoc(doc(unauthDb, 'questions/q1')));
        });

        it('should deny non-admin write access to questions', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'questions/q1'), { title: 'Hacked' }));
        });

        it('should allow admin write access to questions', async () => {
            const adminDb = testEnv.authenticatedContext('admin', {
                email: 'albertoivo@gmail.com',
                email_verified: true
            }).firestore();
            await assertSucceeds(setDoc(doc(adminDb, 'questions/q1'), { title: 'Admin Question' }));
        });
    });

    // --- USER PROGRESS COLLECTION ---
    describe('userProgress collection', () => {
        it('should allow owner to read their progress', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'userProgress/alice_q1'), {
                    uid: 'alice',
                    questionId: 'q1'
                });
            });
            await assertSucceeds(getDoc(doc(aliceDb, 'userProgress/alice_q1')));
        });

        it('should allow owner to create their progress with valid data', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                attempts: 1
            }));
        });

        it('should DENY writing to a progress ID that does not match the user UID (IDOR)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            // Alice tries to overwrite Bob's progress (ID starts with bob_)
            // but puts her own UID in the data to satisfy the content check
            await assertFails(setDoc(doc(aliceDb, 'userProgress/bob_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                attempts: 1
            }));
        });

        it('should DENY creating progress with invalid status', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'invalid_status', // Inválido
                score: 10,
                attempts: 1
            }));
        });

        it('should DENY creating progress with invalid score (too high)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10000, // > 9999
                attempts: 1
            }));
        });

        it('should DENY creating progress with invalid score (negative)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: -1, // < 0
                attempts: 1
            }));
        });

        it('should deny reading another users progress', async () => {
            const bobDb = testEnv.authenticatedContext('bob').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'userProgress/alice_q1'), {
                    uid: 'alice'
                });
            });

            // Agora deve FALHAR (antes passava porque era isAuthenticated())
            await assertFails(getDoc(doc(bobDb, 'userProgress/alice_q1')));
        });

        it('should DENY creating progress with invalid attempts (negative)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                attempts: -1 // < 0
            }));
        });

        it('should DENY creating progress with invalid attempts (too high)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                attempts: 10000 // > 9999
            }));
        });

        it('should ALLOW creating progress with valid stars (0-3)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                stars: 3 // Válido
            }));
        });

        it('should DENY creating progress with invalid stars (negative)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                stars: -1 // Inválido
            }));
        });

        it('should DENY creating progress with invalid stars (too high)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'userProgress/alice_q1'), {
                uid: 'alice',
                questionId: 'q1',
                status: 'completed',
                score: 10,
                stars: 4 // Inválido (> 3)
            }));
        });
    });

    // --- GAMIFICATION COLLECTION ---
    describe('gamification collection', () => {
        // Objeto válido padrão para testes
        const validGamification = {
            level: { level: 3, currentXP: 50, totalXP: 150 },
            streak: { currentStreak: 5 }
        };

        it('should allow owner to read their gamification data', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'gamification/alice'), validGamification);
            });
            await assertSucceeds(getDoc(doc(aliceDb, 'gamification/alice')));
        });

        it('should allow owner to write their gamification data with correct structure', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'gamification/alice'), validGamification));
        });

        it('should deny non-owner from reading gamification data', async () => {
            const bobDb = testEnv.authenticatedContext('bob').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'gamification/alice'), validGamification);
            });
            await assertFails(getDoc(doc(bobDb, 'gamification/alice')));
        });

        it('should deny non-owner from writing gamification data', async () => {
            const bobDb = testEnv.authenticatedContext('bob').firestore();
            await assertFails(setDoc(doc(bobDb, 'gamification/alice'), validGamification));
        });

        it('should DENY writing gamification with level.level > 100', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'gamification/alice'), {
                ...validGamification,
                level: { ...validGamification.level, level: 101 }
            }));
        });

        it('should DENY writing gamification with streak.currentStreak > 9999', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'gamification/alice'), {
                ...validGamification,
                streak: { currentStreak: 10000 }
            }));
        });

        it('should DENY writing gamification with level.totalXP > 9999999', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'gamification/alice'), {
                ...validGamification,
                level: { ...validGamification.level, totalXP: 10000000 }
            }));
        });

        it('should DENY writing gamification with negative values in level', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'gamification/alice'), {
                ...validGamification,
                level: { ...validGamification.level, level: -1 }
            }));
        });

        it('should ALLOW writing gamification with valid numeric limits', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'gamification/alice'), {
                level: { level: 100, currentXP: 9999999, totalXP: 9999999 },
                streak: { currentStreak: 9999 }
            }));
        });

        it('should DENY writing gamification with wrong root type (number instead of object)', async () => {
             const aliceDb = testEnv.authenticatedContext('alice').firestore();
             await assertFails(setDoc(doc(aliceDb, 'gamification/alice'), {
                 level: 5, // Old structure (Number)
                 streak: 10
             }));
        });
    });

    // --- LEADERBOARD COLLECTION ---
    describe('leaderboard collection', () => {
        it('should allow keys authenticated user to read any leaderboard entry', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'leaderboard/bob'), {
                    name: 'Bob',
                    score: 500
                });
            });
            await assertSucceeds(getDoc(doc(aliceDb, 'leaderboard/bob')));
        });

        it('should allow owner to write their leaderboard entry', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertSucceeds(setDoc(doc(aliceDb, 'leaderboard/alice'), {
                name: 'Alice',
                totalScore: 1000
            }));
        });

        it('should DENY writing leaderboard entry with excessive score', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'leaderboard/alice'), {
                name: 'Alice',
                totalScore: 10000000 // > 9999999
            }));
        });

        it('should deny non-owner from writing to another users leaderboard entry', async () => {
            const bobDb = testEnv.authenticatedContext('bob').firestore();
            await assertFails(setDoc(doc(bobDb, 'leaderboard/alice'), {
                name: 'Hacked',
                score: 9999
            }));
        });
    });

    // --- LEGACY DATA REPRODUCTION ---
    describe('legacy data issues', () => {
        it('should ALLOW update if an extra field exists in DB (robustness fix)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();

            // Simular dado legado no DB (que tem um campo extra não permitido)
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users/alice'), {
                    uid: 'alice',
                    displayName: 'Alice',
                    email: 'alice@example.com',
                    legacyField: 'old stuff'
                });
            });

            // Tentar atualizar um campo válido (ex: balance) usando updateDoc
            // Agora deve FUNCIONAR porque usamos diff().affectedKeys()
            await assertSucceeds(updateDoc(doc(aliceDb, 'users/alice'), {
                balance: 100,
                updatedAt: new Date()
            }));

            // Agora deve FUNCIONAR se tentarmos ADICIONAR ou MODIFICAR um campo não permitido
            // (pois removemos a validação estrita para garantir robustez)
            await assertSucceeds(updateDoc(doc(aliceDb, 'users/alice'), {
                forbiddenField: 'not allowed'
            }));
        });

        it('should ALLOW update if an extra field exists in DB and in request (permissive mode)', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();

            // Simular dado legado no DB
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await setDoc(doc(context.firestore(), 'users/alice'), {
                    uid: 'alice',
                    displayName: 'Alice',
                    email: 'alice@example.com',
                    legacyField: 'old stuff'
                });
            });

            const fullDataWithLegacy = {
                uid: 'alice',
                displayName: 'Alice Updated',
                email: 'alice@example.com',
                legacyField: 'old stuff',
                updatedAt: new Date()
            };

            // Agora deve FUNCIONAR com as novas regras simplificadas
            await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), fullDataWithLegacy, { merge: true }));
        });
    });
});
