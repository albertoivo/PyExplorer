import { basicCommandsQuestions } from './basic_commands';
import { variablesQuestions } from './variables';
import { numbersQuestions } from './numbers';
import { conditionsQuestions } from './conditions';
import { loopsQuestions } from './loops';
import { functionsQuestions } from './functions';
import { listsQuestions } from './lists';
import { stringsQuestions } from './strings';
import { BOSS_QUESTIONS } from './bosses';
import type { QuestionDocument } from '../../types/question';

// Helper to add boss to world
const getBossForWorld = (worldId: string) => BOSS_QUESTIONS.find(q => q.world === worldId);

const addBoss = (questions: QuestionDocument[], worldId: string) => {
    const boss = getBossForWorld(worldId);
    return boss ? [...questions, boss] : questions;
};

export const ALL_QUESTIONS_BY_WORLD = {
    basic_commands: addBoss(basicCommandsQuestions, 'basic_commands'),
    variables: addBoss(variablesQuestions, 'variables'),
    numbers: addBoss(numbersQuestions, 'numbers'),
    conditions: addBoss(conditionsQuestions, 'conditions'),
    loops: addBoss(loopsQuestions, 'loops'),
    functions: addBoss(functionsQuestions, 'functions'),
    lists: addBoss(listsQuestions, 'lists'),
    strings: addBoss(stringsQuestions, 'strings'),
};

export const ALL_QUESTIONS: QuestionDocument[] = [
    ...Object.values(ALL_QUESTIONS_BY_WORLD).flat()
];

export {
    basicCommandsQuestions,
    variablesQuestions,
    numbersQuestions,
    conditionsQuestions,
    loopsQuestions,
    functionsQuestions,
    listsQuestions,
    stringsQuestions,
};
