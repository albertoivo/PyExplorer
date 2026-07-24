import type { QuestionDocument } from '../../types/question';

export const webApiQuestions: QuestionDocument[] = [
    {
        id: 'api_01',
        type: 'multiple_choice',
        world: 'web_api',
        difficulty: 'easy',
        ageMin: 10,
        title: 'O que é uma API?',
        prompt: 'Uma API na internet funciona como o quê?',
        options: [
            'Um garçom que leva seu pedido até o servidor da internet e traz a resposta',
            'Uma peça de hardware do teclado',
            'Um erro de computador',
            'Um jogo de tabuleiro'
        ],
        answerIndex: 0,
        explanationKidFriendly: 'API vem de Application Programming Interface. É como um garçom digital que busca dados na internet para o seu código!',
        points: 40,
    },
    {
        id: 'api_02',
        type: 'fill_code',
        world: 'web_api',
        difficulty: 'easy',
        ageMin: 10,
        title: 'Formato de Dados JSON',
        prompt: 'Na internet, os dados chegam quase sempre no formato JSON, que é muito parecido com um dicionário Python. Complete para pegar o valor do status:',
        starterCode: 'resposta_api = {"status": "sucesso", "codigo": 200}\nprint(resposta_api["______"])',
        solutionTemplate: 'status',
        tests: [
            {
                input: null,
                expectedOutput: 'sucesso',
                description: 'Acessa a chave status no JSON'
            }
        ],
        explanationKidFriendly: 'JSON é o formato universal da web para enviar e receber informações!',
        points: 50,
    },
    {
        id: 'api_03',
        type: 'parsons_problem',
        world: 'web_api',
        difficulty: 'medium',
        ageMin: 11,
        title: 'Extraindo Temperatura do Clima',
        prompt: 'Ordene o código para acessar a temperatura atual dentro da resposta de uma API de previsão do tempo:',
        parsonsSegments: [
            'clima_dados = {"cidade": "SP", "main": {"temp": 25}}',
            'temperatura = clima_dados["main"]["temp"]',
            'print(f"Temperatura atual: {temperatura}°C")'
        ],
        explanationKidFriendly: 'Dicionários aninhados (um dentro do outro) são super comuns quando recebemos dados reais da web!',
        points: 60,
    },
    {
        id: 'api_04',
        type: 'full_function',
        world: 'web_api',
        difficulty: 'hard',
        ageMin: 11,
        title: 'Montador de URL de API',
        prompt: 'Crie uma função `construir_url(endpoint, usuario)` que junta um endereço de site com o nome do usuário: `f"https://api.exemplo.com/{endpoint}/{usuario}"`',
        starterCode: 'def construir_url(endpoint, usuario):\n    # Seu código aqui\n    pass',
        solutionCode: 'def construir_url(endpoint, usuario):\n    return f"https://api.exemplo.com/{endpoint}/{usuario}"',
        functionName: 'construir_url',
        tests: [
            { input: ["users", "dev_python"], expectedOutput: "https://api.exemplo.com/users/dev_python" },
            { input: ["scores", "hero123"], expectedOutput: "https://api.exemplo.com/scores/hero123" }
        ],
        explanationKidFriendly: 'Montar URLs dinâmicas com f-strings nos permite buscar informações de qualquer usuário na web!',
        points: 80,
    }
];
