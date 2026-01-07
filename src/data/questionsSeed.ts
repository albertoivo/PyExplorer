
import type { QuestionDocument } from '../types/question';

export const questionsSeed: QuestionDocument[] = [
    // ==========================================
    // MUNDO 1: COMANDOS BÁSICOS
    // ==========================================
    {
        id: 'basic_print_1',
        type: 'multiple_choice',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Falando com o Computador',
        prompt: 'Qual comando usamos para escrever uma mensagem na tela?',
        options: [
            'escrever("Olá")',
            'print("Olá")',
            'falar("Olá")',
            'msg("Olá")'
        ],
        answerIndex: 1,
        explanationKidFriendly: 'Em Python, usamos o comando `print()` (que significa "imprimir" em inglês) para mostrar textos na tela!',
        points: 10
    },
    {
        id: 'basic_math_1',
        type: 'fill_code',
        world: 'basic_commands',
        difficulty: 'easy',
        ageMin: 8,
        title: 'Calculadora Mágica',
        prompt: 'Complete o código para somar 5 mais 3.',
        starterCode: 'resultado = 5 __ 3\nprint(resultado)',
        solutionTemplate: 'resultado = 5 + 3\nprint(resultado)',
        tests: [
            { input: null, expectedOutput: '8' }
        ],
        explanationKidFriendly: 'Usamos o sinal de `+` para fazer contas de mais, igualzinho na escola!',
        points: 15
    },

    // ==========================================
    // MUNDO: TURTLE (Carregado como tema especial ou dentro de loops)
    // Vamos colocar como 'basic_commands' ou 'loops' dependendo
    // ==========================================
    {
        id: 'turtle_square_1',
        type: 'turtle_challenge',
        world: 'basic_commands',
        difficulty: 'medium',
        ageMin: 9,
        title: 'Desenhando um Quadrado',
        prompt: 'Ajude a tartaruga a desenhar um quadrado! Ela precisa andar 100 passos e virar 90 graus para a direita, 4 vezes.',
        starterCode: `# Nossa tartaruga começa aqui
import turtle

# Tente usar um loop for depois!
turtle.forward(100)
turtle.right(90)
# Continue o código...
`,
        explanationKidFriendly: 'Um quadrado tem 4 lados iguais. Então a tartaruga precisa andar e virar 4 vezes!',
        points: 20
    },

    // ==========================================
    // MUNDO: LOOPS
    // ==========================================
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
        explanationKidFriendly: 'Para fechar um triângulo, a tartaruga precisa girar um total de 360 graus. Como são 3 giros, cada um é 360 dividido por 3 = 120 graus!',
        points: 30
    },

    // ==========================================
    // MUNDO: DECISÕES (Conditions)
    // ==========================================
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

    // ==========================================
    // MUNDO: FUNÇÕES
    // ==========================================
    {
        id: 'func_full_double',
        type: 'full_function',
        world: 'functions',
        difficulty: 'easy',
        ageMin: 10,
        title: 'O Dobro de Tudo',
        prompt: 'Crie uma função chamada "dobro" que recebe um número e retorna esse número multiplicado por 2.',
        starterCode: `def dobro(numero):
    # Seu código aqui
    return ___
`,
        functionName: 'dobro',
        tests: [
            { input: 2, expectedOutput: 4 },
            { input: 5, expectedOutput: 10 },
            { input: 100, expectedOutput: 200 }
        ],
        explanationKidFriendly: 'Funções são receitas. Recebem ingredientes (parâmetros) e entregam um prato (retorno). Aqui, queremos entregar o número vezes 2!',
        points: 25
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
