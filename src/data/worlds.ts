import type { World } from '../types/question';

export interface WorldInfo {
    id: World;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredScore?: number;
}

// Definição dos mundos do jogo
// Ordem pedagógica correta: básico → variáveis → números → decisões → repetições → funções → listas → strings
// requiredScore = 95% dos pontos acumulados dos mundos anteriores (Estimativa alta performance: 55 pts/questão)
export const WORLDS: WorldInfo[] = [
    {
        id: 'basic_commands',
        name: 'Primeiros Passos',
        description: 'Aprenda a dar os primeiros comandos em Python!',
        icon: '🚀',
        color: '#00d9ff',
        // Sempre desbloqueado
    },
    {
        id: 'variables',
        name: 'Mundo das Variáveis',
        description: 'Guarde informações em caixinhas mágicas!',
        icon: '📦',
        color: '#667eea',
        requiredScore: 836, // 95% de 880 (16 questões × 55pts)
    },
    {
        id: 'numbers',
        name: 'Números Mágicos',
        description: 'Faça cálculos incríveis como um mago da matemática!',
        icon: '🔢',
        color: '#9f7aea',
        requiredScore: 1776, // 95% de 1870 (acumulado W1+W2)
    },
    {
        id: 'conditions',
        name: 'Terra das Decisões',
        description: 'Faça escolhas e crie caminhos diferentes!',
        icon: '🔀',
        color: '#f093fb',
        requiredScore: 2665, // 95% de 2805 (acumulado W1..W3)
    },
    {
        id: 'loops',
        name: 'Ilha da Repetição',
        description: 'Repita comandos como um feiticeiro!',
        icon: '🔄',
        color: '#48bb78',
        requiredScore: 3657, // 95% de 3850 (acumulado W1..W4)
    },
    {
        id: 'functions',
        name: 'Vale das Funções',
        description: 'Crie suas próprias magias reutilizáveis!',
        icon: '✨',
        color: '#ed8936',
        requiredScore: 4598, // 95% de 4840 (acumulado W1..W5)
    },
    {
        id: 'lists',
        name: 'Floresta das Listas',
        description: 'Organize muitas coisas numa única lista!',
        icon: '📜',
        color: '#fc8181',
        requiredScore: 5486, // 95% de 5775 (acumulado W1..W6)
    },
    {
        id: 'strings',
        name: 'Reino das Palavras',
        description: 'Manipule textos e crie histórias!',
        icon: '📝',
        color: '#fbd38d',
        requiredScore: 6479, // 95% de 6820 (acumulado W1..W7)
    },
    {
        id: 'user_input',
        name: 'Templo do Oráculo',
        description: 'Aprenda a conversar com o usuário!',
        icon: '🔮',
        color: '#d69e2e',
        requiredScore: 7471, // 95% de 7865 (acumulado W1..W8)
    },
    {
        id: 'dictionaries',
        name: 'Biblioteca Secreta',
        description: 'Guarde segredos em dicionários!',
        icon: '📚',
        color: '#9b2c2c',
        requiredScore: 7994, // 95% de 8415 (acumulado W1..W9)
    },
    {
        id: 'error_handling',
        name: 'Fortaleza dos Bugs',
        description: 'Proteja seu código contra erros!',
        icon: '🛡️',
        color: '#4a5568',
        requiredScore: 8464, // 95% de 8910 (acumulado W1..W10)
    },
];
