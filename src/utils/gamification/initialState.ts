import type {
    UserGamification,
    PowerUpType
} from '../../types/gamification';
import { getLocalDateStr } from '../gamificationUtils';
import { getInitialPet } from '../petLogic';

export function getInitialGamification(): UserGamification {
    return {
        pet: getInitialPet(),
        level: { level: 1, currentXP: 0, totalXP: 0 },
        streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: '',
            activityHistory: [],
        },
        achievements: [],
        activeMissions: [],
        inventory: {
            ownedItems: ['avatar_snake_green', 'frame_basic', 'title_newbie'],
            equippedAvatar: 'avatar_snake_green',
            equippedFrame: 'frame_basic',
            equippedTitle: 'title_newbie',
        },
        powerUps: {
            inventory: { skip: 1, fifty_fifty: 2, extra_hint: 2, double_stars: 1, shield: 0 },
            usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            lastResetDate: getLocalDateStr(),
        },
        stats: {
            totalQuestionsCompleted: 0,
            totalCorrectAnswers: 0,
            consecutiveCorrect: 0,
            bestConsecutiveCorrect: 0,
            weekendQuestionsCount: 0,
            lastWeekendDate: '',
            totalPlayTime: 0,
            worldsCompleted: 0,
            perfectWorlds: 0,
            bossesDefeated: 0,
            consecutiveFastAnswers: 0,
            completedWorldIds: [],
        },
    };
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
    return Math.min(max, Math.max(min, value));
}

export function removePetField(data: UserGamification): UserGamification {
    const { pet, ...legacyData } = data;
    void pet;
    return legacyData as UserGamification;
}

export function normalizeGamificationForRules(data: UserGamification): UserGamification {
    const initial = getInitialGamification();

    const inventory = {
        ownedItems: Array.isArray(data.inventory?.ownedItems) ? data.inventory.ownedItems.slice(0, 1000) : initial.inventory.ownedItems,
        equippedAvatar: typeof data.inventory?.equippedAvatar === 'string' ? data.inventory.equippedAvatar.slice(0, 100) : initial.inventory.equippedAvatar,
        equippedFrame: typeof data.inventory?.equippedFrame === 'string' ? data.inventory.equippedFrame.slice(0, 100) : initial.inventory.equippedFrame,
        equippedTitle: typeof data.inventory?.equippedTitle === 'string' ? data.inventory.equippedTitle.slice(0, 100) : initial.inventory.equippedTitle,
    };

    const powerUpKeys: PowerUpType[] = ['skip', 'fifty_fifty', 'extra_hint', 'double_stars', 'shield'];
    const normalizedPowerUps = {
        inventory: powerUpKeys.reduce((acc, key) => {
            acc[key] = clampNumber(data.powerUps?.inventory?.[key], 0, 999, 0);
            return acc;
        }, {} as Record<PowerUpType, number>),
        usesToday: powerUpKeys.reduce((acc, key) => {
            acc[key] = clampNumber(data.powerUps?.usesToday?.[key], 0, 99, 0);
            return acc;
        }, {} as Record<PowerUpType, number>),
        lastResetDate: typeof data.powerUps?.lastResetDate === 'string'
            ? data.powerUps.lastResetDate.slice(0, 10)
            : initial.powerUps.lastResetDate,
    };

    const normalizedStats = {
        totalQuestionsCompleted: clampNumber(data.stats?.totalQuestionsCompleted, 0, 999999, 0),
        totalCorrectAnswers: clampNumber(data.stats?.totalCorrectAnswers, 0, 999999, 0),
        consecutiveCorrect: clampNumber(data.stats?.consecutiveCorrect, 0, 999999, 0),
        bestConsecutiveCorrect: clampNumber(data.stats?.bestConsecutiveCorrect, 0, 999999, 0),
        weekendQuestionsCount: clampNumber(data.stats?.weekendQuestionsCount, 0, 999999, 0),
        lastWeekendDate: typeof data.stats?.lastWeekendDate === 'string' ? data.stats.lastWeekendDate.slice(0, 10) : '',
        totalPlayTime: clampNumber(data.stats?.totalPlayTime, 0, 999999, 0),
        worldsCompleted: clampNumber(data.stats?.worldsCompleted, 0, 999999, 0),
        perfectWorlds: clampNumber(data.stats?.perfectWorlds, 0, 999999, 0),
        bossesDefeated: clampNumber(data.stats?.bossesDefeated, 0, 999999, 0),
        consecutiveFastAnswers: clampNumber(data.stats?.consecutiveFastAnswers, 0, 999999, 0),
        completedWorldIds: Array.isArray(data.stats?.completedWorldIds) ? data.stats.completedWorldIds.slice(0, 100) : [],
    };

    const normalizedPet = data.pet
        ? {
            name: typeof data.pet.name === 'string' ? data.pet.name.slice(0, 50) : initial.pet?.name || 'PyEvo',
            stage: (['egg', 'baby', 'teen', 'adult'] as const).includes(data.pet.stage) ? data.pet.stage : 'egg',
            type: (['generic', 'snake', 'owl', 'chameleon', 'robot', 'dragon'] as const).includes(data.pet.type) ? data.pet.type : 'generic',
            xp: clampNumber(data.pet.xp, 0, 9999999, 0),
            level: clampNumber(data.pet.level, 1, 9999, 1),
            hunger: clampNumber(data.pet.hunger, 0, 100, 100),
            mood: (['happy', 'sad', 'sleeping', 'hungry', 'coding', 'excited'] as const).includes(data.pet.mood) ? data.pet.mood : 'sleeping',
            evolutionPath: (data.pet.evolutionPath && typeof data.pet.evolutionPath === 'object') ? data.pet.evolutionPath : {},
            lastFedAt: typeof data.pet.lastFedAt === 'string' ? data.pet.lastFedAt.slice(0, 50) : new Date().toISOString(),
            ...(typeof data.pet.justEvolved === 'boolean' ? { justEvolved: data.pet.justEvolved } : {}),
        }
        : undefined;

    return {
        level: {
            level: clampNumber(data.level?.level, 0, 100, initial.level.level),
            currentXP: clampNumber(data.level?.currentXP, 0, 9999999, initial.level.currentXP),
            totalXP: clampNumber(data.level?.totalXP, 0, 9999999, initial.level.totalXP),
        },
        streak: {
            currentStreak: clampNumber(data.streak?.currentStreak, 0, 9999, initial.streak.currentStreak),
            longestStreak: clampNumber(data.streak?.longestStreak, 0, 9999, initial.streak.longestStreak),
            lastActivityDate: typeof data.streak?.lastActivityDate === 'string' ? data.streak.lastActivityDate.slice(0, 10) : initial.streak.lastActivityDate,
            activityHistory: Array.isArray(data.streak?.activityHistory) ? data.streak.activityHistory.slice(0, 50) : initial.streak.activityHistory,
        },
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        activeMissions: Array.isArray(data.activeMissions) ? data.activeMissions.slice(0, 50) : [],
        inventory,
        powerUps: normalizedPowerUps,
        stats: normalizedStats,
        ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
        ...(normalizedPet ? { pet: normalizedPet } : {}),
    };
}
