import type { QuestionDocument } from '../../types/question';

export const filesQuestions: QuestionDocument[] = [
    {
        id: 'file_01',
        type: 'multiple_choice',
        world: 'files',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Abrindo a Porta do Arquivo',
        prompt: 'Qual função usada em Python para abrir um arquivo?',
        options: ['open()', 'read()', 'file_open()', 'load()'],
        answerIndex: 0,
        explanationKidFriendly: 'A função open() é como a chave que abre a porta de um diário ou arquivo no computador!',
        points: 40,
    },
    {
        id: 'file_02',
        type: 'fill_code',
        world: 'files',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Escrevendo no Diário',
        prompt: 'Para escrever em um arquivo novo ou sobrescrever, usamos o modo "w" (write). Complete o código:',
        starterCode: 'with open("diario.txt", "___") as arquivo:\n    arquivo.write("Olá diário!")',
        solutionTemplate: 'w',
        tests: [
            {
                input: null,
                expectedOutput: 'Olá diário!',
                description: 'Verifica se o arquivo foi escrito com sucesso'
            }
        ],
        explanationKidFriendly: 'O "w" vem da palavra inglesa "write" que significa escrever! É o modo de escrita.',
        points: 50,
    },
    {
        id: 'file_03',
        type: 'parsons_problem',
        world: 'files',
        difficulty: 'medium',
        ageMin: 9,
        title: 'Lendo com Segurança',
        prompt: 'Ordene o código para abrir um arquivo "segredo.txt" para leitura ("r") e imprimir seu conteúdo:',
        parsonsSegments: [
            'with open("segredo.txt", "r") as f:',
            '    conteudo = f.read()',
            '    print(conteudo)'
        ],
        explanationKidFriendly: 'Usar "with open" é incrível porque fecha o arquivo sozinho quando terminamos, evitando que o arquivo fique travado!',
        points: 60,
    },
    {
        id: 'file_04',
        type: 'full_function',
        world: 'files',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Contador de Linhas',
        prompt: 'Crie uma função `contar_linhas(texto_multilinhas)` que simula o conteúdo de um arquivo dividindo o texto em linhas (`.splitlines()`) e retornando a quantidade total de linhas!',
        starterCode: 'def contar_linhas(texto_multilinhas):\n    # Seu código aqui\n    pass',
        solutionCode: 'def contar_linhas(texto_multilinhas):\n    return len(texto_multilinhas.splitlines())',
        functionName: 'contar_linhas',
        tests: [
            { input: ["Linha 1\nLinha 2\nLinha 3"], expectedOutput: 3 },
            { input: ["Python é demais!"], expectedOutput: 1 },
        ],
        explanationKidFriendly: 'splitlines() divide um texto enorme em uma lista de linhas individuais, e len() conta quantas linhas existem!',
        points: 80,
    }
];
