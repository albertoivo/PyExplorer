import type { QuestionDocument } from '../../types/question';

export const BOSS_QUESTIONS: QuestionDocument[] = [
    {
        id: 'boss_battle_1',
        type: 'boss_battle',
        world: 'basic_commands',
        difficulty: 'hard',
        ageMin: 8,
        title: 'O Guardião do Portal',
        prompt: 'Use dois comandos print() para me cumprimentar e dizer sua idade! Exemplo: "Olá!" e "Tenho 9 anos"',
        explanationKidFriendly: 'O Guardião do Portal protege a saída. Ele só deixa passar quem sabe falar a língua dele (Python)!',
        bossMetadata: {
            bossName: 'Guardião Printus',
            bossAvatar: '🗿',
            timeLimitSeconds: 60,
            initialCode: '# Escreva dois prints aqui:\n# print("sua saudação")\n# print("sua idade")\n\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: 2
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
        prompt: 'Este monstro bagunçou todas as caixas! Crie uma variável chamada `tesouro` e guarde o valor "ouro" nela. Depois, mostre o que tem na caixa usando print(tesouro).',
        explanationKidFriendly: 'Variáveis são como caixas mágicas! O Mímico quer que você crie uma caixinha chamada "tesouro" e coloque "ouro" dentro. Use print(tesouro) para mostrar o que tem dentro!',
        bossMetadata: {
            bossName: 'Mímico Variável',
            bossAvatar: '📦',
            timeLimitSeconds: 90,
            initialCode: '# Crie a variável tesouro com o valor "ouro"\n# Use: tesouro = "ouro"\n# Depois mostre: print(tesouro)\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['ouro']
            }
        ],
        solutionTemplate: `tesouro = "ouro"\nprint(tesouro)`
    },
    {
        id: 'boss_battle_3',
        type: 'boss_battle',
        world: 'numbers',
        difficulty: 'hard',
        ageMin: 9,
        title: 'O Mago Calculador',
        prompt: 'O Mago propõe um desafio: calcule 15 + 7 * 3 e mostre o resultado! Cuidado com a ordem das operações!',
        explanationKidFriendly: 'O Mago adora matemática! Lembre-se: multiplicação vem antes da soma! 🧙‍♂️',
        bossMetadata: {
            bossName: 'Mago Numérico',
            bossAvatar: '🧙',
            timeLimitSeconds: 60,
            initialCode: '# Calcule 15 + 7 * 3\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['36']
            }
        ],
        solutionTemplate: `print(15 + 7 * 3)`
    },
    {
        id: 'boss_battle_4',
        type: 'boss_battle',
        world: 'conditions',
        difficulty: 'hard',
        ageMin: 9,
        title: 'A Esfinge Lógica',
        prompt: 'A Esfinge pergunta: Se vida = 100 e vida > 50, mostre "Você está bem!". Se não, mostre "Cuidado!".',
        explanationKidFriendly: 'A Esfinge testa sua lógica! Use if e else para escolher o que mostrar! 🦁',
        bossMetadata: {
            bossName: 'Esfinge das Decisões',
            bossAvatar: '🦁',
            timeLimitSeconds: 90,
            initialCode: 'vida = 100\n# Use if/else para verificar a vida\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['Você está bem!']
            }
        ],
        solutionTemplate: `vida = 100\nif vida > 50:\n    print("Você está bem!")\nelse:\n    print("Cuidado!")`
    },
    {
        id: 'boss_battle_5',
        type: 'boss_battle',
        world: 'loops',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Dragão Repetidor',
        prompt: 'O Dragão exige que você conte de 1 até 5, um número por linha! Use um loop for.',
        explanationKidFriendly: 'O Dragão quer ouvir você contar! Use range(1, 6) para ir de 1 a 5! 🐉',
        bossMetadata: {
            bossName: 'Dragão dos Loops',
            bossAvatar: '🐉',
            timeLimitSeconds: 90,
            initialCode: '# Conte de 1 até 5\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['1', '2', '3', '4', '5']
            }
        ],
        solutionTemplate: `for i in range(1, 6):\n    print(i)`
    },
    {
        id: 'boss_battle_6',
        type: 'boss_battle',
        world: 'functions',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Mestre das Receitas',
        prompt: 'Crie uma função chamada "triplo" que recebe um número e retorna o triplo dele. Depois chame triplo(4) e mostre o resultado.',
        explanationKidFriendly: 'O Mestre quer ver sua receita! Crie a função e use-a! 👨‍🍳',
        bossMetadata: {
            bossName: 'Chef Função',
            bossAvatar: '👨‍🍳',
            timeLimitSeconds: 120,
            initialCode: '# Crie a função triplo\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['12']
            }
        ],
        solutionTemplate: `def triplo(n):\n    return n * 3\nprint(triplo(4))`
    },
    {
        id: 'boss_battle_7',
        type: 'boss_battle',
        world: 'lists',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Gigante Organizador',
        prompt: 'O Gigante tem uma lista [5, 2, 8, 1]. Ordene a lista e mostre-a!',
        explanationKidFriendly: 'O Gigante está bagunçado! Use sort() para organizar a lista! 🗿',
        bossMetadata: {
            bossName: 'Gigante da Ordem',
            bossAvatar: '🗿',
            timeLimitSeconds: 90,
            initialCode: 'numeros = [5, 2, 8, 1]\n# Ordene e mostre\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['[1, 2, 5, 8]']
            }
        ],
        solutionTemplate: `numeros = [5, 2, 8, 1]\nnumeros.sort()\nprint(numeros)`
    },
    {
        id: 'boss_battle_8',
        type: 'boss_battle',
        world: 'strings',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Escriba Misterioso',
        prompt: 'O Escriba escreveu "python" em minúsculas. Transforme em MAIÚSCULAS e mostre!',
        explanationKidFriendly: 'O Escriba quer que você grite! Use upper() para deixar tudo maiúsculo! 📜',
        bossMetadata: {
            bossName: 'Escriba das Letras',
            bossAvatar: '📜',
            timeLimitSeconds: 60,
            initialCode: 'texto = "python"\n# Transforme em maiúsculas\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['PYTHON']
            }
        ],
        solutionTemplate: `texto = "python"\nprint(texto.upper())`
    },
    {
        id: 'boss_battle_9',
        type: 'boss_battle',
        world: 'user_input',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Oráculo Perguntador',
        prompt: 'O Oráculo quer saber: pergunte o nome e a idade, depois mostre "Nome tem X anos" (substitua Nome e X pelos valores).',
        explanationKidFriendly: 'O Oráculo ouve você! Use input() para perguntar e f-string para responder! 🔮',
        bossMetadata: {
            bossName: 'Oráculo do Input',
            bossAvatar: '🔮',
            timeLimitSeconds: 120,
            initialCode: '# Pergunte nome e idade\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['Qual seu nome?']
            }
        ],
        solutionTemplate: `nome = input("Qual seu nome? ")\nidade = input("Quantos anos? ")\nprint(f"{nome} tem {idade} anos")`
    },
    {
        id: 'boss_battle_10',
        type: 'boss_battle',
        world: 'dictionaries',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Bibliotecário dos Segredos',
        prompt: 'Crie um dicionário "heroi" com nome "Link" e vida 100. Depois mostre o nome do herói!',
        explanationKidFriendly: 'O Bibliotecário guarda segredos em dicionários! Use chaves e valores! 📚',
        bossMetadata: {
            bossName: 'Guardião dos Livros',
            bossAvatar: '📚',
            timeLimitSeconds: 90,
            initialCode: '# Crie o dicionário heroi\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['Link']
            }
        ],
        solutionTemplate: `heroi = {"nome": "Link", "vida": 100}\nprint(heroi["nome"])`
    },
    {
        id: 'boss_battle_11',
        type: 'boss_battle',
        world: 'error_handling',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Guardião Anti-Bugs',
        prompt: 'Use try/except para tentar dividir 10 por 0. Se der erro, mostre "Impossível dividir por zero!".',
        explanationKidFriendly: 'O Guardião protege contra bugs! Use try/except para capturar o erro! 🛡️',
        bossMetadata: {
            bossName: 'Caçador de Bugs',
            bossAvatar: '🛡️',
            timeLimitSeconds: 90,
            initialCode: '# Proteja a divisão por zero\n'
        },
        tests: [
            {
                input: null,
                expectedOutput: ['Impossível dividir por zero!']
            }
        ],
        solutionTemplate: `try:\n    resultado = 10 / 0\nexcept:\n    print("Impossível dividir por zero!")`
    },
];

