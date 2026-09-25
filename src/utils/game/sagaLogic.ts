import type { World } from '../../types/question';
import type { WorldInfo, SagaInfo } from '../../data/worlds';

export interface SagaStats {
    completed: number;
    total: number;
    percentage: number;
    unlockedCount: number;
}

export function calculateSagaStats(
    sagas: readonly SagaInfo[],
    worlds: readonly WorldInfo[],
    worldProgress: Map<World, { completed: number; total: number }> | undefined,
    isWorldUnlocked: (world: WorldInfo) => boolean
): Map<string, SagaStats> {
    const stats = new Map<string, SagaStats>();

    for (const saga of sagas) {
        let totalSagaQuestions = 0;
        let completedSagaQuestions = 0;
        let unlockedCount = 0;

        for (const worldId of saga.worldIds) {
            const worldObj = worlds.find(w => w.id === worldId);
            if (!worldObj) continue;

            if (isWorldUnlocked(worldObj)) {
                unlockedCount++;
            }

            const status = worldProgress?.get(worldId);
            if (status) {
                totalSagaQuestions += status.total;
                completedSagaQuestions += status.completed;
            }
        }

        const percentage = totalSagaQuestions > 0 ? (completedSagaQuestions / totalSagaQuestions) * 100 : 0;
        stats.set(saga.id, {
            completed: completedSagaQuestions,
            total: totalSagaQuestions,
            percentage,
            unlockedCount,
        });
    }

    return stats;
}
