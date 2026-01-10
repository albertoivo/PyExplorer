import {
    initializeTestEnvironment,
    assertSucceeds,
    assertFails,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
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
                email: 'alice@example.com',
                displayName: 'Alice',
                totalScore: 0,
                balance: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                unlockedWorlds: ['basic_commands'],
                streak: 1,
                lastActiveDate: '2026-01-10',
                inventory: [],
                equippedAvatar: 'default',
                avatar: 'default_avatar'
            }));
        });

        it('should deny profile creation with invalid/extra fields', async () => {
            const aliceDb = testEnv.authenticatedContext('alice').firestore();
            await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
                uid: 'alice',
                email: 'alice@example.com',
                displayName: 'Alice',
                hackerField: 'dangerous'
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
            const adminDb = testEnv.authenticatedContext('admin', { email: 'albertoivo@gmail.com' }).firestore();
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

            // No entanto, ainda deve FALHAR se tentarmos ADICIONAR ou MODIFICAR um campo não permitido
            await assertFails(updateDoc(doc(aliceDb, 'users/alice'), {
                forbiddenField: 'not allowed'
            }));
        });
    });
});
