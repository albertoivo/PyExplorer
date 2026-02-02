import { describe, it, expect } from 'vitest';
import { getInitialPet, gainPetXp, feedPet, checkPetStatus, MAX_HUNGER, FEED_RESTORE_AMOUNT } from '../petLogic';

describe('petLogic', () => {
    it('getInitialPet returns correct defaults', () => {
        const pet = getInitialPet();
        expect(pet.stage).toBe('egg');
        expect(pet.level).toBe(1);
        expect(pet.hunger).toBe(MAX_HUNGER);
        expect(pet.type).toBe('generic');
    });

    it('gainPetXp increases XP and updates evolution path', () => {
        const pet = getInitialPet();
        const { newPet, leveledUp, evolved } = gainPetXp(pet, 10, 'loops');

        expect(newPet.xp).toBe(10);
        expect(newPet.evolutionPath['loops']).toBe(10);
        expect(leveledUp).toBe(false); // 10 XP is not enough for level 2 (need 50)
        expect(evolved).toBe(false);
    });

    it('gainPetXp triggers level up', () => {
        const pet = getInitialPet();
        // Add 60 XP
        const { newPet, leveledUp } = gainPetXp(pet, 60, 'loops');

        // Level = 1 + floor(60/50) = 2.
        expect(newPet.level).toBe(2);
        expect(leveledUp).toBe(true);
    });

    it('gainPetXp triggers evolution from egg to baby', () => {
        const pet = getInitialPet();
        // Egg needs level 2 to hatch (PET_LEVELS.EGG_HATCH = 2)
        // 60 XP -> Level 2.
        const { newPet, evolved } = gainPetXp(pet, 60, 'loops');

        expect(newPet.stage).toBe('baby');
        expect(evolved).toBe(true);
        expect(newPet.justEvolved).toBe(true);
    });

    it('gainPetXp determines evolution type based on dominant world', () => {
        const pet = getInitialPet();
        // Make it teen (Level 10). Need 50 * 9 = 450 XP + 1 = 451 XP.
        // Let's force stats.
        pet.stage = 'baby';
        pet.level = 9;
        pet.xp = 440;
        pet.evolutionPath = {
            'loops': 100,
            'conditions': 300 // Dominant
        };

        // Gain enough to reach Level 10
        const { newPet, evolved } = gainPetXp(pet, 60, 'generic');

        expect(newPet.level).toBe(11); // 440+60 = 500. 1 + 500/50 = 11.
        expect(newPet.stage).toBe('teen');
        expect(evolved).toBe(true);
        expect(newPet.type).toBe('owl'); // conditions -> owl
    });

    it('feedPet restores hunger and sets mood', () => {
        const pet = getInitialPet();
        pet.hunger = 50;
        pet.mood = 'hungry';

        const newPet = feedPet(pet);
        expect(newPet.hunger).toBe(Math.min(MAX_HUNGER, 50 + FEED_RESTORE_AMOUNT));
        expect(newPet.mood).toBe('happy');
    });

    it('checkPetStatus decays hunger over time', () => {
        const pet = getInitialPet();
        pet.hunger = 100;
        // Last fed 2 hours ago
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        pet.lastFedAt = twoHoursAgo;

        const newPet = checkPetStatus(pet);
        // 2 hours * 5 = 10 decay
        expect(newPet.hunger).toBe(90);
    });
});
