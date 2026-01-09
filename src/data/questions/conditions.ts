import type { QuestionDocument } from '../../types/question';

export const conditionsQuestions: QuestionDocument[] = [
    {
        id: 'dec_1',
        type: 'multiple_choice',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Palavra mágica: if',
        prompt: 'A palavra "if" em Python serve para...',
        options: [
            'Fazer uma pergunta e decidir o que fazer',
            'Repetir algo várias vezes',
            'Criar uma variável',
            'Mostrar texto na tela',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'if significa "se" em inglês! É como perguntar: "SE isso for verdade, faça aquilo". Por exemplo: SE está chovendo, leve guarda-chuva! ☔',
        points: 10,
    },
    {
        id: 'dec_2',
        type: 'true_false',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        title: 'else é obrigatório',
        prompt: 'Quando usamos if, somos obrigados a usar else também.',
        correctBool: false,
        explanationKidFriendly: 'Nem sempre! O else é opcional. Você só usa quando quer que algo aconteça caso a condição seja falsa. É como ter um plano B! 🅱️',
        points: 10,
    },
    {
        id: 'dec_3',
        type: 'multiple_choice',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Comparando valores',
        prompt: 'Qual símbolo usamos para verificar se dois valores são IGUAIS?',
        options: ['==', '=', '===', '<>'],
        answerIndex: 0,
        explanationKidFriendly: 'Dois iguais (==) para comparar! Um igual (=) guarda valores. Dois iguais (==) pergunta: "São iguais?" ⚖️',
        points: 10,
    },
    {
        id: 'dec_4',
        type: 'fill_code',
        world: 'conditions',
        difficulty: 'medium',
        ageMin: 10,
        title: 'É maior de idade?',
        prompt: 'Complete o código para mostrar "Maior de idade" se a idade for 18 ou mais:',
        starterCode: 'idade = 20\n\n___ idade >= 18:\n    print("Maior de idade")',
        solutionTemplate: 'if idade >= 18:',
        tests: [
            { input: null, expectedOutput: 'Maior de idade' }
        ],
        explanationKidFriendly: 'Usamos if para verificar: SE idade é maior ou igual a 18, mostramos a mensagem! O sinal >= significa "maior ou igual". 📊',
        points: 20,
    },
    {
        id: 'dec_5',
        type: 'fill_code',
        world: 'conditions',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Par ou ímpar?',
        prompt: 'Complete o código para verificar se o número é par:',
        starterCode: 'numero = 4\nif numero % 2 ___ 0:\n    print("É par!")\nelse:\n    print("É ímpar!")',
        solutionTemplate: 'if numero % 2 == 0:',
        tests: [
            { input: null, expectedOutput: 'É par!' }
        ],
        explanationKidFriendly: 'O % dá o resto da divisão. Se numero % 2 == 0, o resto é zero, então é par! 🎲',
        points: 25,
    },
    {
        id: 'cond_parsons_rain',
        type: 'parsons_problem',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Dia de Chuva',
        prompt: 'Monte a lógica: Se estiver chovendo, leve guarda-chuva. Senão, use óculos de sol.',
        parsonsSegments: [
            'chovendo = True',
            'if chovendo:',
            '    print("Leve guarda-chuva")',
            'else:',
            '    print("Use óculos de sol")'
        ],
        tests: [
            { input: null, expectedOutput: 'Leve guarda-chuva' }
        ],
        explanationKidFriendly: 'O computador verifica a condição no `if`. Se for verdade, ele faz o primeiro bloco. Se não, ele pula para o `else`!',
        points: 15
    },
];
