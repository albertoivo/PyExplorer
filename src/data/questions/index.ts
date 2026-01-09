import { basicCommandsQuestions } from './basic_commands';
import { variablesQuestions } from './variables';
import { numbersQuestions } from './numbers';
import { conditionsQuestions } from './conditions';
import { loopsQuestions } from './loops';
import { functionsQuestions } from './functions';
import { listsQuestions } from './lists';
import { stringsQuestions } from './strings';
import type { QuestionDocument } from '../../types/question';

export const ALL_QUESTIONS_BY_WORLD = {
    basic_commands: basicCommandsQuestions,
    variables: variablesQuestions,
    numbers: numbersQuestions,
    conditions: conditionsQuestions,
    loops: loopsQuestions,
    functions: functionsQuestions,
    lists: listsQuestions,
    strings: stringsQuestions,
};

export const ALL_QUESTIONS: QuestionDocument[] = [
    ...basicCommandsQuestions,
    ...variablesQuestions,
    ...numbersQuestions,
    ...conditionsQuestions,
    ...loopsQuestions,
    ...functionsQuestions,
    ...listsQuestions,
    ...stringsQuestions,
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
