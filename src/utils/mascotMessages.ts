// Mensagens aleatórias para diferentes situações
export const RANDOM_MESSAGES = {
    correct: [
        'Isso aí! Mandou bem!',
        'Perfeito! Você é demais!',
        'Acertou em cheio! 🎯',
        'Você está arrasando!',
        'Excelente trabalho!',
        'Uau! Muito bom!',
        'Impressionante! 🌟',
        'Você é um gênio!',
    ],
    incorrect: [
        'Não desiste! Você consegue!',
        'Quase lá! Tenta de novo!',
        'Errar faz parte! Vamos lá!',
        'Você está aprendendo! 💪',
        'Não se preocupa, tenta outra vez!',
        'A prática leva à perfeição!',
        'Eu sei que você consegue!',
    ],
    celebrate: [
        'PARABÉNS! Você é incrível! 🎉',
        'Que conquista! Continue assim!',
        'Você está arrasando! 🏆',
        'Fantástico! Você é demais!',
    ],
    idle: [
        'Estou aqui se precisar!',
        'Vamos aprender juntos?',
        'Python é muito legal!',
        'Curtindo o jogo? 🐍',
    ],
    hint: [
        'Pensa com calma...',
        'Dica: leia a pergunta de novo!',
        'Você já sabe a resposta!',
        'Confia em você!',
    ],
};

export function getRandomMessage(type: keyof typeof RANDOM_MESSAGES): string {
    const messages = RANDOM_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
}
