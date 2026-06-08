import type { Achievement, LevelInfo, Mission, PowerUp, ShopItem } from '../types/gamification';

// ============================================
// CONQUISTAS / BADGES
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
    // === CATEGORIA: LEARNING (Aprendizado) ===
    {
        id: 'first_question',
        name: 'Primeiro Passo',
        description: 'Complete sua primeira questão',
        icon: '🎯',
        category: 'learning',
        rarity: 'common',
        xpReward: 50,
        starsReward: 5,
        condition: 'Completar 1 questão',
    },
    {
        id: 'ten_questions',
        name: 'Dedicado',
        description: 'Complete 10 questões',
        icon: '📚',
        category: 'learning',
        rarity: 'common',
        xpReward: 100,
        starsReward: 15,
        condition: 'Completar 10 questões',
    },
    {
        id: 'fifty_questions',
        name: 'Estudante Aplicado',
        description: 'Complete 50 questões',
        icon: '🎓',
        category: 'learning',
        rarity: 'rare',
        xpReward: 300,
        starsReward: 50,
        condition: 'Completar 50 questões',
    },
    {
        id: 'hundred_questions',
        name: 'Mestre do Conhecimento',
        description: 'Complete 100 questões',
        icon: '🏆',
        category: 'learning',
        rarity: 'epic',
        xpReward: 500,
        starsReward: 100,
        condition: 'Completar 100 questões',
    },
    {
        id: 'first_world',
        name: 'Explorador',
        description: 'Complete um mundo inteiro',
        icon: '🗺️',
        category: 'learning',
        rarity: 'rare',
        xpReward: 200,
        starsReward: 30,
        condition: 'Completar todas as questões de um mundo',
    },
    {
        id: 'all_worlds',
        name: 'Conquistador de Mundos',
        description: 'Complete todos os mundos',
        icon: '🌟',
        category: 'learning',
        rarity: 'legendary',
        xpReward: 1000,
        starsReward: 200,
        condition: 'Completar todos os mundos do jogo',
    },
    {
        id: 'world_master',
        name: 'Mestre dos Mundos',
        description: 'Complete 1 mundo',
        icon: '🌍',
        category: 'learning',
        rarity: 'rare',
        xpReward: 300,
        starsReward: 50,
        condition: 'Completar 1 mundo',
    },
    {
        id: 'world_champion',
        name: 'Campeão Global',
        description: 'Complete 5 mundos',
        icon: '🪐',
        category: 'learning',
        rarity: 'epic',
        xpReward: 1000,
        starsReward: 100,
        condition: 'Completar 5 mundos',
    },


    // === CATEGORIA: STREAK (Consistência) ===
    {
        id: 'streak_3',
        name: 'Iniciante Constante',
        description: 'Mantenha uma sequência de 3 dias',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        xpReward: 75,
        starsReward: 10,
        condition: 'Jogar 3 dias seguidos',
    },
    {
        id: 'streak_7',
        name: 'Uma Semana de Fogo',
        description: 'Mantenha uma sequência de 7 dias',
        icon: '🔥',
        category: 'streak',
        rarity: 'rare',
        xpReward: 200,
        starsReward: 30,
        condition: 'Jogar 7 dias seguidos',
    },
    {
        id: 'streak_30',
        name: 'Mês de Dedicação',
        description: 'Mantenha uma sequência de 30 dias',
        icon: '💎',
        category: 'streak',
        rarity: 'epic',
        xpReward: 500,
        starsReward: 100,
        condition: 'Jogar 30 dias seguidos',
    },
    {
        id: 'streak_100',
        name: 'Lenda da Persistência',
        description: 'Mantenha uma sequência de 100 dias',
        icon: '👑',
        category: 'streak',
        rarity: 'legendary',
        xpReward: 1500,
        starsReward: 300,
        condition: 'Jogar 100 dias seguidos',
    },

    // === CATEGORIA: MASTERY (Maestria) ===
    {
        id: 'perfect_5',
        name: 'Sem Erros',
        description: 'Acerte 5 questões seguidas',
        icon: '✨',
        category: 'mastery',
        rarity: 'common',
        xpReward: 100,
        starsReward: 15,
        condition: 'Acertar 5 questões consecutivas',
    },
    {
        id: 'perfect_10',
        name: 'Maratonista',
        description: 'Acerte 10 questões seguidas',
        icon: '🏃',
        category: 'mastery',
        rarity: 'rare',
        xpReward: 250,
        starsReward: 40,
        condition: 'Acertar 10 questões consecutivas',
    },
    {
        id: 'perfect_25',
        name: 'Mente Brilhante',
        description: 'Acerte 25 questões seguidas',
        icon: '🧠',
        category: 'mastery',
        rarity: 'epic',
        xpReward: 500,
        starsReward: 80,
        condition: 'Acertar 25 questões consecutivas',
    },
    {
        id: 'perfect_world',
        name: 'Perfeição Absoluta',
        description: 'Complete um mundo sem errar nenhuma questão',
        icon: '💯',
        category: 'mastery',
        rarity: 'legendary',
        xpReward: 750,
        starsReward: 150,
        condition: 'Gabaritar um mundo inteiro',
    },
    {
        id: 'speed_demon',
        name: 'Velocista',
        description: 'Complete uma questão em menos de 10 segundos',
        icon: '⚡',
        category: 'mastery',
        rarity: 'rare',
        xpReward: 150,
        starsReward: 25,
        condition: 'Responder corretamente em menos de 10 segundos',
    },

    // === CATEGORIA: SPECIAL (Especial) ===
    {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Jogue antes das 7h da manhã',
        icon: '🌅',
        category: 'special',
        rarity: 'rare',
        xpReward: 100,
        starsReward: 20,
        condition: 'Completar uma questão entre 5h e 7h',
        hidden: true,
    },
    {
        id: 'night_owl',
        name: 'Coruja Noturna',
        description: 'Jogue depois das 23h',
        icon: '🦉',
        category: 'special',
        rarity: 'rare',
        xpReward: 100,
        starsReward: 20,
        condition: 'Completar uma questão entre 23h e 1h',
        hidden: true,
    },
    {
        id: 'weekend_warrior',
        name: 'Guerreiro de Fim de Semana',
        description: 'Complete 10 questões em um único fim de semana',
        icon: '🎮',
        category: 'special',
        rarity: 'rare',
        xpReward: 200,
        starsReward: 35,
        condition: 'Completar 10 questões no sábado ou domingo',
    },
    {
        id: 'comeback',
        name: 'De Volta ao Jogo',
        description: 'Retorne após 7 dias sem jogar',
        icon: '🔄',
        category: 'special',
        rarity: 'common',
        xpReward: 50,
        starsReward: 10,
        condition: 'Jogar após ficar 7 dias ausente',
        hidden: true,
    },

    // === CATEGORIA: BOSS (Combate - Hardcore) ===
    {
        id: 'giant_slayer',
        name: 'Matador de Gigantes',
        description: 'Derrote o primeiro Boss',
        icon: '⚔️',
        category: 'boss',
        rarity: 'rare',
        xpReward: 300,
        starsReward: 50,
        condition: 'Derrotar 1 Boss',
    },
    {
        id: 'legend_hunter',
        name: 'Caçador de Lendas',
        description: 'Derrote 3 Bosses diferentes',
        icon: '🏹',
        category: 'boss',
        rarity: 'epic',
        xpReward: 1000,
        starsReward: 150,
        condition: 'Derrotar 3 Bosses',
    },
    {
        id: 'the_destroyer',
        name: 'O Destruidor',
        description: 'Derrote TODOS os Bosses do jogo',
        icon: '💀',
        category: 'boss',
        rarity: 'legendary',
        xpReward: 2500,
        starsReward: 500,
        condition: 'Derrotar todos os Bosses',
    },
    {
        id: 'untouchable',
        name: 'Intocável',
        description: 'Derrote um Boss de primeira (Flawless Victory)',
        icon: '🛡️',
        category: 'boss',
        rarity: 'legendary',
        xpReward: 1500,
        starsReward: 200,
        condition: 'Derrotar Boss sem errar (First Try)',
    },

    // === CATEGORIA: ENDGAME & MASTERY (Avançado) ===
    {
        id: 'python_polyglot',
        name: 'Poliglota Python',
        description: 'Complete o último mundo',
        icon: '📜',
        category: 'mastery',
        rarity: 'epic',
        xpReward: 1000,
        starsReward: 200,
        condition: 'Completar o mundo final',
    },
    {
        id: 'supreme_perfectionist',
        name: 'Perfeccionista Supremo',
        description: 'Gabarite 3 mundos inteiros (todas as questões acertadas)',
        icon: '💎',
        category: 'mastery',
        rarity: 'legendary',
        xpReward: 3000,
        starsReward: 500,
        condition: 'Gabaritar 3 mundos',
    },
    {
        id: 'light_speed',
        name: 'Velocidade da Luz',
        description: 'Acerte 5 questões seguidas em menos de 20s cada',
        icon: '⚡',
        category: 'mastery',
        rarity: 'epic',
        xpReward: 800,
        starsReward: 100,
        condition: 'Seq. 5 questões < 20s',
    },
    {
        id: 'living_encyclopedia',
        name: 'Enciclopédia Viva',
        description: 'Complete 250 questões no total',
        icon: '🧠',
        category: 'learning',
        rarity: 'legendary',
        xpReward: 5000,
        starsReward: 1000,
        condition: 'Completar 250 questões',
    },

    // === CATEGORIA: COLLECTION (Loja) ===
    {
        id: 'fashionista',
        name: 'Fashionista',
        description: 'Compre 3 avatares diferentes',
        icon: '🎩',
        category: 'collection',
        rarity: 'rare',
        xpReward: 300,
        starsReward: 50,
        condition: 'Ter 3 avatares',
    },
    {
        id: 'magnate',
        name: 'Magnata',
        description: 'Tenha 1000 estrelas na carteira',
        icon: '💰',
        category: 'collection',
        rarity: 'epic',
        xpReward: 1000,
        starsReward: 0, // Recompensa é XP, já tem estrelas
        condition: 'Saldo de 1000 estrelas',
    },
    {
        id: 'personal_museum',
        name: 'Museu Pessoal',
        description: 'Compre TODOS os itens da loja',
        icon: '🏛️',
        category: 'collection',
        rarity: 'legendary',
        xpReward: 10000,
        starsReward: 0,
        condition: 'Ter todos os itens da loja',
    },

    // === CATEGORIA: PERSISTENCE (Longo Prazo) ===
    {
        id: 'unstoppable',
        name: 'Imparável',
        description: 'Mantenha uma sequência de 50 dias',
        icon: '🚀',
        category: 'streak',
        rarity: 'epic',
        xpReward: 2000,
        starsReward: 400,
        condition: 'Streak 50 dias',
    },
    {
        id: 'code_year',
        name: 'Ano do Código',
        description: 'Mantenha uma sequência de 365 dias',
        icon: '📅',
        category: 'streak',
        rarity: 'legendary',
        xpReward: 20000,
        starsReward: 5000,
        condition: 'Streak 365 dias',
    }
];

// ============================================
// SISTEMA DE NÍVEIS
// ============================================

// fallow-ignore-next-line unused-export
export const LEVELS: LevelInfo[] = [
    { level: 1, name: 'Novato', minXP: 0, maxXP: 100, icon: '🌱', color: '#48bb78' },
    { level: 2, name: 'Aprendiz', minXP: 100, maxXP: 250, icon: '🌿', color: '#68d391' },
    { level: 3, name: 'Estudante', minXP: 250, maxXP: 500, icon: '📖', color: '#4fd1c5' },
    { level: 4, name: 'Praticante', minXP: 500, maxXP: 850, icon: '⚡', color: '#63b3ed' },
    { level: 5, name: 'Explorador', minXP: 850, maxXP: 1300, icon: '🗺️', color: '#667eea' },
    { level: 6, name: 'Aventureiro', minXP: 1300, maxXP: 1900, icon: '🧭', color: '#9f7aea' },
    { level: 7, name: 'Programador', minXP: 1900, maxXP: 2700, icon: '💻', color: '#ed64a6' },
    { level: 8, name: 'Hacker', minXP: 2700, maxXP: 3700, icon: '🔓', color: '#f56565' },
    { level: 9, name: 'Mestre', minXP: 3700, maxXP: 5000, icon: '🎓', color: '#ed8936' },
    { level: 10, name: 'Sábio', minXP: 5000, maxXP: 6500, icon: '🧙', color: '#ecc94b' },
    { level: 11, name: 'Guru', minXP: 6500, maxXP: 8500, icon: '🔮', color: '#38b2ac' },
    { level: 12, name: 'Arquiteto', minXP: 8500, maxXP: 11000, icon: '🏗️', color: '#3182ce' },
    { level: 13, name: 'Visionário', minXP: 11000, maxXP: 14000, icon: '👁️', color: '#805ad5' },
    { level: 14, name: 'Lenda', minXP: 14000, maxXP: 18000, icon: '⭐', color: '#d69e2e' },
    { level: 15, name: 'Imortal', minXP: 18000, maxXP: Infinity, icon: '👑', color: '#ffd700', rewards: { stars: 500, itemId: 'avatar_golden_snake' } },
];

// ============================================
// MISSÕES BASE
// ============================================

// fallow-ignore-next-line unused-export
export const DAILY_MISSIONS: Omit<Mission, 'id'>[] = [
    {
        type: 'daily',
        title: 'Estudante do Dia',
        description: 'Complete 3 questões hoje',
        icon: '📝',
        objectiveType: 'complete_questions',
        targetValue: 3,
        starsReward: 15,
        xpReward: 50,
    },
    {
        type: 'daily',
        title: 'Acertador',
        description: 'Acerte 5 questões seguidas',
        icon: '🎯',
        objectiveType: 'correct_streak',
        targetValue: 5,
        starsReward: 20,
        xpReward: 75,
    },
    {
        type: 'daily',
        title: 'Caçador de Estrelas',
        description: 'Ganhe 30 estrelas hoje',
        icon: '⭐',
        objectiveType: 'earn_stars',
        targetValue: 30,
        starsReward: 10,
        xpReward: 40,
    },
    {
        type: 'daily',
        title: 'Explorador Básico',
        description: 'Complete 2 questões de Primeiros Passos',
        icon: '🚀',
        objectiveType: 'complete_questions',
        targetValue: 2,
        starsReward: 15,
        xpReward: 50,
        targetWorld: 'basic_commands',
    },
    {
        type: 'daily',
        title: 'Matemático',
        description: 'Complete 2 questões de Números Mágicos',
        icon: '🔢',
        objectiveType: 'complete_questions',
        targetValue: 2,
        starsReward: 15,
        xpReward: 50,
        targetWorld: 'numbers',
    },
];

// fallow-ignore-next-line unused-export
export const WEEKLY_MISSIONS: Omit<Mission, 'id'>[] = [
    {
        type: 'weekly',
        title: 'Maratonista',
        description: 'Complete 15 questões esta semana',
        icon: '🏃',
        objectiveType: 'complete_questions',
        targetValue: 15,
        starsReward: 50,
        xpReward: 200,
    },
    {
        type: 'weekly',
        title: 'Conquistador',
        description: 'Complete um mundo inteiro',
        icon: '🏆',
        objectiveType: 'complete_world',
        targetValue: 1,
        starsReward: 75,
        xpReward: 300,
    },
    {
        type: 'weekly',
        title: 'Constante',
        description: 'Jogue 5 dias esta semana',
        icon: '📅',
        objectiveType: 'login_streak',
        targetValue: 5,
        starsReward: 40,
        xpReward: 150,
    },
    {
        type: 'weekly',
        title: 'Colecionador de Estrelas',
        description: 'Acumule 100 estrelas esta semana',
        icon: '💫',
        objectiveType: 'earn_stars',
        targetValue: 100,
        starsReward: 30,
        xpReward: 100,
    },
    {
        type: 'weekly',
        title: 'Precisão Máxima',
        description: 'Acerte 20 questões seguidas',
        icon: '🎯',
        objectiveType: 'correct_streak',
        targetValue: 20,
        starsReward: 100,
        xpReward: 350,
    },
];

export const ENDGAME_MISSIONS: Omit<Mission, 'id'>[] = [
    {
        type: 'endgame',
        title: 'Speedrun',
        description: 'Refaça 3 questões em menos de 45s cada',
        icon: '⚡',
        objectiveType: 'speedrun',
        targetValue: 3,
        timeLimit: 45,
        starsReward: 100,
        xpReward: 300,
    },
    {
        type: 'endgame',
        title: 'Gabarito',
        description: 'Melhore seu desempenho em 3 questões antigas',
        icon: '📈',
        objectiveType: 'improve_stars',
        targetValue: 3,
        starsReward: 120,
        xpReward: 400,
    },
    {
        type: 'endgame',
        title: 'Mestre da Sintaxe',
        description: 'Responda 5 questões seguidas sem erros',
        icon: '🎓',
        objectiveType: 'syntax_master',
        targetValue: 5,
        starsReward: 150,
        xpReward: 500,
    },
];

// ============================================
// POWER-UPS
// ============================================

export const POWERUPS: PowerUp[] = [
    {
        id: 'skip',
        name: 'Pular Questão',
        description: 'Pule uma questão difícil sem perder o streak',
        icon: '⏭️',
        price: 15,
        maxPerDay: 3,
    },
    {
        id: 'fifty_fifty',
        name: '50/50',
        description: 'Elimina duas alternativas incorretas',
        icon: '✂️',
        price: 10,
        maxPerDay: 5,
    },
    {
        id: 'extra_hint',
        name: 'Dica Extra',
        description: 'Receba uma dica adicional sobre a questão',
        icon: '💡',
        price: 8,
        maxPerDay: 5,
    },
    {
        id: 'double_stars',
        name: 'Estrelas em Dobro',
        description: 'Ganhe o dobro de estrelas na próxima questão',
        icon: '✨',
        price: 20,
        maxPerDay: 2,
    },
    {
        id: 'shield',
        name: 'Escudo de Streak',
        description: 'Protege seu streak diário por 1 dia',
        icon: '🛡️',
        price: 25,
        maxPerDay: 1,
    },
];

// ============================================
// LOJA DE AVATARES
// ============================================

export const SHOP_ITEMS: ShopItem[] = [
    // AVATARES BÁSICOS (Grátis ou baratos)
    { id: 'avatar_snake_green', type: 'avatar', name: 'Cobra Verde', description: 'A clássica cobra Python', icon: '🐍', price: 0 },
    { id: 'avatar_snake_blue', type: 'avatar', name: 'Cobra Azul', description: 'Uma cobra misteriosa', icon: '🐍', price: 20, color: '#3182ce' },
    { id: 'avatar_robot', type: 'avatar', name: 'Robô Programador', description: 'Beep boop!', icon: '🤖', price: 30 },
    { id: 'avatar_wizard', type: 'avatar', name: 'Mago do Código', description: 'Lança feitiços em Python', icon: '🧙', price: 50 },
    { id: 'avatar_astronaut', type: 'avatar', name: 'Astronauta', description: 'Explorando o espaço do código', icon: '👨‍🚀', price: 75 },
    { id: 'avatar_ninja', type: 'avatar', name: 'Ninja Coder', description: 'Rápido e silencioso', icon: '🥷', price: 100 },
    { id: 'avatar_dragon', type: 'avatar', name: 'Dragão de Fogo', description: 'Poderoso e temido', icon: '🐉', price: 150, requiredLevel: 5 },
    { id: 'avatar_unicorn', type: 'avatar', name: 'Unicórnio Mágico', description: 'Pura magia!', icon: '🦄', price: 200, requiredLevel: 8 },
    { id: 'avatar_golden_snake', type: 'avatar', name: 'Cobra Dourada', description: 'Lendária e reluzente', icon: '🐍', price: 500, requiredLevel: 15, color: '#ffd700' },

    // MOLDURAS
    { id: 'frame_basic', type: 'frame', name: 'Moldura Simples', description: 'Uma moldura básica', icon: '⬜', price: 0 },
    { id: 'frame_fire', type: 'frame', name: 'Moldura de Fogo', description: 'Em chamas!', icon: '🔥', price: 40, color: '#f56565' },
    { id: 'frame_ice', type: 'frame', name: 'Moldura de Gelo', description: 'Fria como o código limpo', icon: '❄️', price: 40, color: '#63b3ed' },
    { id: 'frame_nature', type: 'frame', name: 'Moldura Natural', description: 'Verde e viva', icon: '🌿', price: 40, color: '#48bb78' },
    { id: 'frame_rainbow', type: 'frame', name: 'Moldura Arco-íris', description: 'Todas as cores!', icon: '🌈', price: 100, color: 'rainbow' },
    { id: 'frame_golden', type: 'frame', name: 'Moldura Dourada', description: 'Para os mais dedicados', icon: '✨', price: 250, requiredLevel: 10, color: '#ffd700' },

    // TÍTULOS
    { id: 'title_newbie', type: 'title', name: 'Novato', description: 'Todos começamos assim', icon: '🌱', price: 0 },
    { id: 'title_coder', type: 'title', name: 'Coder', description: 'Programador em formação', icon: '💻', price: 25 },
    { id: 'title_pythonista', type: 'title', name: 'Pythonista', description: 'Amante de Python', icon: '🐍', price: 50 },
    { id: 'title_hacker', type: 'title', name: 'Hacker', description: 'Destemido explorador', icon: '🔓', price: 100, requiredLevel: 5 },
    { id: 'title_legend', type: 'title', name: 'Lenda', description: 'Status lendário', icon: '⭐', price: 300, requiredLevel: 12 },
    { id: 'title_immortal', type: 'title', name: 'Imortal', description: 'Além do tempo', icon: '👑', price: 500, requiredLevel: 15 },
];

// ============================================
// NARRATIVA (STORY MODE)
// ============================================

export interface StoryEpisode {
    worldId: string;
    type: 'intro' | 'outro';
    title: string;
    dialogue: {
        speaker: string;
        text: string;
        avatar?: string;
    }[];
}

export const STORY_CHAPTERS: StoryEpisode[] = [
    {
        worldId: 'basic_commands',
        type: 'intro',
        title: 'O Início da Jornada',
        dialogue: [
            { speaker: 'Mestre Python', text: 'Olá, jovem explorador! Seja bem-vindo ao mundo de PyExplorer.', avatar: '🧙' },
            { speaker: 'Mestre Python', text: 'Eu sou o Mestre Python. Vou te ensinar a magia do código.', avatar: '🧙' },
            { speaker: 'Mestre Python', text: 'Para começar, você precisa aprender como falar com o computador.', avatar: '🧙' },
            { speaker: 'Mestre Python', text: 'Use o comando "print()" para mostrar mensagens na tela.', avatar: '🧙' },
            { speaker: 'Você', text: 'Parece fácil! Vamos lá!', avatar: '🧑‍💻' },
        ],
    },
    {
        worldId: 'basic_commands',
        type: 'outro',
        title: 'O Primeiro Desafio Vencido',
        dialogue: [
            { speaker: 'Mestre Python', text: 'Impressionante! Você derrotou o Guardião Printus.', avatar: '🧙' },
            { speaker: 'Mestre Python', text: 'Você provou que sabe se comunicar com a máquina.', avatar: '🧙' },
            { speaker: 'Mestre Python', text: 'Mas cuidado... O próximo mundo guarda segredos maiores.', avatar: '🧙' },
            { speaker: 'Mestre Python', text: 'Prepare-se para conhecer as Variáveis!', avatar: '🧙' },
        ],
    },
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula o nível baseado no XP total
 */
export function getLevelFromXP(xp: number): LevelInfo {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

/**
 * Calcula o progresso percentual para o próximo nível
 */
export function getLevelProgress(xp: number): number {
    const level = getLevelFromXP(xp);
    if (level.maxXP === Infinity) return 100;

    const xpInLevel = xp - level.minXP;
    const xpNeeded = level.maxXP - level.minXP;
    return Math.min(100, (xpInLevel / xpNeeded) * 100);
}

/**
 * Retorna as conquistas por categoria
 */
// fallow-ignore-next-line unused-export
export function getAchievementsByCategory(category: string): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Retorna os itens da loja por tipo
 */
export function getShopItemsByType(type: string): ShopItem[] {
    return SHOP_ITEMS.filter(item => item.type === type);
}

/**
 * Gera missões diárias aleatórias (3 por dia)
 */
export function generateDailyMissions(date: Date): Mission[] {
    const seed = date.toISOString().split('T')[0];
    const shuffled = [...DAILY_MISSIONS].sort(() =>
        Math.sin(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) - 0.5
    );

    return shuffled.slice(0, 3).map((mission, index) => ({
        ...mission,
        id: `daily_${seed}_${index}`,
    }));
}

/**
 * Gera missões semanais aleatórias (2 por semana)
 */
export function generateWeeklyMissions(weekOf: Date): Mission[] {
    const weekStart = new Date(weekOf);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const seed = weekStart.toISOString().split('T')[0];

    const shuffled = [...WEEKLY_MISSIONS].sort(() =>
        Math.sin(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) - 0.5
    );

    return shuffled.slice(0, 2).map((mission, index) => ({
        ...mission,
        id: `weekly_${seed}_${index}`,
    }));
}
