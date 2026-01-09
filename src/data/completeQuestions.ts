import { ALL_QUESTIONS, ALL_QUESTIONS_BY_WORLD } from './questions';

export const COMPLETE_QUESTIONS = ALL_QUESTIONS;
export const QUESTIONS_BY_WORLD = ALL_QUESTIONS_BY_WORLD;

export const QUESTIONS_STATS = {
    total: COMPLETE_QUESTIONS.length,
    byWorld: {
        basic_commands: ALL_QUESTIONS_BY_WORLD.basic_commands.length,
        variables: ALL_QUESTIONS_BY_WORLD.variables.length,
        numbers: ALL_QUESTIONS_BY_WORLD.numbers.length,
        conditions: ALL_QUESTIONS_BY_WORLD.conditions.length,
        loops: ALL_QUESTIONS_BY_WORLD.loops.length,
        functions: ALL_QUESTIONS_BY_WORLD.functions.length,
        lists: ALL_QUESTIONS_BY_WORLD.lists.length,
        strings: ALL_QUESTIONS_BY_WORLD.strings.length,
    },
    byType: {
        multiple_choice: COMPLETE_QUESTIONS.filter(q => q.type === 'multiple_choice').length,
        true_false: COMPLETE_QUESTIONS.filter(q => q.type === 'true_false').length,
        fill_code: COMPLETE_QUESTIONS.filter(q => q.type === 'fill_code').length,
        partial_function: COMPLETE_QUESTIONS.filter(q => q.type === 'partial_function').length,
        full_function: COMPLETE_QUESTIONS.filter(q => q.type === 'full_function').length,
        parsons_problem: COMPLETE_QUESTIONS.filter(q => q.type === 'parsons_problem').length,
        turtle_challenge: COMPLETE_QUESTIONS.filter(q => q.type === 'turtle_challenge').length,
    },
    byDifficulty: {
        easy: COMPLETE_QUESTIONS.filter(q => q.difficulty === 'easy').length,
        medium: COMPLETE_QUESTIONS.filter(q => q.difficulty === 'medium').length,
        hard: COMPLETE_QUESTIONS.filter(q => q.difficulty === 'hard').length,
    },
};
