import type { UserPet, PetType, PetMood } from '../types/gamification';

const PET_LEVELS = {
    EGG_HATCH: 2, // Eclode no nível 2
    TEEN: 10,
    ADULT: 25
};

// fallow-ignore-next-line unused-export
export const MAX_HUNGER = 100;
const HUNGER_DECAY_PER_HOUR = 5;
// fallow-ignore-next-line unused-export
export const FEED_RESTORE_AMOUNT = 30;

/**
 * Retorna o estado inicial do pet (Ovo)
 */
export function getInitialPet(): UserPet {
    return {
        name: 'Ovo Misterioso',
        stage: 'egg',
        type: 'generic',
        xp: 0,
        level: 1,
        hunger: 100,
        mood: 'sleeping',
        evolutionPath: {},
        lastFedAt: new Date().toISOString()
    };
}

/**
 * Verifica se o pet deve evoluir com base no histórico de XP
 */
function determineEvolution(evolutionPath: Record<string, number>): PetType {
    // Encontrar o mundo com maior XP
    let maxXP = 0;
    let dominantWorld = 'generic';

    for (const [world, xp] of Object.entries(evolutionPath)) {
        if (xp > maxXP) {
            maxXP = xp;
            dominantWorld = world;
        }
    }

    // Mapeamento de mundos para tipos de pet
    const worldToPet: Record<string, PetType> = {
        loops: 'snake',
        conditions: 'owl',
        turtle: 'chameleon',
        functions: 'robot',
        lists: 'dragon',
        // Default fallbacks
        basic_commands: 'robot',
        numbers: 'owl',
        variables: 'chameleon',
        strings: 'snake',
    };

    return worldToPet[dominantWorld] || 'generic';
}

/**
 * Processa o ganho de XP e possíveis evoluções
 */
export function gainPetXp(pet: UserPet, amount: number, worldId: string): { newPet: UserPet, leveledUp: boolean, evolved: boolean } {
    if (!pet) return { newPet: getInitialPet(), leveledUp: false, evolved: false };

    const newPet = { ...pet };

    // Atualiza evolução path
    newPet.evolutionPath = {
        ...newPet.evolutionPath,
        [worldId]: (newPet.evolutionPath[worldId] || 0) + amount
    };

    newPet.xp += amount;

    // Cálculo simples de nível: Nível = 1 + floor(xp / 50)
    // Ajuste conforme calibração desejada
    const currentLevel = newPet.level;
    const nextLevel = 1 + Math.floor(newPet.xp / 50);

    let leveledUp = false;
    let evolved = false;

    if (nextLevel > currentLevel) {
        newPet.level = nextLevel;
        leveledUp = true;

        // Verifica Mudança de Estágio
        let nextStage = newPet.stage;

        // Regras de evolução
        if (newPet.stage === 'egg' && newPet.level >= PET_LEVELS.EGG_HATCH) {
            nextStage = 'baby';
            newPet.name = 'Mascote Bebê'; // Pode ser personalizado depois
        } else if (newPet.stage === 'baby' && newPet.level >= PET_LEVELS.TEEN) {
            nextStage = 'teen';
        } else if (newPet.stage === 'teen' && newPet.level >= PET_LEVELS.ADULT) {
            nextStage = 'adult';
        }

        if (nextStage !== newPet.stage) {
            newPet.stage = nextStage;
            evolved = true;
            newPet.justEvolved = true;

            // Determina tipo se saiu do ovo ou mudou de estágio
            if (newPet.stage !== 'egg') {
                newPet.type = determineEvolution(newPet.evolutionPath);
            }
        }
    }

    // Atualiza humor se ganhou XP
    newPet.mood = 'excited';

    return { newPet, leveledUp, evolved };
}

/**
 * Alimenta o pet
 */
export function feedPet(pet: UserPet): UserPet {
    if (!pet) return getInitialPet();

    const newHunger = Math.min(MAX_HUNGER, pet.hunger + FEED_RESTORE_AMOUNT);

    return {
        ...pet,
        hunger: newHunger,
        mood: 'happy',
        lastFedAt: new Date().toISOString()
    };
}

/**
 * Atualiza status passivo (fome, humor) baseado no tempo
 */
export function checkPetStatus(pet: UserPet): UserPet {
    if (!pet) return getInitialPet();

    const now = new Date();
    const lastFed = new Date(pet.lastFedAt);
    const hoursSinceFeed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);

    let newHunger = pet.hunger;

    if (hoursSinceFeed > 1) {
        // Deduz fome baseada no tempo
        const hungerLoss = Math.floor(hoursSinceFeed * HUNGER_DECAY_PER_HOUR);
        newHunger = Math.max(0, pet.hunger - hungerLoss);
    }

    let newMood: PetMood = pet.mood;

    // Determina humor baseado na fome e estágio
    if (pet.stage === 'egg') {
        newMood = 'sleeping'; // Ovo sempre dorme
    } else {
        if (newHunger < 20) {
            newMood = 'hungry';
        } else if (newHunger < 50) {
            newMood = 'sad';
        } else if (pet.mood === 'excited' || pet.mood === 'coding') {
            // Mantém humor positivo temporário, a menos que esteja com fome
        } else {
            newMood = 'happy';
        }
    }

    return {
        ...pet,
        hunger: newHunger,
        mood: newMood
    };
}
