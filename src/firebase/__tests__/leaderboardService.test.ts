
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTopUsers, saveUser, updateUserScore } from '../firestore';
import { collection, setDoc, getDocs } from 'firebase/firestore';

// Mock do Firebase
vi.mock('../firebaseConfig', () => ({
    db: {},
    auth: { currentUser: { uid: 'test-user-id' } }
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    deleteField: vi.fn(),
    Timestamp: {
        now: () => ({ toDate: () => new Date() }),
        fromDate: (date: Date) => ({ toDate: () => date })
    }
}));

// Mock do UserData
const mockUser = {
    uid: 'user123',
    displayName: 'Test User',
    avatar: 'avatar-url',
    email: 'test@example.com',
    totalScore: 100,
    balance: 50,
    createdAt: { toDate: () => new Date() },
    updatedAt: { toDate: () => new Date() },
    unlockedWorlds: ['basic_commands']
};

describe('Leaderboard Security Services', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getTopUsers should query the PUBLIC "leaderboard" collection, NOT "users"', async () => {
        // Mock getDocs response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getDocs as any).mockResolvedValue({
            docs: [
                {
                    id: 'user1',
                    data: () => ({
                        displayName: 'Player 1',
                        avatar: 'avatar1',
                        totalScore: 500
                    })
                }
            ]
        });

        await getTopUsers(10);

        // Verifica se collection foi chamado com 'leaderboard'
        expect(collection).toHaveBeenCalledWith(expect.anything(), 'leaderboard');
        // NÃO deve chamar com 'users'
        expect(collection).not.toHaveBeenCalledWith(expect.anything(), 'users');
    });

    it('saveUser should sync data to "leaderboard" collection', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await saveUser(mockUser as any);

        // Deve chamar setDoc duas vezes: uma para users e outra para leaderboard
        expect(setDoc).toHaveBeenCalledTimes(2);

        // Verifica a chamada para o leaderboard (segunda chamada ou verifica argumentos)
        // Como o mock do doc não retorna caminhos, verificaremos se setDoc foi chamado com dados filtrados
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const calls = (setDoc as any).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaderboardCall = calls.find((call: any[]) =>
            call[1].email === undefined && // Não deve ter email
            call[1].displayName === 'Test User' &&
            call[1].totalScore === 100
        );

        expect(leaderboardCall).toBeDefined();
        expect(leaderboardCall[1]).not.toHaveProperty('email');
    });

    it('updateUserScore should also update leaderboard', async () => {
        // Mock getUser response
        const { getDoc } = await import('firebase/firestore');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getDoc as any).mockResolvedValue({
            exists: () => true,
            id: 'user123',
            data: () => mockUser
        });

        await updateUserScore('user123', 50);

        // Deve atualizar score na coleção users e no leaderboard
        expect(setDoc).toHaveBeenCalledTimes(2);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setDocCalls = (setDoc as any).mock.calls;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaderboardUpdate = setDocCalls.find((call: any[]) =>
            call[1].totalScore === 150 // Score original (100) + 50
        );
        expect(leaderboardUpdate).toBeDefined();
    });
});
