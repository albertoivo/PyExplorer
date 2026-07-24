import type { QuestionDocument } from '../../types/question';

export const modulesQuestions: QuestionDocument[] = [
    {
        id: 'mod_01',
        type: 'multiple_choice',
        world: 'modules',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Invocando Magias Prontas',
        prompt: 'Qual comando usamos para trazer uma biblioteca ou módulo para o nosso código Python?',
        options: ['import', 'include', 'require', 'using'],
        answerIndex: 0,
        explanationKidFriendly: 'import é a palavra mágica para importar (trazer) ferramentas prontas que outros programadores fizeram!',
        points: 40,
    },
    {
        id: 'mod_02',
        type: 'fill_code',
        world: 'modules',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Dado da Sorte',
        prompt: 'Queremos gerar um número aleatório entre 1 e 6 usando o módulo `random`. Complete a palavra import:',
        starterCode: '______ random\n\nnumero = random.randint(1, 6)\nprint(numero)',
        solutionTemplate: 'import',
        tests: [
            {
                input: null,
                expectedOutput: null,
                description: 'Importa o módulo random com sucesso'
            }
        ],
        explanationKidFriendly: 'O módulo random serve para criar surpresas e sorteios aleatórios, perfeito para jogos!',
        points: 50,
    },
    {
        id: 'mod_03',
        type: 'parsons_problem',
        world: 'modules',
        difficulty: 'medium',
        ageMin: 9,
        title: 'Calculadora da Raiz Quadrada',
        prompt: 'Ordene o código para importar o módulo `math` e calcular a raiz quadrada de 16:',
        parsonsSegments: [
            'import math',
            'raiz = math.sqrt(16)',
            'print(raiz)'
        ],
        explanationKidFriendly: 'math é o módulo matemático do Python! A função sqrt() vem de "square root", que significa raiz quadrada.',
        points: 60,
    },
    {
        id: 'mod_04',
        type: 'full_function',
        world: 'modules',
        difficulty: 'hard',
        ageMin: 10,
        title: 'Arredondando para Cima',
        prompt: 'Crie uma função `teto(numero)` que usa o módulo `math` e retorna o menor inteiro maior ou igual a `numero` (usando `math.ceil()`).',
        starterCode: 'import math\n\ndef teto(numero):\n    # Seu código aqui\n    pass',
        solutionCode: 'import math\n\ndef teto(numero):\n    return math.ceil(numero)',
        functionName: 'teto',
        tests: [
            { input: [3.2], expectedOutput: 4 },
            { input: [7.0], expectedOutput: 7 },
            { input: [0.1], expectedOutput: 1 }
        ],
        explanationKidFriendly: 'math.ceil() é como colocar um "teto" no número: se for 3.2, ele arredonda para cima virando 4!',
        points: 80,
    }
];
