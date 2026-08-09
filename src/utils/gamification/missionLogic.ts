import type {
    UserGamification,
    LevelInfo,
    Mission
} from '../../types/gamification';
import { getLevelFromXP, ENDGAME_MISSIONS, generateDailyMissions, generateWeeklyMissions } from '../../data/gamificationData';
import { getLocalDateStr } from '../gamificationUtils';

export function checkDailyAndWeeklyReset(data: UserGamification): UserGamification | null {
    const today = new Date();
    const todayStr = getLocalDateStr(today);
    const lastReset = data.powerUps?.lastResetDate;

    const newState = { ...data };
    let hasChanges = false;

    // 1. Reset PowerUps Daily
    if (lastReset !== todayStr) {
        newState.powerUps = {
            ...newState.powerUps,
            usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
            lastResetDate: todayStr
        };
        hasChanges = true;
    }

    // 2. Check Daily Missions
    // Filter existing daily missions that are still valid (created today)
    const validDailyMissions = newState.activeMissions.filter(m => {
        if (m.status === 'claimed') return false; // Remove claimed from previous days? Or keep history?
        // Actually, daily missions expire at end of day. So we should restart if they are from yesterday.
        // Let's assume ID format 'daily_YYYY-MM-DD_index' tells us the date.
        return m.missionId.includes(todayStr);
    });

    const completedWorlds = newState.stats.completedWorldIds || [];

    // Helper to process mission replacement
    const processMissions = (missions: Mission[]) => {
        // Create end-of-day timestamp WITHOUT mutating the outer 'today' variable
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        return missions.map(m => {
            if (m.targetWorld && completedWorlds.includes(m.targetWorld)) {
                // Smart Replacement: Review Mode
                return {
                    progress: 0,
                    status: 'active' as const,
                    expiresAt: new Date(endOfDay),
                    // We flag it as a 'review' mission in metadata if needed,
                    // or just rely on the UI rendering the title from hydration?
                    // Wait, hydration uses the ID to fetch static definition from DATA.
                    // If we want to change Title/Description, we can't do it just by ID unless we have dynamic hydration.
                    // HydrateMissions fetches from generateDailyMissions again.
                    // So we must modify generateDailyMissions? NO, that breaks determinism.

                    // Option B: Store the modified title/description in the UserMission object?
                    // UserMission currently has { missionId, progress, status, ... }.
                    // It does NOT have title/description.

                    // Solution: We need a special 'meta' field in UserMission or a special ID suffix.
                    // Let's use ID suffix: `_review`.
                    // And update hydrateMissions to handle `_review` suffix.
                    missionId: m.id + '_review'
                };
            }
            return {
                missionId: m.id,
                progress: 0,
                status: 'active' as const,
                expiresAt: new Date(endOfDay)
            };
        });
    };

    if (validDailyMissions.length === 0) {
        const newDailies = generateDailyMissions(today);
        const userDailies = processMissions(newDailies);

        // Remove old dailies and add new ones
        newState.activeMissions = [
            ...newState.activeMissions.filter(m => !m.missionId.startsWith('daily_')),
            ...userDailies
        ];
        hasChanges = true;
    }

    // 2.1 Check Endgame Missions Expiry
    // Remove expired endgame missions so they can be regenerated (by useGamification or here)
    const expiredEndgameMissions = newState.activeMissions.filter(m =>
        m.missionId.startsWith('endgame_') &&
        m.expiresAt &&
        new Date(m.expiresAt) < today
    );

    if (expiredEndgameMissions.length > 0) {
        newState.activeMissions = newState.activeMissions.filter(m =>
            !expiredEndgameMissions.includes(m)
        );
        // Note: We don't regenerate immediately here because the logic for generating them
        // is inside useGamification (based on stats check).
        // By removing them, useGamification hook will detect they are missing and add new ones
        // on next effect run (lines 105-130 in useGamification).
        hasChanges = true;
    }

    // 3. Check Weekly Missions
    const getSunday = (d: Date) => {
        const dateCopy = new Date(d);
        const day = dateCopy.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const diff = dateCopy.getDate() - day; // Adjust to Sunday
        dateCopy.setDate(diff);
        return getLocalDateStr(dateCopy); // Return local date string for Sunday
    };
    const currentWeekSunday = getSunday(today);

    const validWeeklyMissions = newState.activeMissions.filter(m => {
        return m.missionId.startsWith(`weekly_${currentWeekSunday}`);
    });

    if (validWeeklyMissions.length === 0) {
        const newWeeklies = generateWeeklyMissions(today);
        // Reuse process logic but adjust expiry
        const userWeeklies = newWeeklies.map(m => {
            const base = processMissions([m])[0]; // reuse logic regarding ID modification
            // Calculate end of week (Saturday 23:59:59)
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Go to Saturday
            endOfWeek.setHours(23, 59, 59, 999); // End of day

            return {
                ...base,
                expiresAt: endOfWeek
            };
        });

        // Remove old weeklies and add new ones
        newState.activeMissions = [
            ...newState.activeMissions.filter(m => !m.missionId.startsWith('weekly_')),
            ...userWeeklies
        ];
        hasChanges = true;
    }

    return hasChanges ? newState : null;
}

// ============================================
// SHOP ACTIONS
// ============================================

export function claimMissionRewardLogic(
    state: UserGamification,
    missionId: string
): { success: boolean, newState: UserGamification, rewards: { xp: number, stars: number }, levelUp: LevelInfo | null } {
    const userMission = state.activeMissions.find(m => m.missionId === missionId);
    if (!userMission || userMission.status === 'claimed') {
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    const today = new Date();
    // Check if the mission has expired
    if (userMission.expiresAt && new Date(userMission.expiresAt) < today) {
        // Optionally, remove the expired mission from activeMissions here
        // For now, just prevent claiming
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    const daily = generateDailyMissions(today);
    const weekly = generateWeeklyMissions(today);
    const allMissions = [...daily, ...weekly, ...ENDGAME_MISSIONS];
    // For endgame missions, the ID might be constructed (e.g. endgame_speedrun_0)
    // We need to find the definition either by exact match or by prefix for static endgame definitions
    // Note: ENDGAME_MISSIONS do not have 'id' property in definitions, so we cast to any or handle specifically
    let missionDef = allMissions.find(m => 'id' in m && m.id === missionId);

    // If not found, try to find in ENDGAME_MISSIONS by title matching (since we construct IDs dynamically)
    if (!missionDef) {
        // Find endgame mission definition by checking if the missionId (from user state) matches the constructed pattern
        missionDef = ENDGAME_MISSIONS.find(m => missionId.startsWith(`endgame_${m.objectiveType}`)) as Mission;
    }

    if (!missionDef) {
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    const { xpReward, starsReward } = missionDef;
    if (xpReward === 0 && starsReward === 0) {
        return { success: false, newState: state, rewards: { xp: 0, stars: 0 }, levelUp: null };
    }

    // Update XP
    const oldLevelInfo = getLevelFromXP(state.level.totalXP);
    const newTotalXP = state.level.totalXP + xpReward;
    const newLevelInfo = getLevelFromXP(newTotalXP);
    const levelUp = newLevelInfo.level > oldLevelInfo.level ? newLevelInfo : null;

    const newState = {
        ...state,
        level: {
            ...state.level,
            totalXP: newTotalXP,
            currentXP: newTotalXP - newLevelInfo.minXP
        },
        activeMissions: state.activeMissions.map(m =>
            m.missionId === missionId
                ? { ...m, status: 'claimed' as const, completedAt: new Date() }
                : m
        )
    };

    return {
        success: true,
        newState,
        rewards: { xp: xpReward, stars: starsReward },
        levelUp
    };
}

export function updateMissionProgress(
    state: UserGamification,
    eventType: 'complete_questions' | 'correct_streak' | 'complete_world' | 'earn_stars' | 'login_streak',
    amount: number = 1,
    metadata?: { worldId?: string }
): { newState: UserGamification, completedMissions: string[], rewards: { stars: number, xp: number }, levelUp: LevelInfo | null } {
    const completedMissions: string[] = [];
    let totalStars = 0;
    let totalXP = 0;

    // Need full mission definitions to check targets
    const today = new Date();
    const daily = generateDailyMissions(today);
    const weekly = generateWeeklyMissions(today);
    // Include Endgame missions for lookup
    const allMissions = [...daily, ...weekly, ...ENDGAME_MISSIONS];

    const newActiveMissions = state.activeMissions.map(userMission => {
        if (userMission.status !== 'active') return userMission;

        // Smart Lookup (duplicate logic from claimMissionRewardLogic)
        let missionDef = allMissions.find(m => 'id' in m && m.id === userMission.missionId);

        if (!missionDef) {
            missionDef = ENDGAME_MISSIONS.find(m => userMission.missionId.startsWith(`endgame_${m.objectiveType}`)) as Mission;
        }
        if (!missionDef) return userMission;

        // Check availability/objective match
        if (missionDef.objectiveType !== eventType) return userMission;

        // Special checks
        if (missionDef.targetWorld && missionDef.targetWorld !== metadata?.worldId) {
            return userMission;
        }

        let newProgress = userMission.progress;
        if (eventType === 'correct_streak') {
            newProgress = amount;
        } else {
            newProgress += amount;
        }

        if (newProgress >= missionDef.targetValue) {
            // AUTO-CLAIM LOGIC
            completedMissions.push(missionDef.title);
            totalStars += missionDef.starsReward;
            totalXP += missionDef.xpReward;

            return {
                ...userMission,
                progress: newProgress, // Keep the progress value at or above target
                status: 'claimed' as const, // AUTO-CLAIMED
                completedAt: new Date()
            };
        }

        return {
            ...userMission,
            progress: newProgress
        };
    });

    // If rewards exist, update state Level/XP
    let finalState = { ...state, activeMissions: newActiveMissions };
    let levelUp: LevelInfo | null = null;

    if (totalXP > 0) {
        const oldLevelInfo = getLevelFromXP(finalState.level.totalXP);
        const newTotalXP = finalState.level.totalXP + totalXP;
        const newLevelInfo = getLevelFromXP(newTotalXP);
        levelUp = newLevelInfo.level > oldLevelInfo.level ? newLevelInfo : null;

        finalState = {
            ...finalState,
            level: {
                ...finalState.level,
                totalXP: newTotalXP,
                currentXP: newTotalXP - newLevelInfo.minXP
            }
        };
    }

    const hasChanges = JSON.stringify(newActiveMissions) !== JSON.stringify(state.activeMissions);

    return {
        newState: hasChanges ? finalState : state,
        completedMissions,
        rewards: { stars: totalStars, xp: totalXP },
        levelUp
    };
}

// ============================================
// QUESTIONS & STATS
// ============================================

/**
 * Ensures endgame missions exist in the user's activeMissions when at least
 * one world has been completed.  Returns the (potentially updated) state and
 * a flag indicating whether any change was made.
 *
 * Pure function — no side-effects.
 */
export function ensureEndgameMissions(
    state: UserGamification
): { newState: UserGamification; changed: boolean } {
    if (state.stats.worldsCompleted < 1) {
        return { newState: state, changed: false };
    }

    const hasEndgameMissions = state.activeMissions.some(m =>
        m.missionId.startsWith('endgame_')
    );

    if (hasEndgameMissions) {
        return { newState: state, changed: false };
    }

    const newMissions = ENDGAME_MISSIONS.map((m, idx) => ({
        ...m,
        id: `endgame_${m.objectiveType}_${idx}`,
    }));

    const newActiveMissions = [
        ...state.activeMissions,
        ...newMissions.map(m => ({
            missionId: m.id,
            progress: 0,
            status: 'active' as const,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })),
    ];

    return {
        newState: { ...state, activeMissions: newActiveMissions },
        changed: true,
    };
}

function processHydration(mission: Mission, originalId: string): Mission {
    if (originalId.endsWith('_review')) {
        return {
            ...mission,
            id: originalId,
            title: `Revisão: ${mission.title}`,
            description: mission.description.replace('Complete', 'Refaça').replace('Acerte', 'Refaça') + ' (Prática)',
            icon: '🔄' // Update icon to show it's a review
        };
    }
    return mission;
}

export function hydrateMissions(activeMissions: UserGamification['activeMissions']): { daily: Mission[], weekly: Mission[] } {
    const daily: Mission[] = [];
    const weekly: Mission[] = [];

    activeMissions.forEach(um => {
        let baseId = um.missionId;
        const isReview = um.missionId.endsWith('_review');
        if (isReview) {
            baseId = um.missionId.replace('_review', '');
        }

        if (baseId.startsWith('daily_')) {
            const parts = baseId.split('_'); // daily, date, index
            if (parts.length === 3) {
                const dateStr = parts[1];
                const reconstructed = generateDailyMissions(new Date(dateStr + 'T12:00:00'));
                const found = reconstructed.find(r => r.id === baseId);
                if (found) daily.push(isReview ? processHydration(found, um.missionId) : found);
            }
        } else if (baseId.startsWith('weekly_')) {
            const parts = baseId.split('_');
            if (parts.length === 3) {
                const dateStr = parts[1];
                const reconstructed = generateWeeklyMissions(new Date(dateStr + 'T12:00:00'));
                const found = reconstructed.find(r => r.id === baseId);
                if (found) weekly.push(isReview ? processHydration(found, um.missionId) : found);
            }
        } else if (baseId.startsWith('endgame_')) {
            // Handle endgame hydration if needed (already static basically)
            // But we need to match the specific endgame mission
            // const typePart = baseId.split('_')[1];
            const found = ENDGAME_MISSIONS.find(m => baseId.startsWith(`endgame_${m.objectiveType}`));
            if (found) {
                const hydrated = { ...found, id: um.missionId } as Mission; // Cast needed as ENDGAME lacks ID
                daily.push(hydrated); // Endgame usually shown in daily or separate list? The UI splits daily/weekly.
                // Ideally endgame is its own category. But for now put in Daily or Weekly based on... choice.
                // Actually the UI currently only shows Daily/Weekly props.
                // We might need to add 'endgame' prop to UI later.
                // For now, let's just push to daily to ensure visibility.
            }
        }
    });

    return { daily, weekly };
}
