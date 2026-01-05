import type { QuestionDocument } from '../types/question';

/**
 * Questões completas para todos os mundos do PyExplorer
 * Este arquivo contém 30 questões educativas de Python para crianças
 */

// ============================================
// MUNDO: PRIMEIROS PASSOS (basic_commands)
// ============================================
const basicCommandsQuestions: QuestionDocument[] = [
    {
        id: 'basic_1',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Comando para Mostrar Texto',
        prompt: 'Qual comando usamos em Python para mostrar uma mensagem na tela? 🖥️',
        options: ['print()', 'show()', 'display()', 'write()'],
        answerIndex: 0,
        explanationKidFriendly: 'O comando print() é como um megafone do Python! 📢 Ele pega o que você escrever dentro dos parênteses e mostra na tela para todo mundo ver!',
    },
    {
        id: 'basic_2',
        type: 'true_false',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Aspas no Print',
        prompt: 'Para mostrar "Olá, Mundo!" na tela, precisamos colocar o texto entre aspas dentro do print(). Isso é verdadeiro ou falso? 🤔',
        correctBool: true,
        explanationKidFriendly: 'Isso mesmo! As aspas são como uma caixinha que guarda o texto. Quando escrevemos print("Olá, Mundo!"), as aspas dizem ao Python: "Ei, isso aqui é um texto, não um comando!"',
    },
    {
        id: 'basic_3',
        type: 'fill_code',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Complete o Print',
        prompt: 'Complete o código para mostrar "Eu amo Python!" na tela: 🐍',
        starterCode: '___("Eu amo Python!")',
        solutionTemplate: 'print("Eu amo Python!")',
        tests: [
            { input: null, expectedOutput: 'Eu amo Python!' }
        ],
        explanationKidFriendly: 'A palavra mágica é print! Sempre que quiser mostrar algo na tela, é só usar print() com o texto entre aspas dentro dos parênteses.',
    },
    {
        id: 'basic_4',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Guardando Informações',
        prompt: 'Uma variável em Python serve para... 📦',
        options: [
            'Guardar informações como números e textos',
            'Desenhar na tela',
            'Jogar jogos',
            'Fazer o computador desligar'
        ],
        answerIndex: 0,
        explanationKidFriendly: 'Variáveis são como caixinhas mágicas! 📦✨ Você pode guardar números, textos, e muito mais! Por exemplo: idade = 10 guarda o número 10 na caixinha chamada "idade".',
    },
    {
        id: 'basic_5',
        type: 'fill_code',
        world: 'basic_commands',
        difficulty: 'medium',
        ageMin: 8,
        ageMax: 12,
        title: 'Criando uma Variável',
        prompt: 'Complete o código para criar uma variável chamada "nome" com o valor "Python": 🏷️',
        starterCode: '___ = "Python"',
        solutionTemplate: 'nome = "Python"',
        tests: [
            { input: null, expectedOutput: 'nome' }
        ],
        explanationKidFriendly: 'Para criar uma variável, você escolhe um nome (como "nome") e usa o sinal de igual (=) para colocar um valor dentro dela. É como etiquetar uma caixa!',
    },
];

// ============================================
// MUNDO: NÚMEROS MÁGICOS (numbers)
// ============================================
const numbersQuestions: QuestionDocument[] = [
    {
        id: 'numbers_1',
        type: 'multiple_choice',
        world: 'numbers',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Soma em Python',
        prompt: 'Qual símbolo usamos para somar dois números em Python? ➕',
        options: ['+', 'x', '&', '@'],
        answerIndex: 0,
        explanationKidFriendly: 'O símbolo de mais (+) funciona igual na matemática! print(5 + 3) vai mostrar 8 na tela. Legal, né? 🎉',
    },
    {
        id: 'numbers_2',
        type: 'true_false',
        world: 'numbers',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Multiplicação com Asterisco',
        prompt: 'Em Python, usamos o asterisco (*) para multiplicar números. Verdadeiro ou falso? ✖️',
        correctBool: true,
        explanationKidFriendly: 'Isso! O asterisco (*) é o símbolo da multiplicação em Python. print(4 * 3) mostra 12! É diferente do "x" que usamos no caderno, mas faz a mesma coisa!',
    },
    {
        id: 'numbers_3',
        type: 'fill_code',
        world: 'numbers',
        difficulty: 'easy',
        ageMin: 8,
        ageMax: 12,
        title: 'Calculando a Idade',
        prompt: 'Complete o código para calcular a idade daqui a 5 anos: 🎂',
        starterCode: 'idade_atual = 10\nidade_futura = idade_atual ___ 5\nprint(idade_futura)',
        solutionTemplate: 'idade_atual = 10\nidade_futura = idade_atual + 5\nprint(idade_futura)',
        tests: [
            { input: null, expectedOutput: '15' }
        ],
        explanationKidFriendly: 'Para calcular a idade futura, pegamos a idade atual e somamos (+) mais anos. Se você tem 10 anos, daqui a 5 anos terá 10 + 5 = 15 anos!',
    },
    {
        id: 'numbers_4',
        type: 'multiple_choice',
        world: 'numbers',
        difficulty: 'medium',
        ageMin: 8,
        ageMax: 14,
        title: 'Divisão em Python',
        prompt: 'Qual é o resultado de 10 / 2 em Python? ➗',
        options: ['5.0', '5', '2', '10'],
        answerIndex: 0,
        explanationKidFriendly: 'A divisão com / em Python sempre dá um número com ponto (decimal)! Por isso 10 / 2 = 5.0. Se quiser só o número inteiro, use // (dois tracinhos).',
    },
    {
        id: 'numbers_5',
        type: 'full_function',
        world: 'numbers',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'Função de Dobrar',
        prompt: 'Crie uma função chamada "dobrar" que recebe um número e retorna o dobro dele: 🔢',
        starterCode: 'def dobrar(numero):\n    # Seu código aqui\n    pass',
        solutionTemplate: 'def dobrar(numero):\n    return numero * 2',
        tests: [
            { input: [5], expectedOutput: 10 },
            { input: [0], expectedOutput: 0 },
            { input: [7], expectedOutput: 14 },
        ],
        explanationKidFriendly: 'Uma função é como uma máquina! Você coloca um número, ela faz algo com ele (nesse caso, multiplica por 2) e devolve o resultado. return é o comando para devolver a resposta!',
    },
];

// ============================================
// MUNDO: DECISÕES (conditions)
// ============================================
const conditionsQuestions: QuestionDocument[] = [
    {
        id: 'conditions_1',
        type: 'multiple_choice',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        ageMax: 13,
        title: 'Palavra Mágica IF',
        prompt: 'Qual palavra usamos em Python para verificar se algo é verdadeiro? 🔍',
        options: ['if', 'check', 'verify', 'test'],
        answerIndex: 0,
        explanationKidFriendly: 'A palavra "if" (que significa "se" em inglês) é usada para fazer perguntas! Por exemplo: if idade >= 10: significa "se a idade for maior ou igual a 10, faça isso..."',
    },
    {
        id: 'conditions_2',
        type: 'true_false',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        ageMax: 13,
        title: 'Else para o Contrário',
        prompt: 'A palavra "else" é usada para dizer "senão" ou "caso contrário" em Python. Verdadeiro ou falso? 🤷',
        correctBool: true,
        explanationKidFriendly: 'Exato! "else" funciona assim: if chovendo: leva guarda-chuva, else: deixa em casa. Ou seja: SE estiver chovendo, leva o guarda-chuva, SENÃO deixa em casa!',
    },
    {
        id: 'conditions_3',
        type: 'multiple_choice',
        world: 'conditions',
        difficulty: 'easy',
        ageMin: 9,
        ageMax: 13,
        title: 'Comparando Números',
        prompt: 'Qual símbolo usamos para verificar se dois valores são IGUAIS em Python? ⚖️',
        options: ['==', '=', '===', '<>'],
        answerIndex: 0,
        explanationKidFriendly: 'Usamos dois sinais de igual (==) para comparar! Um igual (=) é para guardar valores. Dois iguais (==) é para perguntar: "Esses valores são iguais?"',
    },
    {
        id: 'conditions_4',
        type: 'fill_code',
        world: 'conditions',
        difficulty: 'medium',
        ageMin: 9,
        ageMax: 14,
        title: 'Verificando a Idade',
        prompt: 'Complete o código para verificar se a pessoa pode votar (idade >= 16): 🗳️',
        starterCode: 'idade = 18\n___ idade >= 16:\n    print("Pode votar!")',
        solutionTemplate: 'idade = 18\nif idade >= 16:\n    print("Pode votar!")',
        tests: [
            { input: null, expectedOutput: 'Pode votar!' }
        ],
        explanationKidFriendly: 'Usamos "if" para fazer a verificação! if idade >= 16 significa "se a idade for maior ou igual a 16". O sinal >= significa "maior ou igual".',
    },
    {
        id: 'conditions_5',
        type: 'partial_function',
        world: 'conditions',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'Par ou Ímpar',
        prompt: 'Complete a função para verificar se um número é par: 🎲',
        starterCode: 'def e_par(numero):\n    if numero % 2 ___ 0:\n        return True\n    else:\n        return False',
        solutionTemplate: 'def e_par(numero):\n    if numero % 2 == 0:\n        return True\n    else:\n        return False',
        tests: [
            { input: [4], expectedOutput: true },
            { input: [7], expectedOutput: false },
            { input: [0], expectedOutput: true },
        ],
        explanationKidFriendly: 'O operador % (módulo) dá o resto da divisão. Se numero % 2 == 0, significa que o resto é zero, ou seja, o número é divisível por 2 (é par)!',
    },
];

// ============================================
// MUNDO: REPETIÇÕES (loops)
// ============================================
const loopsQuestions: QuestionDocument[] = [
    {
        id: 'loops_1',
        type: 'multiple_choice',
        world: 'loops',
        difficulty: 'easy',
        ageMin: 9,
        ageMax: 13,
        title: 'Repetindo com For',
        prompt: 'Qual comando usamos para repetir algo várias vezes em Python? 🔄',
        options: ['for', 'repeat', 'again', 'loop'],
        answerIndex: 0,
        explanationKidFriendly: 'O comando "for" é como pedir para o Python fazer algo várias vezes! for i in range(5) significa "faça isso 5 vezes". É muito útil para não ter que escrever a mesma coisa várias vezes!',
    },
    {
        id: 'loops_2',
        type: 'true_false',
        world: 'loops',
        difficulty: 'easy',
        ageMin: 9,
        ageMax: 13,
        title: 'Range Começa em Zero',
        prompt: 'O comando range(5) gera os números 0, 1, 2, 3, 4 (começa no 0 e vai até antes do 5). Verdadeiro ou falso? 🔢',
        correctBool: true,
        explanationKidFriendly: 'Isso mesmo! Python gosta de começar do zero! range(5) dá 0, 1, 2, 3, 4 (são 5 números, mas começa do 0). É como uma escada que começa do térreo!',
    },
    {
        id: 'loops_3',
        type: 'fill_code',
        world: 'loops',
        difficulty: 'easy',
        ageMin: 9,
        ageMax: 13,
        title: 'Contando até 3',
        prompt: 'Complete o código para mostrar os números 0, 1, 2: 🔢',
        starterCode: 'for i in ___(3):\n    print(i)',
        solutionTemplate: 'for i in range(3):\n    print(i)',
        tests: [
            { input: null, expectedOutput: '0\n1\n2' }
        ],
        explanationKidFriendly: 'O range(3) cria uma sequência de 0 até 2 (3 números no total). O for vai passando por cada número e o print mostra na tela!',
    },
    {
        id: 'loops_4',
        type: 'multiple_choice',
        world: 'loops',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'While - Enquanto',
        prompt: 'O comando "while" repete algo enquanto uma condição for... 🔁',
        options: ['Verdadeira', 'Falsa', 'Igual a zero', 'Maior que 10'],
        answerIndex: 0,
        explanationKidFriendly: 'While significa "enquanto" em inglês. O código dentro do while repete enquanto a condição for verdadeira. Quando fica falsa, para de repetir!',
    },
    {
        id: 'loops_5',
        type: 'full_function',
        world: 'loops',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'Soma dos Números',
        prompt: 'Crie uma função que soma todos os números de 1 até n: ➕',
        starterCode: 'def soma_ate(n):\n    # Seu código aqui\n    pass',
        solutionTemplate: 'def soma_ate(n):\n    soma = 0\n    for i in range(1, n + 1):\n        soma = soma + i\n    return soma',
        tests: [
            { input: [5], expectedOutput: 15 },
            { input: [3], expectedOutput: 6 },
            { input: [10], expectedOutput: 55 },
        ],
        explanationKidFriendly: 'Use um for para ir de 1 até n, somando cada número! Crie uma variável "soma" começando em 0 e vá adicionando cada número. No fim, retorne a soma!',
    },
];

// ============================================
// MUNDO: LISTAS MÁGICAS (lists)
// ============================================
const listsQuestions: QuestionDocument[] = [
    {
        id: 'lists_1',
        type: 'multiple_choice',
        world: 'lists',
        difficulty: 'easy',
        ageMin: 10,
        ageMax: 14,
        title: 'Criando uma Lista',
        prompt: 'Qual símbolo usamos para criar uma lista em Python? 📋',
        options: ['[ ]', '( )', '{ }', '< >'],
        answerIndex: 0,
        explanationKidFriendly: 'Listas usam colchetes [ ]! Uma lista é como uma mochila que guarda várias coisas. frutas = ["maçã", "banana", "laranja"] guarda 3 frutas!',
    },
    {
        id: 'lists_2',
        type: 'true_false',
        world: 'lists',
        difficulty: 'easy',
        ageMin: 10,
        ageMax: 14,
        title: 'Primeiro Item é Zero',
        prompt: 'Em Python, o primeiro item de uma lista tem posição 0 (não 1). Verdadeiro ou falso? 🎯',
        correctBool: true,
        explanationKidFriendly: 'Sim! Python começa do zero, igual no range. Se temos frutas = ["maçã", "banana"], então frutas[0] é "maçã" e frutas[1] é "banana"!',
    },
    {
        id: 'lists_3',
        type: 'fill_code',
        world: 'lists',
        difficulty: 'easy',
        ageMin: 10,
        ageMax: 14,
        title: 'Acessando Item da Lista',
        prompt: 'Complete o código para mostrar "banana" (segundo item da lista): 🍌',
        starterCode: 'frutas = ["maçã", "banana", "laranja"]\nprint(frutas[___])',
        solutionTemplate: 'frutas = ["maçã", "banana", "laranja"]\nprint(frutas[1])',
        tests: [
            { input: null, expectedOutput: 'banana' }
        ],
        explanationKidFriendly: 'Como Python começa do zero, "maçã" está na posição 0, "banana" na posição 1, e "laranja" na posição 2. Por isso usamos frutas[1] para pegar banana!',
    },
    {
        id: 'lists_4',
        type: 'multiple_choice',
        world: 'lists',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'Adicionando à Lista',
        prompt: 'Qual método usamos para adicionar um item ao final de uma lista? ➕',
        options: ['append()', 'add()', 'insert()', 'push()'],
        answerIndex: 0,
        explanationKidFriendly: 'O método append() adiciona um item no final da lista. frutas.append("uva") coloca "uva" no final da lista de frutas!',
    },
    {
        id: 'lists_5',
        type: 'full_function',
        world: 'lists',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'Contando Itens',
        prompt: 'Crie uma função que conta quantos números pares tem em uma lista: 🔢',
        starterCode: 'def contar_pares(lista):\n    # Seu código aqui\n    pass',
        solutionTemplate: 'def contar_pares(lista):\n    contador = 0\n    for numero in lista:\n        if numero % 2 == 0:\n            contador = contador + 1\n    return contador',
        tests: [
            { input: [[1, 2, 3, 4, 5, 6]], expectedOutput: 3 },
            { input: [[1, 3, 5]], expectedOutput: 0 },
            { input: [[2, 4, 6, 8]], expectedOutput: 4 },
        ],
        explanationKidFriendly: 'Use um for para passar por cada número da lista. Para cada número, verifique se é par (numero % 2 == 0). Se for, adicione 1 ao contador!',
    },
];

// ============================================
// MUNDO: FUNÇÕES (functions)
// ============================================
const functionsQuestions: QuestionDocument[] = [
    {
        id: 'functions_1',
        type: 'multiple_choice',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        ageMax: 14,
        title: 'Criando Funções',
        prompt: 'Qual palavra usamos para criar uma função em Python? 🔧',
        options: ['def', 'function', 'create', 'make'],
        answerIndex: 0,
        explanationKidFriendly: 'A palavra "def" (de "define") é usada para criar funções! def saudacao(): cria uma função chamada "saudacao". É como criar sua própria receita de bolo!',
    },
    {
        id: 'functions_2',
        type: 'true_false',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        ageMax: 14,
        title: 'Return Devolve Valor',
        prompt: 'O comando "return" serve para a função devolver um resultado. Verdadeiro ou falso? 🎁',
        correctBool: true,
        explanationKidFriendly: 'Sim! Return é como a resposta da função. Se você pergunta "quanto é 2 + 2?", a função calcula e "return 4" devolve a resposta 4!',
    },
    {
        id: 'functions_3',
        type: 'fill_code',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        ageMax: 14,
        title: 'Função de Saudação',
        prompt: 'Complete a função para retornar "Olá, " seguido do nome: 👋',
        starterCode: 'def saudacao(nome):\n    ___ "Olá, " + nome',
        solutionTemplate: 'def saudacao(nome):\n    return "Olá, " + nome',
        tests: [
            { input: ['Maria'], expectedOutput: 'Olá, Maria' },
            { input: ['João'], expectedOutput: 'Olá, João' },
        ],
        explanationKidFriendly: 'Use return para devolver o resultado! O + junta textos: "Olá, " + "Maria" vira "Olá, Maria"!',
    },
    {
        id: 'functions_4',
        type: 'partial_function',
        world: 'functions',
        difficulty: 'medium',
        ageMin: 10,
        ageMax: 14,
        title: 'Calculadora de Área',
        prompt: 'Complete a função para calcular a área de um retângulo (base × altura): 📐',
        starterCode: 'def area_retangulo(base, altura):\n    area = base ___ altura\n    return area',
        solutionTemplate: 'def area_retangulo(base, altura):\n    area = base * altura\n    return area',
        tests: [
            { input: [5, 3], expectedOutput: 15 },
            { input: [10, 10], expectedOutput: 100 },
            { input: [2, 7], expectedOutput: 14 },
        ],
        explanationKidFriendly: 'A área de um retângulo é base vezes altura! Use o asterisco (*) para multiplicar os dois valores.',
    },
    {
        id: 'functions_5',
        type: 'full_function',
        world: 'functions',
        difficulty: 'hard',
        ageMin: 11,
        ageMax: 15,
        title: 'Maior Número',
        prompt: 'Crie uma função que encontra o maior número em uma lista: 🏆',
        starterCode: 'def maior_numero(lista):\n    # Seu código aqui\n    pass',
        solutionTemplate: 'def maior_numero(lista):\n    maior = lista[0]\n    for numero in lista:\n        if numero > maior:\n            maior = numero\n    return maior',
        tests: [
            { input: [[1, 5, 3, 9, 2]], expectedOutput: 9 },
            { input: [[10, 20, 15]], expectedOutput: 20 },
            { input: [[-5, -1, -10]], expectedOutput: -1 },
        ],
        explanationKidFriendly: 'Comece assumindo que o primeiro número é o maior. Depois, passe por cada número da lista. Se encontrar um maior, atualize! No fim, você terá o campeão!',
    },
];

// Exporta todas as questões organizadas
export const COMPLETE_QUESTIONS: QuestionDocument[] = [
    ...basicCommandsQuestions,
    ...numbersQuestions,
    ...conditionsQuestions,
    ...loopsQuestions,
    ...listsQuestions,
    ...functionsQuestions,
];

// Exporta questões por mundo para uso específico
export const QUESTIONS_BY_WORLD = {
    basic_commands: basicCommandsQuestions,
    numbers: numbersQuestions,
    conditions: conditionsQuestions,
    loops: loopsQuestions,
    lists: listsQuestions,
    functions: functionsQuestions,
};

// Estatísticas
export const QUESTIONS_STATS = {
    total: COMPLETE_QUESTIONS.length,
    byWorld: {
        basic_commands: basicCommandsQuestions.length,
        numbers: numbersQuestions.length,
        conditions: conditionsQuestions.length,
        loops: loopsQuestions.length,
        lists: listsQuestions.length,
        functions: functionsQuestions.length,
    },
    byType: {
        multiple_choice: COMPLETE_QUESTIONS.filter(q => q.type === 'multiple_choice').length,
        true_false: COMPLETE_QUESTIONS.filter(q => q.type === 'true_false').length,
        fill_code: COMPLETE_QUESTIONS.filter(q => q.type === 'fill_code').length,
        partial_function: COMPLETE_QUESTIONS.filter(q => q.type === 'partial_function').length,
        full_function: COMPLETE_QUESTIONS.filter(q => q.type === 'full_function').length,
    },
    byDifficulty: {
        easy: COMPLETE_QUESTIONS.filter(q => q.difficulty === 'easy').length,
        medium: COMPLETE_QUESTIONS.filter(q => q.difficulty === 'medium').length,
        hard: COMPLETE_QUESTIONS.filter(q => q.difficulty === 'hard').length,
    },
};
