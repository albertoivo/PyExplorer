import type { QuestionDocument } from '../../types/question';

export const turtleArtQuestions: QuestionDocument[] = [
    {
        id: 'turtle_01',
        type: 'multiple_choice',
        world: 'turtle_art',
        difficulty: 'easy',
        ageMin: 8,
        title: 'A Tartaruga Desenhista',
        prompt: 'Qual o nome da biblioteca nativa do Python usada para fazer desenhos de tartaruga na tela?',
        options: ['turtle', 'draw', 'canvas', 'paint'],
        answerIndex: 0,
        explanationKidFriendly: 'A biblioteca turtle (tartaruga) permite controlar uma canetinha na tela para criar desenhos incríveis!',
        points: 40,
    },
    {
        id: 'turtle_02',
        type: 'fill_code',
        world: 'turtle_art',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Andando para Frente',
        prompt: 'Para fazer a tartaruguinha andar 100 passos para a frente, usamos o comando `forward()`. Complete o código:',
        starterCode: 'import turtle\n\nt = turtle.Turtle()\nt._______(100)',
        solutionTemplate: 'import turtle\nt = turtle.Turtle()\nt.forward(100)',
        tests: [
            {
                input: null,
                expectedOutput: null,
                description: 'Verifica o comando forward'
            }
        ],
        explanationKidFriendly: 'forward significa "para frente" em inglês. É o comando principal de movimento da tartaruga!',
        points: 50,
    },
    {
        id: 'turtle_03',
        type: 'parsons_problem',
        world: 'turtle_art',
        difficulty: 'medium',
        ageMin: 9,
        title: 'Desenhando um Quadrado',
        prompt: 'Ordene o loop para a tartaruga virar 90 graus 4 vezes e desenhar um quadrado perfeito:',
        parsonsSegments: [
            'for i in range(4):',
            '    t.forward(100)',
            '    t.right(90)'
        ],
        explanationKidFriendly: 'Um quadrado tem 4 lados iguais e 4 ângulos retos de 90 graus! O loop `for i in range(4)` desenha cada lado rapidamente.',
        points: 60,
    },
    {
        id: 'turtle_04',
        type: 'full_function',
        world: 'turtle_art',
        difficulty: 'hard',
        ageMin: 10,
        title: 'Perímetro da Forma Geométrica',
        prompt: 'Crie uma função `perimetro_poligono(lados, tamanho)` que calcula e retorna a distância total percorrida pela tartaruga para desenhar a forma (`lados * tamanho`)!',
        starterCode: 'def perimetro_poligono(lados, tamanho):\n    # Seu código aqui\n    pass',
        solutionCode: 'def perimetro_poligono(lados, tamanho):\n    return lados * tamanho',
        functionName: 'perimetro_poligono',
        tests: [
            { input: [4, 100], expectedOutput: 400 },
            { input: [3, 50], expectedOutput: 150 },
            { input: [6, 20], expectedOutput: 120 }
        ],
        explanationKidFriendly: 'O perímetro é a soma de todas as linhas da figura geométrica que a tartaruga desenhou!',
        points: 80,
    }
];
