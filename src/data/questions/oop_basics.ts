import type { QuestionDocument } from '../../types/question';

export const oopBasicsQuestions: QuestionDocument[] = [
    {
        id: 'oop_01',
        type: 'multiple_choice',
        world: 'oop_basics',
        difficulty: 'easy',
        ageMin: 9,
        title: 'O Molde dos Objetos',
        prompt: 'Em Programação Orientada a Objetos, qual palavra usamos para criar o "molde" ou "blueprint" de um objeto?',
        options: ['class', 'def', 'object', 'blueprint'],
        answerIndex: 0,
        explanationKidFriendly: 'Uma "class" é como uma forma de biscoito! Ela define a forma e a receita, e os objetos são os biscoitos prontos.',
        points: 40,
    },
    {
        id: 'oop_02',
        type: 'fill_code',
        world: 'oop_basics',
        difficulty: 'easy',
        ageMin: 9,
        title: 'O Construtor Mágico',
        prompt: 'O método especial que inicializa um objeto quando ele nasce é chamado de `__init__`. Complete o parâmetro obrigatório que representa o próprio objeto:',
        starterCode: 'class Heroi:\n    def __init__(____, nome):\n        ____.nome = nome',
        solutionTemplate: 'class Heroi:\n    def __init__(self, nome):\n        self.nome = nome',
        tests: [
            {
                input: null,
                expectedOutput: '',
                description: 'Define self corretamente'
            }
        ],
        explanationKidFriendly: 'self significa "eu mesmo"! É assim que o objeto sabe quais são suas próprias características e atributos.',
        points: 50,
    },
    {
        id: 'oop_03',
        type: 'parsons_problem',
        world: 'oop_basics',
        difficulty: 'medium',
        ageMin: 10,
        title: 'Criando um Pet Virtual',
        prompt: 'Ordene o código para definir a classe `Pet` e criar um cachorro chamado "Rex":',
        parsonsSegments: [
            'class Pet:',
            '    def __init__(self, nome):',
            '        self.nome = nome',
            'meu_pet = Pet("Rex")'
        ],
        explanationKidFriendly: 'Criar um objeto a partir da classe é chamado de "instanciação". meu_pet agora é um objeto de verdade!',
        points: 60,
    },
    {
        id: 'oop_04',
        type: 'full_function',
        world: 'oop_basics',
        difficulty: 'hard',
        ageMin: 10,
        title: 'O Robô que se Apresenta',
        prompt: 'Crie uma classe `Robo` que recebe `nome` no `__init__` e tem um método `falar()` que retorna `"Eu sou o robô " + self.nome`. Crie uma função `testar_robo(nome)` que retorna essa saudação!',
        starterCode: 'class Robo:\n    def __init__(self, nome):\n        self.nome = nome\n    def falar(self):\n        return "Eu sou o robô " + self.nome\n\n# implemente sua função aqui\n\nprint(testar_robo("R2D2"))',
        solutionCode: 'class Robo:\n    def __init__(self, nome):\n        self.nome = nome\n    def falar(self):\n        return "Eu sou o robô " + self.nome\n\ndef testar_robo(nome):\n    r = Robo(nome)\n    return r.falar()',
        functionName: 'testar_robo',
        tests: [
            { input: ["BB8"], expectedOutput: "Eu sou o robô BB8" },
            { input: ["R2D2"], expectedOutput: "Eu sou o robô R2D2" },
        ],
        explanationKidFriendly: 'Métodos são funções criadas dentro da classe que dão superpoderes e ações ao objeto!',
        points: 80,
    }
];
