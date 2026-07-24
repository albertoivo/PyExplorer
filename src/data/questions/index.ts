import { basicCommandsQuestions } from './basic_commands';
import { variablesQuestions } from './variables';
import { numbersQuestions } from './numbers';
import { conditionsQuestions } from './conditions';
import { loopsQuestions } from './loops';
import { functionsQuestions } from './functions';
import { listsQuestions } from './lists';
import { stringsQuestions } from './strings';
import { userInputQuestions } from './user_input';
import { dictionariesQuestions } from './dictionaries';
import { errorHandlingQuestions } from './error_handling';
import { filesQuestions } from './files';
import { modulesQuestions } from './modules';
import { oopBasicsQuestions } from './oop_basics';
import { pythonicQuestions } from './pythonic';
import { turtleArtQuestions } from './turtle_art';
import { dataScienceQuestions } from './data_science';
import { webApiQuestions } from './web_api';
import { BOSS_QUESTIONS } from './bosses';
import type { QuestionDocument } from '../../types/question';

// Helper to add boss to world
const getBossForWorld = (worldId: string) => BOSS_QUESTIONS.find(q => q.world === worldId);

const addBoss = (questions: QuestionDocument[], worldId: string) => {
    const boss = getBossForWorld(worldId);
    return boss ? [...questions, boss] : questions;
};

const ALL_QUESTIONS_BY_WORLD = {
    basic_commands: addBoss(basicCommandsQuestions, 'basic_commands'),
    variables: addBoss(variablesQuestions, 'variables'),
    user_input: addBoss(userInputQuestions, 'user_input'),
    numbers: addBoss(numbersQuestions, 'numbers'),
    conditions: addBoss(conditionsQuestions, 'conditions'),
    loops: addBoss(loopsQuestions, 'loops'),
    strings: addBoss(stringsQuestions, 'strings'),
    lists: addBoss(listsQuestions, 'lists'),
    dictionaries: addBoss(dictionariesQuestions, 'dictionaries'),
    functions: addBoss(functionsQuestions, 'functions'),
    error_handling: addBoss(errorHandlingQuestions, 'error_handling'),
    files: addBoss(filesQuestions, 'files'),
    modules: addBoss(modulesQuestions, 'modules'),
    oop_basics: addBoss(oopBasicsQuestions, 'oop_basics'),
    pythonic: addBoss(pythonicQuestions, 'pythonic'),
    turtle_art: addBoss(turtleArtQuestions, 'turtle_art'),
    data_science: addBoss(dataScienceQuestions, 'data_science'),
    web_api: addBoss(webApiQuestions, 'web_api'),
};

export const ALL_QUESTIONS: QuestionDocument[] = [
    ...Object.values(ALL_QUESTIONS_BY_WORLD).flat()
];
