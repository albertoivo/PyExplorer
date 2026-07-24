import type { QuestionDocument } from '../../types/question';

export const pythonicQuestions: QuestionDocument[] = [
    {
        id: 'py_01',
        type: 'multiple_choice',
        world: 'pythonic',
        difficulty: 'easy',
        ageMin: 10,
        title: 'O Super Poder da List Comprehension',
        prompt: 'Qual a vantagem principal de usar uma List Comprehension `[x for x in lista]`?',
        options: [
            'Criar e transformar listas em apenas uma linha limpa de código',
            'Fazer o programa rodar sem precisar de computador',
            'Deixar o código mais longo e difícil',
            'Desligar o Python'
        ],
        answerIndex: 0,
        explanationKidFriendly: 'List comprehension é um truque mágico que resume 4 linhas de um loop "for" em 1 linha única e super elegante!',
        points: 40,
    },
    {
        id: 'py_02',
        type: 'fill_code',
        world: 'pythonic',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Dobrando Números em Uma Linha',
        prompt: 'Queremos criar uma lista com os dobros dos números de 1 a 3. Complete o atalho:',
        starterCode: 'dobros = [x * 2 _____ x in [1, 2, 3]]\nprint(dobros)',
        solutionTemplate: 'for',
        tests: [
            {
                input: null,
                expectedOutput: '[2, 4, 6]',
                description: 'Cria a lista de dobros [2, 4, 6]'
            }
        ],
        explanationKidFriendly: 'A sintaxe [expressao for item in lista] é o padrão ouro de código Pythonic!',
        points: 50,
    },
    {
        id: 'py_03',
        type: 'parsons_problem',
        world: 'pythonic',
        difficulty: 'medium',
        ageMin: 11,
        title: 'Filtrando Pares Rapidez',
        prompt: 'Ordene o código para filtrar apenas números pares de uma lista usando List Comprehension com `if`:',
        parsonsSegments: [
            'numeros = [1, 2, 3, 4, 5, 6]',
            'pares = [n for n in numeros if n % 2 == 0]',
            'print(pares)'
        ],
        explanationKidFriendly: 'Podemos colocar um `if` no final da list comprehension para filtrar só os itens que nos interessam!',
        points: 60,
    },
    {
        id: 'py_04',
        type: 'full_function',
        world: 'pythonic',
        difficulty: 'hard',
        ageMin: 11,
        title: 'Super-Filtro de Palavras Curtas',
        prompt: 'Crie uma função `palavras_curtas(lista_palavras)` que usa list comprehension para retornar apenas as palavras com menos de 5 letras!',
        starterCode: 'def palavras_curtas(lista_palavras):\n    # Use list comprehension em 1 linha\n    pass',
        solutionCode: 'def palavras_curtas(lista_palavras):\n    return [p for p in lista_palavras if len(p) < 5]',
        functionName: 'palavras_curtas',
        tests: [
            { input: [["sol", "elefante", "lua", "computador"]], expectedOutput: ["sol", "lua"] },
            { input: [["gato", "cão"]], expectedOutput: ["gato", "cão"] }
        ],
        explanationKidFriendly: 'Veja como o código fica limpo e rápido! Uma verdadeira mágica de mestre Python!',
        points: 80,
    }
];
