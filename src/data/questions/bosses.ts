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
                expectedOutput: 'regex:tem.*anos'
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
    {
        id: 'boss_battle_12',
        type: 'boss_battle',
        world: 'files',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Arquivista Fantasma',
        prompt: 'Escreva um código que abra "desafio.txt" no modo escrita ("w") e grave o texto "Venci o Boss!"',
        explanationKidFriendly: 'O Arquivista só aceita mensagens gravadas em arquivo de verdade!',
        bossMetadata: {
            bossName: 'Arquivista Fantasma',
            bossAvatar: '👻',
            timeLimitSeconds: 90,
            initialCode: '# Escreva "Venci o Boss!" no arquivo desafio.txt\n'
        },
        tests: [
            { input: null, expectedOutput: ['Venci o Boss!'] }
        ],
        solutionTemplate: `with open("desafio.txt", "w") as f:\n    f.write("Venci o Boss!")`
    },
    {
        id: 'boss_battle_13',
        type: 'boss_battle',
        world: 'modules',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Alquimista dos Módulos',
        prompt: 'Importe o módulo `math` e mostre o valor de `math.pi` arredondado com 2 casas decimais usando `round(math.pi, 2)`.',
        explanationKidFriendly: 'O Alquimista adora as constantes universais da matemática!',
        bossMetadata: {
            bossName: 'Alquimista do Pi',
            bossAvatar: '🧪',
            timeLimitSeconds: 90,
            initialCode: '# Importe math e mostre round(math.pi, 2)\n'
        },
        tests: [
            { input: null, expectedOutput: ['3.14'] }
        ],
        solutionTemplate: `import math\nprint(round(math.pi, 2))`
    },
    {
        id: 'boss_battle_14',
        type: 'boss_battle',
        world: 'oop_basics',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Titã de Aço',
        prompt: 'Crie uma classe `Guerreiro` com `__init__(self, ataque)` e crie o objeto `g = Guerreiro(50)`. Mostre `g.ataque`!',
        explanationKidFriendly: 'O Titã exige que você construa seu próprio Guerreiro usando Orientação a Objetos!',
        bossMetadata: {
            bossName: 'Titã de Aço',
            bossAvatar: '🤖',
            timeLimitSeconds: 120,
            initialCode: '# Crie a classe Guerreiro e o objeto g\n'
        },
        tests: [
            { input: null, expectedOutput: ['50'] }
        ],
        solutionTemplate: `class Guerreiro:\n    def __init__(self, ataque):\n        self.ataque = ataque\ng = Guerreiro(50)\nprint(g.ataque)`
    },
    {
        id: 'boss_battle_15',
        type: 'boss_battle',
        world: 'pythonic',
        difficulty: 'hard',
        ageMin: 11,
        title: 'O Velocista do Código',
        prompt: 'O Velocista exige uma resposta rápida: crie uma list comprehension `[x**2 for x in range(1, 4)]` e imprima o resultado!',
        explanationKidFriendly: 'Use a velocidade da list comprehension para derrotar o boss em 1 linha!',
        bossMetadata: {
            bossName: 'Velocista Pythonic',
            bossAvatar: '⚡',
            timeLimitSeconds: 90,
            initialCode: '# Mostre os quadrados de 1 a 3 com list comprehension\n'
        },
        tests: [
            { input: null, expectedOutput: ['[1, 4, 9]'] }
        ],
        solutionTemplate: `print([x**2 for x in range(1, 4)])`
    },
    {
        id: 'boss_battle_16',
        type: 'boss_battle',
        world: 'turtle_art',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Mestre dos Pincéis',
        prompt: 'Importe `turtle`, crie `t = turtle.Turtle()` e faça um loop `for i in range(3): t.forward(50); t.left(120)` para desenhar um triângulo!',
        explanationKidFriendly: 'O Mestre dos Pincéis quer ver você desenhar um triângulo perfeito com 3 giros de 120 graus!',
        bossMetadata: {
            bossName: 'Mestre Pincel',
            bossAvatar: '🎨',
            timeLimitSeconds: 120,
            initialCode: '# Desenhe um triângulo com a tartaruga\n'
        },
        tests: [
            { input: null, expectedOutput: null }
        ],
        solutionTemplate: `import turtle\nt = turtle.Turtle()\nfor i in range(3):\n    t.forward(50)\n    t.left(120)`
    },
    {
        id: 'boss_battle_17',
        type: 'boss_battle',
        world: 'data_science',
        difficulty: 'hard',
        ageMin: 11,
        title: 'O Oráculo dos Dados',
        prompt: 'Dada a lista `dados = [10, 50, 20, 80, 30]`, filtre e mostre apenas os números maiores que 25!',
        explanationKidFriendly: 'O Oráculo dos Dados quer ver você extrair apenas a informação relevante!',
        bossMetadata: {
            bossName: 'Oráculo de Dados',
            bossAvatar: '📊',
            timeLimitSeconds: 90,
            initialCode: 'dados = [10, 50, 20, 80, 30]\n# Mostre números > 25\n'
        },
        tests: [
            { input: null, expectedOutput: ['[50, 80, 30]'] }
        ],
        solutionTemplate: `dados = [10, 50, 20, 80, 30]\nprint([x for x in dados if x > 25])`
    },
    {
        id: 'boss_battle_18',
        type: 'boss_battle',
        world: 'web_api',
        difficulty: 'hard',
        ageMin: 11,
        title: 'O Guardião das Redes',
        prompt: 'Dado o dicionário de resposta `api_data = {"user": "Heroi", "score": 999}`, imprima `"Heroi marcou 999"` usando f-string!',
        explanationKidFriendly: 'Conecte as informações retornadas pela API em uma frase perfeita!',
        bossMetadata: {
            bossName: 'Guardião Web',
            bossAvatar: '🌐',
            timeLimitSeconds: 90,
            initialCode: 'api_data = {"user": "Heroi", "score": 999}\n# Imprima a frase desejada\n'
        },
        tests: [
            { input: null, expectedOutput: ['Heroi marcou 999'] }
        ],
        solutionTemplate: `api_data = {"user": "Heroi", "score": 999}\nprint(f"{api_data['user']} marcou {api_data['score']}")`
    },
];


