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
        requiredScore: 400,
    },
    {
        id: 'numbers',
        name: 'Números Mágicos',
        description: 'Faça cálculos incríveis como um mago da matemática!',
        icon: '🔢',
        color: '#9f7aea',
        requiredScore: 800,
    },
    {
        id: 'conditions',
        name: 'Terra das Decisões',
        description: 'Faça escolhas e crie caminhos diferentes!',
        icon: '🔀',
        color: '#f093fb',
        requiredScore: 1200,
    },
    {
        id: 'loops',
        name: 'Ilha da Repetição',
        description: 'Repita comandos como um feiticeiro!',
        icon: '🔄',
        color: '#48bb78',
        requiredScore: 1600,
    },
    {
        id: 'functions',
        name: 'Vale das Funções',
        description: 'Crie suas próprias magias reutilizáveis!',
        icon: '✨',
        color: '#ed8936',
        requiredScore: 2000,
    },
    {
        id: 'lists',
        name: 'Floresta das Listas',
        description: 'Organize muitas coisas numa única lista!',
        icon: '📜',
        color: '#fc8181',
        requiredScore: 2400,
    },
    {
        id: 'strings',
        name: 'Reino das Palavras',
        description: 'Manipule textos e crie histórias!',
        icon: '📝',
        color: '#fbd38d',
        requiredScore: 2800,
    },
    {
        id: 'user_input',
        name: 'Templo do Oráculo',
        description: 'Aprenda a conversar com o usuário!',
        icon: '🔮',
        color: '#d69e2e',
        requiredScore: 3200,
    },
    {
        id: 'dictionaries',
        name: 'Biblioteca Secreta',
        description: 'Guarde segredos em dicionários!',
        icon: '📚',
        color: '#9b2c2c',
        requiredScore: 3600,
    },
    {
        id: 'error_handling',
        name: 'Fortaleza dos Bugs',
        description: 'Proteja seu código contra erros!',
        icon: '🛡️',
        color: '#4a5568',
        requiredScore: 4000,
    },
];
