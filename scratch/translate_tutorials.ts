import { WORLD_TUTORIALS } from '../src/data/educationContent';
import * as fs from 'fs';
import * as path from 'path';
import { translate } from '@vitalets/google-translate-api';

const __dirname = path.resolve();

async function translateText(text: string, to: string) {
    if (!text) return text;
    try {
        const res = await translate(text, { to });
        return res.text;
    } catch (e) {
        console.error(`Error translating: "${text}"`, e);
        return text;
    }
}

async function run() {
    const langs = ['en', 'es', 'hi'];

    for (const lang of langs) {
        console.log(`\nTranslating for ${lang}...`);
        
        const gameJsonPath = path.join(__dirname, 'src', 'i18n', 'locales', lang, 'game.json');
        const gameJson = JSON.parse(fs.readFileSync(gameJsonPath, 'utf-8'));
        
        if (!gameJson.tutorials) {
            gameJson.tutorials = {};
        }

        for (const tut of WORLD_TUTORIALS) {
            console.log(` Translating world: ${tut.worldId}...`);
            if (!gameJson.tutorials[tut.worldId]) {
                gameJson.tutorials[tut.worldId] = { steps: [] };
            }
            
            const dest = gameJson.tutorials[tut.worldId];
            
            dest.title = await translateText(tut.title, lang);
            
            // Note: skipping description for now since TutorialModal doesn't use it directly inside tutorials.
            // Oh wait, WorldMap could use it. I'll translate it too.
            dest.description = await translateText(tut.description, lang);

            // keyConcepts
            dest.keyConcepts = [];
            for (const c of tut.keyConcepts) {
                dest.keyConcepts.push(await translateText(c, lang));
            }

            // Steps
            dest.steps = [];
            for (let i = 0; i < tut.steps.length; i++) {
                const step = tut.steps[i];
                const destStep: {
                    title: string;
                    content: string;
                    exercise?: {
                        prompt: string;
                    };
                } = {
                    title: await translateText(step.title, lang),
                    content: await translateText(step.content, lang),
                };
                
                if (step.exercise) {
                    destStep.exercise = {
                        prompt: await translateText(step.exercise.prompt, lang)
                    };
                }
                dest.steps.push(destStep);
            }
        }
        
        fs.writeFileSync(gameJsonPath, JSON.stringify(gameJson, null, 4));
        console.log(`Saved ${lang}/game.json`);
    }
}

run().catch(console.error);
