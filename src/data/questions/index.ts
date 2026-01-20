import { basicCommandsQuestions } from './basic_commands.ts';
import { variablesQuestions } from './variables.ts';
import { numbersQuestions } from './numbers.ts';
import { conditionsQuestions } from './conditions.ts';
import { loopsQuestions } from './loops.ts';
import { functionsQuestions } from './functions.ts';
import { listsQuestions } from './lists.ts';
import { stringsQuestions } from './strings.ts';
import { userInputQuestions } from './user_input.ts';
import { dictionariesQuestions } from './dictionaries.ts';
import { errorHandlingQuestions } from './error_handling.ts';
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
    user_input: addBoss(userInputQuestions, 'user_input'),
    dictionaries: addBoss(dictionariesQuestions, 'dictionaries'),
    error_handling: addBoss(errorHandlingQuestions, 'error_handling'),
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
    userInputQuestions,
    dictionariesQuestions,
    errorHandlingQuestions,
};
