
import type { QuestionDocument } from '../types/question';

/**
 * PRODUCTION QUESTIONS FILE
 *
 * This file consolidates all questions from previous mock/seed files.
 * It is the single source of truth for the Firestore seed.
 */

// ============================================
// MUNDO 1: PRIMEIROS PASSOS (basic_commands)
// ============================================
const basicCommandsQuestions: QuestionDocument[] = [
    {
        id: 'basic_1',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Qual comando mostra texto na tela?',
        prompt: 'Em Python, qual é o comando mágico que usamos para mostrar uma mensagem na tela?',
        options: [
            'print()',
            'show()',
            'display()',
            'write()',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'O comando print() é como um megafone para o computador! Tudo que você colocar dentro dos parênteses vai aparecer na tela. Por exemplo: print("Olá!") mostra "Olá!" na tela.',
        points: 10,
    },
    {
        id: 'basic_2',
        type: 'true_false',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Textos precisam de aspas',
        prompt: 'Para escrever um texto em Python, precisamos colocar ele entre aspas. Por exemplo: "Olá mundo"',
        correctBool: true,
        explanationKidFriendly: 'Isso mesmo! Textos em Python ficam entre aspas (pode ser "aspas duplas" ou \'aspas simples\'). Assim o Python sabe que é um texto e não um comando!',
        points: 10,
    },
    {
        id: 'basic_3',
        type: 'fill_code',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Complete o código para dizer "Olá"',
        prompt: 'Complete o código abaixo para mostrar "Olá, mundo!" na tela:',
        starterCode: '# Complete o código abaixo\n___("Olá, mundo!")',
        solutionTemplate: 'print("Olá, mundo!")',
        tests: [
            { input: null, expectedOutput: 'Olá, mundo!' },
        ],
        explanationKidFriendly: 'Usamos print() para mostrar coisas na tela! É o primeiro comando que todo programador aprende. Agora você sabe escrever mensagens para o mundo todo ver! 🌍',
        points: 15,
    },
    {
        id: 'basic_4',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'O que aparece na tela?',
        prompt: 'Se rodarmos este código, o que vai aparecer?\n\nprint(5 + 3)',
        starterCode: 'print(5 + 3)',
        options: [
            '8',
            '5 + 3',
            '"5 + 3"',
            'Nada',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'Python é muito esperto! Quando pedimos para ele calcular 5 + 3, ele faz a conta e mostra o resultado: 8! Python pode ser sua calculadora pessoal! 🧮',
        points: 10,
    },
    {
        id: 'basic_5',
        type: 'true_false',
        world: 'basic_commands',
        difficulty: 'medium',
        ageMin: 9,
        title: 'Comentários são executados',
        prompt: 'Linhas que começam com # são comentários e NÃO são executadas pelo Python.',
        starterCode: '# Isso é um comentário\nprint("Olá!")',
        correctBool: true,
        explanationKidFriendly: 'Linhas com # são recadinhos para você ou outros programadores, mas o Python ignora elas! É como escrever uma nota no caderno que só você vai ler. 📝',
        points: 15,
    },
    // TURTLE CHALLENGE
    {
        id: 'turtle_1',
        type: 'turtle_challenge',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Desenhando um Quadrado',
        prompt: 'Vamos desenhar um quadrado! Use o comando forward(100) e right(90) para fazer as 4 linhas.',
        starterCode: '# Desenhe um quadrado\nforward(100)\nright(90)\n',
        solutionCode: 'forward(100)\nright(90)\nforward(100)\nright(90)\nforward(100)\nright(90)\nforward(100)\nright(90)',
        explanationKidFriendly: 'Um quadrado tem 4 lados iguais e 4 cantos de 90 graus. Repetindo andar e virar 4 vezes, fechamos o quadrado! ⏹️',
        points: 20,
    },
    // PARSONS PROBLEM (New Addition from seed)
    {
        id: 'basic_parsons_1',
        type: 'parsons_problem',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Ordem do Print',
        prompt: 'Coloque os blocos na ordem para mostrar: "Olá" e depois "Mundo".',
        parsonsSegments: [
            'print("Olá")',
            'print("Mundo")',
        ],
        tests: [
            { input: null, expectedOutput: 'Olá\nMundo' }
        ],
        explanationKidFriendly: 'O Python lê o código de cima para baixo! Primeiro o "Olá", depois o "Mundo".',
        points: 15
    }
];

// ============================================
// MUNDO 2: VARIÁVEIS (variables)
// ============================================
const variablesQuestions: QuestionDocument[] = [
    {
        id: 'var_1',
        type: 'multiple_choice',
        world: 'variables',
        difficulty: 'easy',
        ageMin: 9,
        title: 'O que é uma variável?',
        prompt: 'Uma variável em Python é como uma...',
        options: [
            'Caixinha que guarda informações',
            'Um tipo de matemática difícil',
            'Um comando para apagar dados',
            'Uma senha secreta',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'Variáveis são como caixinhas mágicas! 📦 Você dá um nome pra ela e pode guardar qualquer coisa dentro: números, textos, listas... E depois pode usar quando quiser!',
        points: 10,
    },
    {
        id: 'var_2',
        type: 'fill_code',
        world: 'variables',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Crie uma variável',
        prompt: 'Crie uma variável chamada "idade" com o valor 10:',
        starterCode: '# Crie a variável idade com valor 10\n___ = 10\nprint(idade)',
        solutionTemplate: 'idade = 10',
        tests: [
            { input: null, expectedOutput: '10' },
        ],
        explanationKidFriendly: 'Para criar uma variável, basta escrever o nome dela, um sinal de igual (=) e o valor! idade = 10 significa: "crie uma caixinha chamada idade e guarde 10 dentro dela".',
        points: 15,
    },
    {
        id: 'var_3',
        type: 'true_false',
        world: 'variables',
        difficulty: 'medium',
        ageMin: 9,
        title: 'Variáveis podem mudar',
        prompt: 'Depois de criar uma variável, podemos mudar o valor dela a qualquer momento.',
        correctBool: true,
        explanationKidFriendly: 'Por isso chamamos de "variável"! O valor pode variar. É como uma caixinha que você pode esvaziar e colocar outra coisa dentro quando quiser. 🔄',
        points: 15,
    },
    {
        id: 'var_4',
        type: 'multiple_choice',
        world: 'variables',
        difficulty: 'medium',
        ageMin: 10,
        title: 'O que esse código mostra?',
        prompt: 'O que aparece na tela quando rodamos este código?\n\nnome = "Ana"\nprint("Olá, " + nome)',
        starterCode: 'nome = "Ana"\nprint("Olá, " + nome)',
        options: [
            'Olá, Ana',
            'Olá, nome',
            '"Olá, " + nome',
            'Erro',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'O + junta textos! Python substituí "nome" pelo valor guardado ("Ana") e junta com "Olá, ". Resultado: "Olá, Ana"! É como montar um quebra-cabeça de palavras! 🧩',
        points: 15,
    },
    {
        id: 'var_5',
        type: 'fill_code',
        world: 'variables',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Guardando e mostrando',
        prompt: 'Complete o código para guardar seu nome e mostrar uma saudação:',
        starterCode: 'nome = "___"\nprint("Bem-vindo, " + nome)',
        solutionTemplate: 'nome = "Python"',
        tests: [
            { input: null, expectedOutput: 'Bem-vindo, Python' },
        ],
        explanationKidFriendly: 'Variáveis guardam valores que podemos usar depois! É só escolher um nome, usar = e colocar o valor. Depois é só usar o nome da variável!',
        points: 20,
    },
];

// ============================================
// MUNDO 3: NÚMEROS (numbers)
// ============================================
const numbersQuestions: QuestionDocument[] = [
    {
        id: 'num_1',
        type: 'multiple_choice',
        world: 'numbers',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Soma em Python',
        prompt: 'Qual símbolo usamos para somar dois números?',
        options: ['+', 'x', '&', '@'],
        answerIndex: 0,
        explanationKidFriendly: 'O + funciona igual na matemática! 5 + 3 = 8. Python é sua calculadora pessoal! 🧮',
        points: 10,
    },
    {
        id: 'num_2',
        type: 'true_false',
        world: 'numbers',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Multiplicação com asterisco',
        prompt: 'Em Python, usamos o asterisco (*) para multiplicar números.',
        correctBool: true,
        explanationKidFriendly: 'Isso! O asterisco (*) é a multiplicação. 4 * 3 = 12. Diferente do x do caderno, mas faz a mesma coisa! ✖️',
        points: 10,
    },
    {
        id: 'num_3',
        type: 'fill_code',
        world: 'numbers',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Calcule a idade futura',
        prompt: 'Complete o código para calcular a idade daqui a 5 anos:',
        starterCode: 'idade = 10\nidade_futura = idade ___ 5\nprint(idade_futura)',
        solutionTemplate: 'idade_futura = idade + 5',
        tests: [
            { input: null, expectedOutput: '15' },
        ],
        explanationKidFriendly: 'Para calcular a idade futura, some a idade atual com os anos! 10 + 5 = 15! 🎂',
        points: 15,
    },
    {
        id: 'num_4',
        type: 'multiple_choice',
        world: 'numbers',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Divisão em Python',
        prompt: 'Qual é o resultado de 10 / 2 em Python?',
        options: ['5.0', '5', '2', 'Erro'],
        answerIndex: 0,
        explanationKidFriendly: 'A divisão com / sempre dá número com ponto! 10 / 2 = 5.0. Para número inteiro, use // (dois tracinhos).',
        points: 15,
    },
    {
        id: 'num_5',
        type: 'fill_code',
        world: 'numbers',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Calcule o dobro',
        prompt: 'Complete para calcular o dobro de um número:',
        starterCode: 'numero = 7\ndobro = numero ___ 2\nprint(dobro)',
        solutionTemplate: 'dobro = numero * 2',
        tests: [
            { input: null, expectedOutput: '14' },
        ],
        explanationKidFriendly: 'O dobro é multiplicar por 2! 7 * 2 = 14! ✌️',
        points: 20,
    },
    // PARSONS PROBLEM
    {
        id: 'num_parsons_avg',
        type: 'parsons_problem',
        world: 'numbers',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Calculando a Média',
        prompt: 'Organize o código para calcular a média de 3 notas.',
        parsonsSegments: [
            'nota1 = 8',
            'nota2 = 9',
            'nota3 = 7',
            'media = (nota1 + nota2 + nota3) / 3',
            'print(media)'
        ],
        tests: [
            { input: null, expectedOutput: '8.0' }
        ],
        explanationKidFriendly: 'Primeiro definimos as notas, depois somamos e dividimos por 3 para achar a média!',
        points: 20
    }
];

// ============================================
// MUNDO 4: DECISÕES (conditions)
// ============================================
const conditionsQuestions: QuestionDocument[] = [
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

// ============================================
// MUNDO 5: LOOPS (loops)
// ============================================
const loopsQuestions: QuestionDocument[] = [
    {
        id: 'loop_1',
        type: 'multiple_choice',
        world: 'loops',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Para que serve o for?',
        prompt: 'O comando "for" em Python é usado para...',
        options: [
            'Repetir algo várias vezes',
            'Fazer perguntas',
            'Criar variáveis',
            'Apagar arquivos',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'for é um loop! Ele repete comandos várias vezes sem você ter que escrever tudo de novo. É como uma máquina do tempo que faz o mesmo passo várias vezes! ⏰',
        points: 10,
    },
    {
        id: 'loop_2',
        type: 'true_false',
        world: 'loops',
        difficulty: 'easy',
        ageMin: 9,
        title: 'range(5) vai de 0 a 4',
        prompt: 'O comando range(5) gera os números de 0 até 4 (cinco números no total).',
        correctBool: true,
        explanationKidFriendly: 'range(5) cria: 0, 1, 2, 3, 4. São 5 números, mas começa no 0! Em programação, quase tudo começa do zero. É como um elevador que tem andar 0! 🏢',
        points: 10,
    },
    {
        id: 'loop_3',
        type: 'fill_code',
        world: 'loops',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Conte até 5',
        prompt: 'Complete o código para mostrar os números de 1 até 5:',
        starterCode: 'for i in range(1, ___):\n    print(i)',
        solutionTemplate: 'for i in range(1, 6):',
        tests: [
             { input: null, expectedOutput: '1\n2\n3\n4\n5' }
        ],
        explanationKidFriendly: 'range(1, 6) vai de 1 até 5! O último número não entra, então para ir até 5, precisa ser 6. É como uma fila que não inclui a pessoa que está segurando a placa! 🪧',
        points: 20,
    },
    {
        id: 'loop_4',
        type: 'multiple_choice',
        world: 'loops',
        difficulty: 'medium',
        ageMin: 10,
        title: 'While repete enquanto...',
        prompt: 'O comando "while" repete algo enquanto uma condição for...',
        options: ['Verdadeira', 'Falsa', 'Zero', 'Negativa'],
        answerIndex: 0,
        explanationKidFriendly: 'While significa "enquanto"! Repete enquanto a condição for verdadeira. Quando fica falsa, para! 🔁',
        points: 15,
    },
    {
        id: 'loop_5',
        type: 'fill_code',
        world: 'loops',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Soma com loop',
        prompt: 'Complete o código para somar os números de 1 até 5:',
        starterCode: 'soma = 0\nfor i in range(1, 6):\n    soma = soma ___ i\nprint(soma)',
        solutionTemplate: 'soma = soma + i',
        tests: [
            { input: null, expectedOutput: '15' },
        ],
        explanationKidFriendly: 'Some cada número! 1+2+3+4+5 = 15. O loop faz isso automaticamente! ➕',
        points: 25,
    },
    {
        id: 'loop_parsons_1',
        type: 'parsons_problem',
        world: 'loops',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Repetindo Coisas',
        prompt: 'Coloque os blocos na ordem certa para imprimir os números de 0 a 4.',
        parsonsSegments: [
            'for i in range(5):',
            '    print(i)',
            'print("Fim do loop!")'
        ],
        tests: [
            { input: null, expectedOutput: '0\n1\n2\n3\n4\nFim do loop!' }
        ],
        explanationKidFriendly: 'Primeiro começamos o loop com `for`. Tudo que queremos repetir (como o `print(i)`) precisa estar "dentro" do loop (com espaço na frente). O que não repete fica fora!',
        points: 20
    },
    {
        id: 'turtle_triangle_loop',
        type: 'turtle_challenge',
        world: 'loops',
        difficulty: 'hard',
        ageMin: 10,
        title: 'Triângulo Repetido',
        prompt: 'Use um loop "for" para desenhar um triângulo. (Dica: Um triângulo tem 3 lados e o ângulo externo é 120 graus).',
        starterCode: `import turtle

# Escreva um loop que repita 3 vezes
for i in range(___):
    turtle.forward(100)
    turtle.left(___) # Qual o ângulo do triângulo?
`,
        solutionCode: 'for i in range(3):\n    turtle.forward(100)\n    turtle.left(120)',
        explanationKidFriendly: 'Para fechar um triângulo, a tartaruga precisa girar um total de 360 graus. Como são 3 giros, cada um é 360 dividido por 3 = 120 graus!',
        points: 30
    },
];

// ============================================
// MUNDO 6: FUNÇÕES (functions)
// ============================================
const functionsQuestions: QuestionDocument[] = [
    {
        id: 'func_1',
        type: 'multiple_choice',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        title: 'O que é uma função?',
        prompt: 'Uma função em Python é...',
        options: [
            'Um bloco de código que podemos reutilizar',
            'Um tipo de variável especial',
            'Um comando para deletar arquivos',
            'O mesmo que um número',
        ],
        answerIndex: 0,
        explanationKidFriendly: 'Funções são como receitas! 📖 Você escreve uma vez e pode usar quantas vezes quiser. Basta "chamar" a função pelo nome que ela faz todo o trabalho!',
        points: 10,
    },
    {
        id: 'func_2',
        type: 'true_false',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        title: 'return devolve um valor',
        prompt: 'O comando return serve para devolver um resultado da função.',
        correctBool: true,
        explanationKidFriendly: 'return é como o carteiro da função! Ele pega o resultado e entrega pra quem chamou a função. Sem return, a função não devolve nada! 📬',
        points: 10,
    },
    {
        id: 'func_3',
        type: 'full_function',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Dobrar um número',
        prompt: 'Crie uma função chamada "dobro" que recebe um número e retorna o dobro dele.',
        starterCode: 'def dobro(numero):\n    # seu código aqui\n    pass',
        functionName: 'dobro',
        tests: [
            { input: 5, expectedOutput: 10 },
            { input: 3, expectedOutput: 6 },
            { input: 0, expectedOutput: 0 },
            { input: -2, expectedOutput: -4 },
        ],
        explanationKidFriendly: 'Dobrar é multiplicar por 2! Então basta retornar numero * 2. Simples assim! ✌️',
        points: 15,
    },
    {
        id: 'func_4',
        type: 'full_function',
        world: 'functions',
        difficulty: 'medium',
        ageMin: 11,
        title: 'Saudação personalizada',
        prompt: 'Crie uma função chamada "saudar" que recebe um nome e retorna "Olá, <nome>!".',
        starterCode: 'def saudar(nome):\n    # seu código aqui\n    pass',
        functionName: 'saudar',
        tests: [
            { input: 'Ana', expectedOutput: 'Olá, Ana!' },
            { input: 'Pedro', expectedOutput: 'Olá, Pedro!' },
            { input: 'Python', expectedOutput: 'Olá, Python!' },
        ],
        explanationKidFriendly: 'Use f-strings para montar o texto: f"Olá, {nome}!" ou junte textos com +: "Olá, " + nome + "!". As duas formas funcionam! 👋',
        points: 20,
    },
    {
        id: 'func_5',
        type: 'full_function',
        world: 'functions',
        difficulty: 'hard',
        ageMin: 12,
        title: 'Soma até N',
        prompt: 'Crie uma função chamada "soma_ate" que soma todos os números de 1 até n.',
        starterCode: 'def soma_ate(n):\n    # seu código aqui\n    pass',
        functionName: 'soma_ate',
        tests: [
            { input: 5, expectedOutput: 15 },
            { input: 3, expectedOutput: 6 },
            { input: 10, expectedOutput: 55 },
            { input: 1, expectedOutput: 1 },
        ],
        explanationKidFriendly: 'Use um for loop de 1 até n e vá somando! Comece com soma = 0 e adicione cada número. ➕',
        points: 30,
    },
    {
        id: 'func_parsons_greet',
        type: 'parsons_problem',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 9,
        title: 'Saudação Educada',
        prompt: 'Monte a função que dá bom dia para uma pessoa.',
        parsonsSegments: [
            'def saudacao(nome):',
            '    mensagem = "Bom dia, " + nome',
            '    return mensagem',
            'print(saudacao("Ana"))'
        ],
        tests: [
            { input: null, expectedOutput: 'Bom dia, Ana' }
        ],
        explanationKidFriendly: 'Definimos a função primeiro e depois a usamos (chamamos) no final.',
        points: 20
    }
];

// ============================================
// MUNDO 7: LISTAS (lists)
// ============================================
const listsQuestions: QuestionDocument[] = [
    {
        id: 'list_1',
        type: 'multiple_choice',
        world: 'lists',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Criando uma lista',
        prompt: 'Qual símbolo usamos para criar uma lista em Python?',
        options: ['[ ]', '( )', '{ }', '< >'],
        answerIndex: 0,
        explanationKidFriendly: 'Listas usam colchetes [ ]! frutas = ["maçã", "banana"] guarda duas frutas numa lista! 📋',
        points: 10,
    },
    {
        id: 'list_2',
        type: 'true_false',
        world: 'lists',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Primeiro item é zero',
        prompt: 'Em Python, o primeiro item de uma lista tem posição 0 (não 1).',
        correctBool: true,
        explanationKidFriendly: 'Python começa do zero! frutas[0] é o primeiro item, frutas[1] é o segundo. 🎯',
        points: 10,
    },
    {
        id: 'list_3',
        type: 'fill_code',
        world: 'lists',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Pegue o segundo item',
        prompt: 'Complete para mostrar "banana" (segundo item):',
        starterCode: 'frutas = ["maçã", "banana", "laranja"]\nprint(frutas[___])',
        solutionTemplate: 'print(frutas[1])',
        tests: [
            { input: null, expectedOutput: 'banana' },
        ],
        explanationKidFriendly: 'Posição 0 é maçã, posição 1 é banana, posição 2 é laranja! 🍌',
        points: 15,
    },
    {
        id: 'list_4',
        type: 'multiple_choice',
        world: 'lists',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Adicionar à lista',
        prompt: 'Qual método adiciona um item ao final da lista?',
        options: ['append()', 'add()', 'insert()', 'push()'],
        answerIndex: 0,
        explanationKidFriendly: 'append() adiciona no final! frutas.append("uva") coloca uva no fim da lista! ➕',
        points: 15,
    },
    {
        id: 'list_5',
        type: 'full_function',
        world: 'lists',
        difficulty: 'medium',
        ageMin: 11,
        title: 'Contar pares na lista',
        prompt: 'Crie uma função que conta quantos números pares tem na lista.',
        starterCode: 'def contar_pares(lista):\n    # seu código aqui\n    pass',
        functionName: 'contar_pares',
        tests: [
            { input: [[1, 2, 3, 4]], expectedOutput: 2 },
            { input: [[2, 4, 6]], expectedOutput: 3 },
            { input: [[1, 3, 5]], expectedOutput: 0 },
        ],
        explanationKidFriendly: 'Use for para passar por cada número. Se numero % 2 == 0, é par! Conte quantos são. 🔢',
        points: 25,
    },
];

// ============================================
// MUNDO 8: STRINGS (strings)
// ============================================
const stringsQuestions: QuestionDocument[] = [
    {
        id: 'strings_1',
        type: 'multiple_choice',
        world: 'strings',
        difficulty: 'easy',
        ageMin: 10,
        title: 'O que é uma String?',
        prompt: 'Uma string em Python é... 📝',
        options: ['Um texto', 'Um número', 'Uma lista', 'Uma função'],
        answerIndex: 0,
        explanationKidFriendly: 'String é o nome que damos para textos em programação! "Olá, mundo!" é uma string. Sempre fica entre aspas!',
        points: 10,
    },
    {
        id: 'strings_2',
        type: 'true_false',
        world: 'strings',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Juntando Strings',
        prompt: 'Podemos usar o + para juntar duas strings. Verdadeiro ou falso? ➕',
        correctBool: true,
        explanationKidFriendly: 'Sim! "Olá, " + "mundo!" dá "Olá, mundo!". É como grudar dois pedaços de papel!',
        points: 10,
    },
    {
        id: 'strings_3',
        type: 'fill_code',
        world: 'strings',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Maiúsculas',
        prompt: 'Complete o código para transformar o texto em maiúsculas: 🔠',
        starterCode: 'texto = "python"\nprint(texto.___())',
        solutionTemplate: 'texto = "python"\nprint(texto.upper())',
        tests: [
            { input: null, expectedOutput: 'PYTHON' }
        ],
        explanationKidFriendly: 'O método upper() transforma todas as letras em MAIÚSCULAS! É como gritar o texto! 📢',
        points: 15,
    },
    {
        id: 'strings_4',
        type: 'multiple_choice',
        world: 'strings',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Tamanho da String',
        prompt: 'Qual função usamos para descobrir quantas letras tem em uma string? 📏',
        options: ['len()', 'size()', 'count()', 'length()'],
        answerIndex: 0,
        explanationKidFriendly: 'A função len() conta quantos caracteres tem na string. len("Python") dá 6, porque Python tem 6 letras!',
        points: 15,
    },
    {
        id: 'strings_5',
        type: 'full_function',
        world: 'strings',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Contando Vogais',
        prompt: 'Crie uma função que conta quantos vogais (a, e, i, o, u) tem em uma palavra: 🔤',
        starterCode: 'def contar_vogais(texto):\n    # Seu código aqui\n    pass',
        functionName: 'contar_vogais',
        tests: [
            { input: ['Python'], expectedOutput: 1 },
            { input: ['banana'], expectedOutput: 3 },
            { input: ['xyz'], expectedOutput: 0 },
        ],
        solutionTemplate: 'def contar_vogais(texto):\n    vogais = "aeiouAEIOU"\n    contador = 0\n    for letra in texto:\n        if letra in vogais:\n            contador = contador + 1\n    return contador',
        explanationKidFriendly: 'Passe por cada letra do texto com um for. Se a letra estiver na lista de vogais, adicione 1 ao contador!',
        points: 30,
    },
];

export const ALL_QUESTIONS: QuestionDocument[] = [
    ...basicCommandsQuestions,
    ...variablesQuestions,
    ...numbersQuestions,
    ...conditionsQuestions,
    ...loopsQuestions,
    ...functionsQuestions,
    ...listsQuestions,
    ...stringsQuestions,
];
