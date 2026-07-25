import type { QuestionDocument } from '../../types/question';

export const dataScienceQuestions: QuestionDocument[] = [
    {
        id: 'ds_01',
        type: 'multiple_choice',
        world: 'data_science',
        difficulty: 'easy',
        ageMin: 10,
        title: 'O que é Ciência de Dados?',
        prompt: 'Qual a principal meta de um Cientista de Dados usando Python?',
        options: [
            'Analisar informações e descobrir padrões valiosos',
            'Desenhar robôs fisicamente de ferro',
            'Formatar o computador toda semana',
            'Apagar o banco de dados'
        ],
        answerIndex: 0,
        explanationKidFriendly: 'Cientistas de dados usam Python para transformar montanhas de números em descobertas incríveis!',
        points: 40,
    },
    {
        id: 'ds_02',
        type: 'fill_code',
        world: 'data_science',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Média de Pontuação do Jogador',
        prompt: 'Para achar a média das pontuações, somamos tudo com `sum()` e dividimos pela quantidade com `len()`. Complete a função:',
        starterCode: 'pontos = [10, 20, 30]\nmedia = sum(pontos) / ____(pontos)\nprint(media)',
        solutionTemplate: 'pontos = [10, 20, 30]\nmedia = sum(pontos) / len(pontos)\nprint(media)',
        tests: [
            {
                input: null,
                expectedOutput: '20.0',
                description: 'Calcula a média corretamente'
            }
        ],
        explanationKidFriendly: 'A média estatística é a soma dividida pela quantidade de itens!',
        points: 50,
    },
    {
        id: 'ds_03',
        type: 'parsons_problem',
        world: 'data_science',
        difficulty: 'medium',
        ageMin: 11,
        title: 'Encontrando o Valor Máximo e Mínimo',
        prompt: 'Ordene o código para encontrar a maior e a menor nota de um conjunto de alunos:',
        parsonsSegments: [
            'notas = [85, 92, 78, 95, 88]',
            'maior_nota = max(notas)',
            'menor_nota = min(notas)',
            'print(f"Maior: {maior_nota}, Menor: {menor_nota}")'
        ],
        explanationKidFriendly: 'As funções `max()` e `min()` varrem a lista inteira em milissegundos para encontrar os extremos!',
        points: 60,
    },
    {
        id: 'ds_04',
        type: 'full_function',
        world: 'data_science',
        difficulty: 'hard',
        ageMin: 11,
        title: 'Detector de Aprovados em IA',
        prompt: 'Crie uma função `filtro_aprovados(notas, corte)` que retorna uma lista apenas com as notas maiores ou iguais à nota de corte!',
        starterCode: 'def filtro_aprovados(notas, corte):\n    # Seu código aqui\n    pass',
        solutionCode: 'def filtro_aprovados(notas, corte):\n    return [n for n in notas if n >= corte]',
        functionName: 'filtro_aprovados',
        tests: [
            { input: [[7, 4, 9, 5, 8], 6], expectedOutput: [7, 9, 8] },
            { input: [[10, 3, 2], 5], expectedOutput: [10] }
        ],
        explanationKidFriendly: 'Filtros são a base do Machine Learning para separar dados válidos e positivos!',
        points: 80,
    }
];
