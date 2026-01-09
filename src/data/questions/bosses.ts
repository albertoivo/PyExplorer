import type { QuestionDocument } from '../../types/question';

export const BOSS_QUESTIONS: QuestionDocument[] = [
    {
        id: 'boss_battle_1',
        type: 'boss_battle',
        world: 'basic_commands',
        difficulty: 'hard',
        ageMin: 8,
        title: 'O Guardião do Portal',
        prompt: 'Para escapar deste mundo, você precisa provar que domina o `print`! O Guardião exige que você o cumprimente corretamente e diga sua idade.',
        explanationKidFriendly: 'O Guardião do Portal protege a saída. Ele só deixa passar quem sabe falar a língua dele (Python)!',
        bossMetadata: {
            bossName: 'Guardião Printus',
            bossAvatar: '🗿',
            timeLimitSeconds: 60,
            initialCode: '# Cumprimente o guardião\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['Olá Guardião', 'Tenho 10 anos']
            }
        ],
        solutionTemplate: `print("Olá Guardião")\nprint("Tenho 10 anos")`
    },
    {
        id: 'boss_battle_2',
        type: 'boss_battle',
        world: 'variables',
        difficulty: 'hard',
        ageMin: 8,
        title: 'O Mímico das Caixas',
        prompt: 'Este monstro bagunçou todas as caixas! Crie uma variável chamada `tesouro` e guarde o valor "ouro" nela. Depois, mostre o que tem na caixa.',
        explanationKidFriendly: 'Variáveis são como caixas. O Mímico escondeu o ouro, você precisa organizar!',
        bossMetadata: {
            bossName: 'Mímico Variável',
            bossAvatar: '📦',
            timeLimitSeconds: 90,
            initialCode: '# Crie a variável tesouro\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['ouro']
            }
        ],
        solutionTemplate: `tesouro = "ouro"\nprint(tesouro)`
    }
    // Adicionar mais bosses para outros mundos conforme necessário
];
