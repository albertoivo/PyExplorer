import type { World } from '../types/question';

export interface SagaInfo {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    badge: string;
    worldIds: World[];
}

export interface WorldInfo {
    id: World;
    sagaId: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredScore?: number;
}

// Definição das 4 Sagas Épicas da Jornada Python
export const SAGAS: SagaInfo[] = [
    {
        id: 'saga_1',
        title: 'Saga 1: O Aprendiz de Python',
        subtitle: 'Fundamentos & Lógica de Programação',
        description: 'Dê os primeiros passos, crie variáveis, converse com o usuário e domine decisões e repetições!',
        icon: '🛡️',
        color: '#00d9ff',
        gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
        badge: 'Iniciante',
        worldIds: ['basic_commands', 'variables', 'user_input', 'numbers', 'conditions', 'loops'],
    },
    {
        id: 'saga_2',
        title: 'Saga 2: O Guardião dos Dados',
        subtitle: 'Estruturas, Texto & Funções',
        description: 'Domine a manipulação de textos, organize listas, dicionários e crie magias reutilizáveis!',
        icon: '📜',
        color: '#9f7aea',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        badge: 'Intermediário',
        worldIds: ['strings', 'lists', 'dictionaries', 'functions', 'error_handling'],
    },
    {
        id: 'saga_3',
        title: 'Saga 3: O Arquiteto de Software',
        subtitle: 'Orientação a Objetos & Recursos Avançados',
        description: 'Construa arquivos, use bibliotecas, crie suas próprias Classes/Objetos e use atalhos Pythonic!',
        icon: '🏗️',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        badge: 'Avançado',
        worldIds: ['files', 'modules', 'oop_basics', 'pythonic'],
    },
    {
        id: 'saga_4',
        title: 'Saga 4: As Trilhas do Destino',
        subtitle: 'Especializações & Projetos Práticos',
        description: 'Crie artes com código, analise dados reais de IA e conecte-se com APIs da internet!',
        icon: '🌟',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        badge: 'Mestre',
        worldIds: ['turtle_art', 'data_science', 'web_api'],
    },
];

// Definição dos 18 mundos do jogo organizados por Saga
export const WORLDS: WorldInfo[] = [
    // SAGA 1: FUNDAMENTOS
    {
        id: 'basic_commands',
        sagaId: 'saga_1',
        name: 'Primeiros Passos',
        description: 'Aprenda a dar os primeiros comandos em Python!',
        icon: '🚀',
        color: '#00d9ff',
    },
    {
        id: 'variables',
        sagaId: 'saga_1',
        name: 'Mundo das Variáveis',
        description: 'Guarde informações em caixinhas mágicas!',
        icon: '📦',
        color: '#3b82f6',
        requiredScore: 300,
    },
    {
        id: 'user_input',
        sagaId: 'saga_1',
        name: 'Templo do Oráculo',
        description: 'Aprenda a conversar com o usuário com input()!',
        icon: '🔮',
        color: '#06b6d4',
        requiredScore: 600,
    },
    {
        id: 'numbers',
        sagaId: 'saga_1',
        name: 'Números Mágicos',
        description: 'Faça cálculos incríveis como um mago da matemática!',
        icon: '🔢',
        color: '#8b5cf6',
        requiredScore: 900,
    },
    {
        id: 'conditions',
        sagaId: 'saga_1',
        name: 'Terra das Decisões',
        description: 'Faça escolhas e crie caminhos diferentes!',
        icon: '🔀',
        color: '#ec4899',
        requiredScore: 1200,
    },
    {
        id: 'loops',
        sagaId: 'saga_1',
        name: 'Ilha da Repetição',
        description: 'Repita comandos como um feiticeiro!',
        icon: '🔄',
        color: '#10b981',
        requiredScore: 1600,
    },

    // SAGA 2: ESTRUTURAS E FUNÇÕES
    {
        id: 'strings',
        sagaId: 'saga_2',
        name: 'Reino das Palavras',
        description: 'Manipule textos e crie histórias incríveis!',
        icon: '📝',
        color: '#f59e0b',
        requiredScore: 2000,
    },
    {
        id: 'lists',
        sagaId: 'saga_2',
        name: 'Floresta das Listas',
        description: 'Organize muitas coisas numa única lista!',
        icon: '📜',
        color: '#ef4444',
        requiredScore: 2400,
    },
    {
        id: 'dictionaries',
        sagaId: 'saga_2',
        name: 'Biblioteca Secreta',
        description: 'Guarde segredos em dicionários, tuplas e conjuntos!',
        icon: '📚',
        color: '#b91c1c',
        requiredScore: 2800,
    },
    {
        id: 'functions',
        sagaId: 'saga_2',
        name: 'Vale das Funções',
        description: 'Crie suas próprias magias reutilizáveis!',
        icon: '✨',
        color: '#f97316',
        requiredScore: 3200,
    },
    {
        id: 'error_handling',
        sagaId: 'saga_2',
        name: 'Fortaleza dos Bugs',
        description: 'Proteja seu código contra erros com try/except!',
        icon: '🛡️',
        color: '#64748b',
        requiredScore: 3600,
    },

    // SAGA 3: ARQUITETO DE SOFTWARE (AVANÇADO)
    {
        id: 'files',
        sagaId: 'saga_3',
        name: 'Arquivos do Conhecimento',
        description: 'Leia, escreva e guarde informações em arquivos reais!',
        icon: '📂',
        color: '#14b8a6',
        requiredScore: 4000,
    },
    {
        id: 'modules',
        sagaId: 'saga_3',
        name: 'Bazar de Módulos',
        description: 'Use magias prontas com import, math, random e mais!',
        icon: '🧰',
        color: '#84cc16',
        requiredScore: 4400,
    },
    {
        id: 'oop_basics',
        sagaId: 'saga_3',
        name: 'A Arte dos Objetos',
        description: 'Crie seus próprios seres e blueprints com Classes e POO!',
        icon: '🧙‍♂️',
        color: '#a855f7',
        requiredScore: 4800,
    },
    {
        id: 'pythonic',
        sagaId: 'saga_3',
        name: 'Atalhos Mágicos',
        description: 'Escreva código poderoso com List Comprehensions e Lambdas!',
        icon: '⚡',
        color: '#eab308',
        requiredScore: 5200,
    },

    // SAGA 4: TRILHAS DO DESTINO (ESPECIALIZAÇÕES)
    {
        id: 'turtle_art',
        sagaId: 'saga_4',
        name: 'Estúdio de Arte & Turtle',
        description: 'Crie desenhos geométricos e animações incríveis com código!',
        icon: '🎨',
        color: '#06b6d4',
        requiredScore: 5600,
    },
    {
        id: 'data_science',
        sagaId: 'saga_4',
        name: 'Laboratório de Dados & IA',
        description: 'Explore dados, estatísticas e lógicas de Inteligência Artificial!',
        icon: '🤖',
        color: '#6366f1',
        requiredScore: 6000,
    },
    {
        id: 'web_api',
        sagaId: 'saga_4',
        name: 'A Teia da Internet & APIs',
        description: 'Conecte seus programas com informações vivas da internet!',
        icon: '🌐',
        color: '#f43f5e',
        requiredScore: 6400,
    },
];

export function getSagaByWorld(worldId: World): SagaInfo | undefined {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world) return undefined;
    return SAGAS.find(s => s.id === world.sagaId);
}
