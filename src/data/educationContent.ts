import type { WorldTutorial, Flashcard, QuestionHints } from '../types/education';

// ============================================
// TUTORIAIS INTERATIVOS DE CADA MUNDO
// ============================================

export const WORLD_TUTORIALS: WorldTutorial[] = [
    // ============================================
    // 🚀 PRIMEIROS PASSOS (basic_commands)
    // ============================================
    {
        worldId: 'basic_commands',
        title: 'Bem-vindo ao Python! 🐍',
        description: 'Aprenda seus primeiros comandos e comece a programar!',
        estimatedMinutes: 5,
        keyConcepts: ['print()', 'textos', 'aspas', 'comentários'],
        steps: [
            {
                icon: '👋',
                title: 'Olá, Programador!',
                content: 'Você está prestes a aprender Python, uma das linguagens de programação mais legais do mundo! Python é usado para criar jogos, aplicativos, robôs e até ensinar inteligência artificial!',
                animation: 'fadeIn',
            },
            {
                icon: '📢',
                title: 'Seu Primeiro Comando: print()',
                content: 'O comando print() é como um megafone para o computador. Tudo que você colocar dentro dos parênteses vai aparecer na tela!',
                code: 'print("Olá, mundo!")',
                output: 'Olá, mundo!',
                animation: 'typewriter',
            },
            {
                icon: '✏️',
                title: 'Textos Precisam de Aspas',
                content: 'Quando você escreve um texto em Python, precisa colocar ele entre aspas. Pode ser aspas duplas " " ou aspas simples \' \'. Assim o Python sabe que é um texto!',
                code: 'print("Eu amo programar!")\nprint(\'Python é demais!\')',
                output: 'Eu amo programar!\nPython é demais!',
                animation: 'slideUp',
            },
            {
                icon: '🧮',
                title: 'Python Sabe Matemática!',
                content: 'Você pode usar o Python como uma calculadora mágica! Se você colocar uma conta dentro do print(), ele calcula e mostra o resultado.',
                code: 'print(5 + 3)\nprint(10 - 4)\nprint(6 * 2)',
                output: '8\n6\n12',
                animation: 'bounce',
            },
            {
                icon: '📝',
                title: 'Comentários: Recadinhos Secretos',
                content: 'Linhas que começam com # são comentários. O Python ignora elas! É como escrever uma nota só para você ou outros programadores.',
                code: '# Isso é um comentário\nprint("Oi!") # isso também',
                output: 'Oi!',
                animation: 'fadeIn',
            },
            {
                icon: '🎉',
                title: 'Pronto para Começar!',
                content: 'Você aprendeu o básico! Agora é hora de praticar. Lembre-se: print() mostra na tela, textos ficam entre aspas, e # faz comentários. Boa sorte!',
                animation: 'bounce',
            },
        ],
    },

    // ============================================
    // 🔢 NÚMEROS MÁGICOS (numbers)
    // ============================================
    {
        worldId: 'numbers',
        title: 'Calculadora Mágica 🔢',
        description: 'Aprenda a fazer cálculos incríveis com Python!',
        estimatedMinutes: 5,
        keyConcepts: ['operações', '+', '-', '*', '/', '//', '%', '**'],
        steps: [
            {
                icon: '🧮',
                title: 'Python: Sua Calculadora Pessoal',
                content: 'Python é muito bom em matemática! Você pode fazer qualquer conta com ele, desde as mais simples até as mais complicadas.',
                animation: 'fadeIn',
            },
            {
                icon: '➕',
                title: 'Soma e Subtração',
                content: 'Use + para somar e - para subtrair. É igualzinho à matemática da escola!',
                code: 'print(10 + 5)  # soma\nprint(10 - 3)  # subtração',
                output: '15\n7',
                animation: 'slideUp',
            },
            {
                icon: '✖️',
                title: 'Multiplicação e Divisão',
                content: 'Use * para multiplicar e / para dividir. Cuidado: o resultado da divisão sempre tem pontinho!',
                code: 'print(4 * 5)   # multiplicação\nprint(10 / 2)  # divisão',
                output: '20\n5.0',
                animation: 'slideUp',
            },
            {
                icon: '🎯',
                title: 'Divisão Inteira e Resto',
                content: '// divide e ignora os decimais. % dá o resto da divisão. São super úteis!',
                code: 'print(7 // 2)  # divisão inteira\nprint(7 % 2)   # resto',
                output: '3\n1',
                animation: 'bounce',
            },
            {
                icon: '💪',
                title: 'Potência: O Super Poder!',
                content: 'Use ** para elevar um número a uma potência. 2 ** 3 significa 2 × 2 × 2!',
                code: 'print(2 ** 3)  # 2 elevado a 3\nprint(5 ** 2)  # 5 ao quadrado',
                output: '8\n25',
                animation: 'bounce',
            },
            {
                icon: '🎉',
                title: 'Mago da Matemática!',
                content: 'Agora você sabe fazer qualquer conta em Python! Pratique bastante e vire um mago dos números!',
                animation: 'fadeIn',
            },
        ],
    },

    // ============================================
    // 📦 VARIÁVEIS (variables)  
    // ============================================
    {
        worldId: 'variables',
        title: 'Caixinhas Mágicas 📦',
        description: 'Aprenda a guardar informações para usar depois!',
        estimatedMinutes: 6,
        keyConcepts: ['variáveis', 'atribuição', 'tipos', 'nomes'],
        steps: [
            {
                icon: '📦',
                title: 'O que é uma Variável?',
                content: 'Uma variável é como uma caixinha mágica! Você dá um nome para ela e pode guardar qualquer coisa dentro: números, textos, listas...',
                animation: 'fadeIn',
            },
            {
                icon: '✍️',
                title: 'Criando uma Variável',
                content: 'Para criar uma variável, escreva o nome, um sinal de igual (=) e o valor. É como colocar uma etiqueta na caixinha!',
                code: 'nome = "Maria"\nidade = 12\nprint(nome)\nprint(idade)',
                output: 'Maria\n12',
                animation: 'typewriter',
            },
            {
                icon: '🔄',
                title: 'Variáveis Podem Mudar',
                content: 'O legal é que você pode mudar o valor quando quiser! Por isso chama "variável" - o valor pode variar.',
                code: 'pontos = 10\nprint(pontos)\npontos = 20\nprint(pontos)',
                output: '10\n20',
                animation: 'slideUp',
            },
            {
                icon: '🧩',
                title: 'Juntando Textos',
                content: 'Use + para juntar textos! Você também pode misturar variáveis com textos para criar mensagens legais.',
                code: 'nome = "João"\nprint("Olá, " + nome + "!")',
                output: 'Olá, João!',
                animation: 'bounce',
            },
            {
                icon: '📏',
                title: 'Regras para Nomes',
                content: 'Nomes de variáveis podem ter letras, números e _. Mas não podem começar com número e não podem ter espaços!',
                code: '# CERTO:\nminha_idade = 10\nidade2 = 12\n\n# ERRADO:\n# 2idade = 10  (começa com número)\n# minha idade = 10  (tem espaço)',
                animation: 'fadeIn',
            },
            {
                icon: '🎉',
                title: 'Você Aprendeu Variáveis!',
                content: 'Agora você sabe guardar qualquer informação em variáveis! Isso é super importante para fazer programas mais complexos.',
                animation: 'bounce',
            },
        ],
    },

    // ============================================
    // 🔀 DECISÕES (conditions/decisions)
    // ============================================
    {
        worldId: 'conditions',
        title: 'Fazendo Escolhas 🔀',
        description: 'Aprenda a fazer o computador tomar decisões!',
        estimatedMinutes: 7,
        keyConcepts: ['if', 'else', 'elif', 'comparações', 'condições'],
        steps: [
            {
                icon: '🤔',
                title: 'Decisões no Dia a Dia',
                content: 'Todo dia você toma decisões: "SE está chovendo, levo guarda-chuva". O computador também pode fazer isso com o comando if!',
                animation: 'fadeIn',
            },
            {
                icon: '❓',
                title: 'O Comando if',
                content: 'if significa "se" em inglês. Usamos para fazer perguntas e executar código só se a resposta for verdadeira.',
                code: 'idade = 18\n\nif idade >= 18:\n    print("Maior de idade!")',
                output: 'Maior de idade!',
                animation: 'typewriter',
            },
            {
                icon: '🔍',
                title: 'Comparando Valores',
                content: 'Podemos comparar valores com: == (igual), != (diferente), > (maior), < (menor), >= (maior ou igual), <= (menor ou igual)',
                code: 'print(5 == 5)   # igual?\nprint(3 > 2)    # maior?\nprint(4 != 4)   # diferente?',
                output: 'True\nTrue\nFalse',
                animation: 'slideUp',
            },
            {
                icon: '🔄',
                title: 'Senão: O Plano B',
                content: 'Use else para dizer o que fazer quando a condição é falsa. É o seu plano B!',
                code: 'numero = 3\n\nif numero % 2 == 0:\n    print("Par")\nelse:\n    print("Ímpar")',
                output: 'Ímpar',
                animation: 'bounce',
            },
            {
                icon: '🎯',
                title: 'Várias Opções: elif',
                content: 'elif ("else if") permite testar várias condições. É como ter muitas portas para escolher!',
                code: 'nota = 85\n\nif nota >= 90:\n    print("A")\nelif nota >= 80:\n    print("B")\nelif nota >= 70:\n    print("C")\nelse:\n    print("D")',
                output: 'B',
                animation: 'slideUp',
            },
            {
                icon: '🎉',
                title: 'Mestre das Decisões!',
                content: 'Agora você sabe fazer o computador escolher caminhos diferentes! Use if, else e elif para criar programas inteligentes.',
                animation: 'bounce',
            },
        ],
    },

    // ============================================
    // 🔄 LOOPS (loops)
    // ============================================
    {
        worldId: 'loops',
        title: 'Repetindo Magias 🔄',
        description: 'Aprenda a repetir comandos sem escrever tudo de novo!',
        estimatedMinutes: 7,
        keyConcepts: ['for', 'range()', 'while', 'repetição', 'contador'],
        steps: [
            {
                icon: '♾️',
                title: 'Por que Repetir?',
                content: 'Imagine escrever "Oi!" 100 vezes... Cansativo, né? Com loops, você escreve uma vez e o computador repete quantas vezes quiser!',
                animation: 'fadeIn',
            },
            {
                icon: '🔁',
                title: 'O Loop for',
                content: 'for repete um bloco de código um número específico de vezes. É como um carrossel que gira várias voltas!',
                code: 'for i in range(3):\n    print("Oi!")',
                output: 'Oi!\nOi!\nOi!',
                animation: 'typewriter',
            },
            {
                icon: '🔢',
                title: 'Entendendo range()',
                content: 'range(5) gera números de 0 a 4 (5 números). range(1, 6) gera de 1 a 5. O último número nunca entra!',
                code: 'for i in range(1, 4):\n    print(i)',
                output: '1\n2\n3',
                animation: 'slideUp',
            },
            {
                icon: '📦',
                title: 'Loop em Listas',
                content: 'Você também pode usar for para percorrer cada item de uma lista!',
                code: 'frutas = ["maçã", "banana", "uva"]\n\nfor fruta in frutas:\n    print(fruta)',
                output: 'maçã\nbanana\nuva',
                animation: 'bounce',
            },
            {
                icon: '⏰',
                title: 'O Loop while',
                content: 'while repete ENQUANTO uma condição for verdadeira. Cuidado para não criar um loop infinito!',
                code: 'contador = 0\n\nwhile contador < 3:\n    print(contador)\n    contador = contador + 1',
                output: '0\n1\n2',
                animation: 'slideUp',
            },
            {
                icon: '🎉',
                title: 'Mestre dos Loops!',
                content: 'Loops são super poderosos! Use for quando sabe quantas vezes repetir, e while quando depende de uma condição.',
                animation: 'bounce',
            },
        ],
    },

    // ============================================
    // 📜 LISTAS (lists)
    // ============================================
    {
        worldId: 'lists',
        title: 'Organizando Tudo 📜',
        description: 'Aprenda a guardar muitas coisas numa única lista!',
        estimatedMinutes: 6,
        keyConcepts: ['lista', 'índice', 'append', 'len', 'acesso'],
        steps: [
            {
                icon: '📋',
                title: 'O que é uma Lista?',
                content: 'Listas são como mochilas onde você guarda várias coisas juntas! Pode ter números, textos, ou até outras listas dentro.',
                animation: 'fadeIn',
            },
            {
                icon: '✏️',
                title: 'Criando uma Lista',
                content: 'Use colchetes [ ] e separe os itens com vírgulas. Simples assim!',
                code: 'numeros = [1, 2, 3, 4, 5]\nfrutas = ["maçã", "banana", "uva"]\nprint(numeros)\nprint(frutas)',
                output: '[1, 2, 3, 4, 5]\n[\'maçã\', \'banana\', \'uva\']',
                animation: 'typewriter',
            },
            {
                icon: '🎯',
                title: 'Acessando Itens',
                content: 'Para pegar um item, use o índice entre colchetes. LEMBRE: Em Python, contamos a partir do 0!',
                code: 'frutas = ["maçã", "banana", "uva"]\nprint(frutas[0])  # primeiro\nprint(frutas[1])  # segundo\nprint(frutas[2])  # terceiro',
                output: 'maçã\nbanana\nuva',
                animation: 'slideUp',
            },
            {
                icon: '➕',
                title: 'Adicionando Itens',
                content: 'Use .append() para adicionar um item no final da lista!',
                code: 'cores = ["azul", "verde"]\ncores.append("vermelho")\nprint(cores)',
                output: "[\'azul\', \'verde\', \'vermelho\']",
                animation: 'bounce',
            },
            {
                icon: '📏',
                title: 'Contando Itens',
                content: 'len() te diz quantos itens tem na lista. Super útil!',
                code: 'numeros = [10, 20, 30, 40]\nprint(len(numeros))',
                output: '4',
                animation: 'fadeIn',
            },
            {
                icon: '🎉',
                title: 'Mestre das Listas!',
                content: 'Listas são essenciais em programação! Use elas para guardar e organizar muitos dados juntos.',
                animation: 'bounce',
            },
        ],
    },

    // ============================================
    // ✨ FUNÇÕES (functions)
    // ============================================
    {
        worldId: 'functions',
        title: 'Suas Próprias Magias ✨',
        description: 'Aprenda a criar funções reutilizáveis!',
        estimatedMinutes: 8,
        keyConcepts: ['def', 'parâmetros', 'return', 'reutilização'],
        steps: [
            {
                icon: '📖',
                title: 'O que é uma Função?',
                content: 'Funções são como receitas de bolo! Você escreve uma vez e pode usar quantas vezes quiser. Basta "chamar" pelo nome.',
                animation: 'fadeIn',
            },
            {
                icon: '✍️',
                title: 'Criando uma Função',
                content: 'Use def para definir uma função. Depois do nome, coloque parênteses e dois pontos. O código da função fica indentado!',
                code: 'def saudar():\n    print("Olá, mundo!")\n\nsaudar()  # chama a função',
                output: 'Olá, mundo!',
                animation: 'typewriter',
            },
            {
                icon: '📥',
                title: 'Parâmetros: As Entradas',
                content: 'Parâmetros são informações que você passa para a função. É como os ingredientes de uma receita!',
                code: 'def saudar(nome):\n    print("Olá, " + nome + "!")\n\nsaudar("Ana")\nsaudar("Pedro")',
                output: 'Olá, Ana!\nOlá, Pedro!',
                animation: 'slideUp',
            },
            {
                icon: '📤',
                title: 'return: A Saída',
                content: 'return devolve um resultado da função. É como o carteiro que entrega a resposta!',
                code: 'def dobro(numero):\n    return numero * 2\n\nresultado = dobro(5)\nprint(resultado)',
                output: '10',
                animation: 'bounce',
            },
            {
                icon: '🔧',
                title: 'Vários Parâmetros',
                content: 'Você pode ter quantos parâmetros quiser! Separe eles com vírgulas.',
                code: 'def soma(a, b):\n    return a + b\n\nprint(soma(3, 5))\nprint(soma(10, 20))',
                output: '8\n30',
                animation: 'slideUp',
            },
            {
                icon: '🎉',
                title: 'Criador de Funções!',
                content: 'Funções deixam seu código mais organizado e reutilizável. Crie suas próprias funções para problemas que se repetem!',
                animation: 'bounce',
            },
        ],
    },

    // ============================================
    // 📝 STRINGS (strings)
    // ============================================
    {
        worldId: 'strings',
        title: 'Mestre das Palavras 📝',
        description: 'Aprenda a manipular textos como um profissional!',
        estimatedMinutes: 7,
        keyConcepts: ['string', 'concatenação', 'métodos', 'f-string', 'fatiamento'],
        steps: [
            {
                icon: '💬',
                title: 'O que são Strings?',
                content: 'Strings são textos em Python. Tudo que está entre aspas é uma string, seja uma letra, uma palavra ou um livro inteiro!',
                animation: 'fadeIn',
            },
            {
                icon: '🔗',
                title: 'Juntando Textos',
                content: 'Use + para juntar (concatenar) strings. Você pode criar mensagens personalizadas!',
                code: 'nome = "Maria"\nmensagem = "Olá, " + nome + "!"\nprint(mensagem)',
                output: 'Olá, Maria!',
                animation: 'typewriter',
            },
            {
                icon: '✨',
                title: 'f-strings: A Forma Moderna',
                content: 'f-strings são mais fáceis! Coloque f antes das aspas e use {variavel} dentro do texto.',
                code: 'nome = "João"\nidade = 12\nprint(f"{nome} tem {idade} anos")',
                output: 'João tem 12 anos',
                animation: 'slideUp',
            },
            {
                icon: '🔧',
                title: 'Métodos de String',
                content: 'Strings têm superpoderes! Use .upper() para maiúsculas, .lower() para minúsculas, .replace() para trocar.',
                code: 'texto = "Python"\nprint(texto.upper())\nprint(texto.lower())\nprint(texto.replace("P", "J"))',
                output: 'PYTHON\npython\nJython',
                animation: 'bounce',
            },
            {
                icon: '✂️',
                title: 'Fatiando Strings',
                content: 'Você pode pegar partes de uma string usando [inicio:fim]. É como cortar um pedaço de bolo!',
                code: 'palavra = "Python"\nprint(palavra[0])     # primeira letra\nprint(palavra[0:3])   # primeiras 3\nprint(palavra[-1])    # última',
                output: 'P\nPyt\nn',
                animation: 'slideUp',
            },
            {
                icon: '🎉',
                title: 'Mestre das Strings!',
                content: 'Agora você sabe manipular textos de várias formas! Strings são essenciais para fazer programas que trabalham com palavras.',
                animation: 'bounce',
            },
        ],
    },
];

// ============================================
// FLASHCARDS DE REVISÃO
// ============================================

export const FLASHCARDS: Flashcard[] = [
    // Primeiros Passos
    { id: 'fc_basic_1', worldId: 'basic_commands', emoji: '📢', difficulty: 'easy', question: 'Qual comando mostra texto na tela?', answer: 'print()', codeExample: 'print("Olá!")' },
    { id: 'fc_basic_2', worldId: 'basic_commands', emoji: '✏️', difficulty: 'easy', question: 'Textos devem ficar entre...', answer: 'Aspas (simples ou duplas)', codeExample: '"texto" ou \'texto\'' },
    { id: 'fc_basic_3', worldId: 'basic_commands', emoji: '📝', difficulty: 'easy', question: 'O que linhas com # significam?', answer: 'São comentários (Python ignora elas)', codeExample: '# Isso é um comentário' },
    { id: 'fc_basic_4', worldId: 'basic_commands', emoji: '🧮', difficulty: 'easy', question: 'Python pode fazer contas?', answer: 'Sim! Python calcula e mostra resultados', codeExample: 'print(5 + 3)  # mostra 8' },

    // Números
    { id: 'fc_num_1', worldId: 'numbers', emoji: '➗', difficulty: 'easy', question: 'Qual símbolo divide em Python?', answer: '/ (barra)', codeExample: '10 / 2  # resultado: 5.0' },
    { id: 'fc_num_2', worldId: 'numbers', emoji: '✖️', difficulty: 'easy', question: 'Qual símbolo multiplica?', answer: '* (asterisco)', codeExample: '5 * 3  # resultado: 15' },
    { id: 'fc_num_3', worldId: 'numbers', emoji: '💪', difficulty: 'medium', question: 'Como fazer potência em Python?', answer: '** (dois asteriscos)', codeExample: '2 ** 3  # resultado: 8' },
    { id: 'fc_num_4', worldId: 'numbers', emoji: '🎯', difficulty: 'medium', question: 'O que % faz?', answer: 'Dá o resto da divisão', codeExample: '7 % 3  # resultado: 1' },

    // Variáveis
    { id: 'fc_var_1', worldId: 'variables', emoji: '📦', difficulty: 'easy', question: 'O que é uma variável?', answer: 'Uma "caixinha" que guarda valores', codeExample: 'nome = "Ana"' },
    { id: 'fc_var_2', worldId: 'variables', emoji: '=', difficulty: 'easy', question: 'Como criar uma variável?', answer: 'nome = valor', codeExample: 'idade = 10' },
    { id: 'fc_var_3', worldId: 'variables', emoji: '🔄', difficulty: 'easy', question: 'Variáveis podem mudar de valor?', answer: 'Sim! Por isso são "variáveis"', codeExample: 'x = 5\nx = 10' },
    { id: 'fc_var_4', worldId: 'variables', emoji: '🚫', difficulty: 'medium', question: 'Nomes de variáveis podem começar com número?', answer: 'Não! Só letras ou _', hint: 'idade2 OK, 2idade ERRADO' },

    // Decisões
    { id: 'fc_dec_1', worldId: 'conditions', emoji: '❓', difficulty: 'easy', question: 'O que "if" significa em Python?', answer: 'SE (uma condição for verdadeira)', codeExample: 'if idade >= 18:' },
    { id: 'fc_dec_2', worldId: 'conditions', emoji: '🔄', difficulty: 'easy', question: 'O que "else" significa?', answer: 'SENÃO (quando if é falso)', codeExample: 'else:\n    print("menor")' },
    { id: 'fc_dec_3', worldId: 'conditions', emoji: '==', difficulty: 'medium', question: 'Qual símbolo verifica igualdade?', answer: '== (dois iguais)', hint: '= é atribuição, == é comparação' },
    { id: 'fc_dec_4', worldId: 'conditions', emoji: '🎯', difficulty: 'medium', question: 'O que é elif?', answer: 'else if (outra condição)', codeExample: 'elif nota >= 80:' },

    // Loops
    { id: 'fc_loop_1', worldId: 'loops', emoji: '🔁', difficulty: 'easy', question: 'Para que serve o "for"?', answer: 'Repetir comandos várias vezes', codeExample: 'for i in range(5):' },
    { id: 'fc_loop_2', worldId: 'loops', emoji: '🔢', difficulty: 'easy', question: 'range(5) gera quais números?', answer: '0, 1, 2, 3, 4', hint: 'São 5 números, começando do 0' },
    { id: 'fc_loop_3', worldId: 'loops', emoji: '⏰', difficulty: 'medium', question: 'Qual a diferença de for e while?', answer: 'for: número fixo. while: condição', hint: 'while pode virar loop infinito!' },
    { id: 'fc_loop_4', worldId: 'loops', emoji: '🎯', difficulty: 'medium', question: 'range(1, 6) gera quais números?', answer: '1, 2, 3, 4, 5', hint: 'O último nunca entra!' },

    // Listas
    { id: 'fc_list_1', worldId: 'lists', emoji: '📋', difficulty: 'easy', question: 'Como criar uma lista?', answer: 'Com colchetes [ ]', codeExample: 'lista = [1, 2, 3]' },
    { id: 'fc_list_2', worldId: 'lists', emoji: '🎯', difficulty: 'easy', question: 'Qual o índice do primeiro item?', answer: '0 (zero)', codeExample: 'lista[0]  # primeiro' },
    { id: 'fc_list_3', worldId: 'lists', emoji: '➕', difficulty: 'medium', question: 'Como adicionar item numa lista?', answer: '.append()', codeExample: 'lista.append(4)' },
    { id: 'fc_list_4', worldId: 'lists', emoji: '📏', difficulty: 'easy', question: 'Como saber o tamanho de uma lista?', answer: 'len(lista)', codeExample: 'len([1,2,3])  # 3' },

    // Funções
    { id: 'fc_func_1', worldId: 'functions', emoji: '📖', difficulty: 'easy', question: 'Como começar uma função?', answer: 'Com "def"', codeExample: 'def minha_funcao():' },
    { id: 'fc_func_2', worldId: 'functions', emoji: '📤', difficulty: 'easy', question: 'Para que serve "return"?', answer: 'Devolver um resultado', codeExample: 'return resultado' },
    { id: 'fc_func_3', worldId: 'functions', emoji: '📥', difficulty: 'medium', question: 'O que são parâmetros?', answer: 'Valores que a função recebe', codeExample: 'def somar(a, b):' },
    { id: 'fc_func_4', worldId: 'functions', emoji: '🔧', difficulty: 'medium', question: 'Função sem return devolve...', answer: 'None (nada)', hint: 'Sempre use return se precisar do resultado' },

    // Strings
    { id: 'fc_str_1', worldId: 'strings', emoji: '🔗', difficulty: 'easy', question: 'Como juntar duas strings?', answer: 'Com + (mais)', codeExample: '"Olá" + " mundo"' },
    { id: 'fc_str_2', worldId: 'strings', emoji: '✨', difficulty: 'medium', question: 'O que é f-string?', answer: 'String com f antes, permite {variáveis}', codeExample: 'f"Olá, {nome}"' },
    { id: 'fc_str_3', worldId: 'strings', emoji: '🔠', difficulty: 'easy', question: 'Como deixar tudo maiúsculo?', answer: '.upper()', codeExample: '"abc".upper()  # ABC' },
    { id: 'fc_str_4', worldId: 'strings', emoji: '✂️', difficulty: 'medium', question: 'String[0] pega...', answer: 'A primeira letra', codeExample: '"Python"[0]  # P' },
];

// ============================================
// DICAS PROGRESSIVAS PADRÃO
// ============================================

/** Gera dicas padrão baseadas na questão */
export function generateDefaultHints(questionId: string, explanation: string): QuestionHints {
    // Divide a explicação em partes para criar dicas progressivas
    const words = explanation.split(' ');
    const third = Math.ceil(words.length / 3);

    return {
        questionId,
        hints: [
            {
                level: 1,
                text: 'Pense bem! Leia a pergunta com calma e tente lembrar do que você aprendeu no tutorial. 🤔',
                cost: 0, // Primeira dica é grátis
            },
            {
                level: 2,
                text: words.slice(0, third).join(' ') + '...',
                cost: 5, // Segunda dica custa 5 estrelas
            },
            {
                level: 3,
                text: explanation,
                cost: 10, // Terceira dica custa 10 estrelas (explicação completa)
            },
        ],
    };
}

/** Mapa de dicas customizadas por questão */
export const CUSTOM_HINTS: Record<string, QuestionHints> = {
    basic_1: {
        questionId: 'basic_1',
        hints: [
            { level: 1, text: 'Qual comando você aprendeu no tutorial para mostrar coisas na tela? 📺', cost: 0 },
            { level: 2, text: 'O comando começa com "pr" e termina com "int()". É como imprimir na tela!', cost: 5 },
            { level: 3, text: 'A resposta é print()! Usamos print("texto") para mostrar qualquer coisa na tela.', cost: 10 },
        ],
    },
    basic_3: {
        questionId: 'basic_3',
        hints: [
            { level: 1, text: 'Qual comando mostra texto na tela? 🖥️', cost: 0 },
            { level: 2, text: 'O comando é print(). Basta escrever print antes do parêntese.', cost: 5 },
            { level: 3, text: 'Complete com: print. O código fica: print("Olá, mundo!")', cost: 10 },
        ],
    },
    var_2: {
        questionId: 'var_2',
        hints: [
            { level: 1, text: 'Para criar uma variável, você só precisa escolher um nome! 📦', cost: 0 },
            { level: 2, text: 'O nome da variável deve ser "idade". Escreva: idade = 10', cost: 5 },
            { level: 3, text: 'A resposta é: idade. O código fica: idade = 10', cost: 10 },
        ],
    },
    dec_3: {
        questionId: 'dec_3',
        hints: [
            { level: 1, text: 'Qual palavra em Python significa "SE"? 🤔', cost: 0 },
            { level: 2, text: 'A palavra é "if". if idade >= 18: verifica se é maior de idade.', cost: 5 },
            { level: 3, text: 'Complete com: if. O código fica: if idade >= 18:', cost: 10 },
        ],
    },
    loop_3: {
        questionId: 'loop_3',
        hints: [
            { level: 1, text: 'Lembre-se: range não inclui o último número! 🔢', cost: 0 },
            { level: 2, text: 'Para ir até 5, você precisa colocar 6. Porque 6 não entra!', cost: 5 },
            { level: 3, text: 'A resposta é: 6. range(1, 6) gera 1, 2, 3, 4, 5.', cost: 10 },
        ],
    },
};

/** Obtém dicas para uma questão */
export function getHintsForQuestion(questionId: string, explanation: string): QuestionHints {
    return CUSTOM_HINTS[questionId] || generateDefaultHints(questionId, explanation);
}

/** Obtém tutorial de um mundo */
export function getTutorialByWorld(worldId: string): WorldTutorial | undefined {
    return WORLD_TUTORIALS.find(t => t.worldId === worldId);
}

/** Obtém flashcards de um mundo */
export function getFlashcardsByWorld(worldId: string): Flashcard[] {
    return FLASHCARDS.filter(f => f.worldId === worldId);
}
