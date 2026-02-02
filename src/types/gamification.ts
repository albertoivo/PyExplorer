/**
 * Tipos para o sistema de gamificação do PyExplorer
 */

// ============================================
// CONQUISTAS / BADGES
// ============================================

export type AchievementCategory =
    | 'learning'      // Aprendizado
    | 'streak'        // Consistência
    | 'mastery'       // Maestria
    | 'social'        // Social
    | 'special'       // Especial
    | 'boss'          // Bosses
    | 'collection';   // Coleção

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    rarity: AchievementRarity;
    /** Pontos de XP ganhos ao desbloquear */
    xpReward: number;
    /** Estrelas ganhas ao desbloquear */
    starsReward: number;
    /** Condição para desbloquear (para exibição) */
    condition: string;
    /** Se está oculta até ser desbloqueada */
    hidden?: boolean;
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: Date;
    /** Se o usuário já viu a notificação */
    seen: boolean;
}

// ============================================
// STREAK DIÁRIO
// ============================================

export interface UserStreak {
    /** Streak atual em dias */
    currentStreak: number;
    /** Maior streak já alcançado */
    longestStreak: number;
    /** Data da última atividade (YYYY-MM-DD) */
    lastActivityDate: string;
    /** Histórico de datas ativas (últimos 30 dias) */
    activityHistory: string[];
}

// ============================================
// RANKING / LEADERBOARD
// ============================================

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

export interface LeaderboardEntry {
    rank: number;
    uid: string;
    displayName: string;
    avatar: string;
    totalScore: number;
    level: number;
    /** Se é o usuário atual */
    isCurrentUser?: boolean;
}

// ============================================
// LOJA DE AVATARES
// ============================================

export type ShopItemType = 'avatar' | 'frame' | 'badge' | 'title';

export interface ShopItem {
    id: string;
    type: ShopItemType;
    name: string;
    description: string;
    /** Emoji ou URL da imagem */
    icon: string;
    /** Preço em estrelas */
    price: number;
    /** Nível mínimo requerido (opcional) */
    requiredLevel?: number;
    /** Se é item limitado/sazonal */
    limited?: boolean;
    /** Cor de destaque (para frames) */
    color?: string;
}

export interface UserInventory {
    /** IDs dos itens comprados */
    ownedItems: string[];
    /** Avatar equipado */
    equippedAvatar: string;
    /** Moldura equipada */
    equippedFrame: string;
    /** Título equipado */
    equippedTitle: string;
}

// ============================================
// MISSÕES DIÁRIAS/SEMANAIS
// ============================================

export type MissionType = 'daily' | 'weekly' | 'endgame';
export type MissionStatus = 'active' | 'completed' | 'claimed';

export interface Mission {
    id: string;
    type: MissionType;
    title: string;
    description: string;
    icon: string;
    /** Tipo de objetivo */
    objectiveType: 'complete_questions' | 'correct_streak' | 'complete_world' | 'earn_stars' | 'login_streak' | 'speedrun' | 'improve_stars' | 'syntax_master';
    /** Valor alvo (ex: completar 5 questões) */
    targetValue: number;
    /** Recompensa em estrelas */
    starsReward: number;
    /** Recompensa em XP */
    xpReward: number;
    /** Mundo específico (opcional) */
    targetWorld?: string;
    /** Tempo limite em segundos (para Speedrun) */
    timeLimit?: number;
}

export interface UserMission {
    missionId: string;
    progress: number;
    status: MissionStatus;
    /** Data de expiração */
    expiresAt: Date;
    /** Data que completou (se aplicável) */
    completedAt?: Date;
}

// ============================================
// SISTEMA DE NÍVEIS
// ============================================

export interface LevelInfo {
    level: number;
    name: string;
    /** XP mínimo para este nível */
    minXP: number;
    /** XP máximo (antes de subir de nível) */
    maxXP: number;
    /** Ícone/emoji do nível */
    icon: string;
    /** Cor temática do nível */
    color: string;
    /** Recompensas ao atingir este nível */
    rewards?: {
        stars?: number;
        itemId?: string;
    };
}

export interface UserLevel {
    level: number;
    currentXP: number;
    totalXP: number;
}

// ============================================
// POWER-UPS
// ============================================

export type PowerUpType = 'skip' | 'fifty_fifty' | 'extra_hint' | 'double_stars' | 'shield';

export interface PowerUp {
    id: PowerUpType;
    name: string;
    description: string;
    icon: string;
    /** Preço em estrelas para comprar */
    price: number;
    /** Máximo que pode ter por dia */
    maxPerDay: number;
}

export interface UserPowerUps {
    /** Quantidade de cada power-up disponível */
    inventory: Record<PowerUpType, number>;
    /** Usos restantes hoje (reseta à meia-noite) */
    usesToday: Record<PowerUpType, number>;
    /** Data do último reset (YYYY-MM-DD) */
    lastResetDate: string;
}

// ============================================
// DADOS CONSOLIDADOS DO USUÁRIO
// ============================================

export interface UserGamification {
    // Nível e XP
    level: UserLevel;

    // Streak
    streak: UserStreak;

    // Conquistas
    achievements: UserAchievement[];

    // Missões ativas
    activeMissions: UserMission[];

    // Inventário da loja
    inventory: UserInventory;

    // Power-ups
    powerUps: UserPowerUps;

    // Estatísticas gerais
    stats: {
        totalQuestionsCompleted: number;
        totalCorrectAnswers: number;
        consecutiveCorrect: number; // Acertos consecutivos atuais
        bestConsecutiveCorrect: number; // Melhor sequência de acertos
        weekendQuestionsCount: number; // Questões completadas no fim de semana atual
        lastWeekendDate: string; // Data do último fim de semana contado
        totalPlayTime: number; // em minutos
        worldsCompleted: number;
        perfectWorlds: number; // mundos com 100% sem errar
        bossesDefeated: number;
        consecutiveFastAnswers: number; // For "Light Speed" achievement
        completedWorldIds?: string[]; // IDs of worlds fully completed
    };

    /** Data da última atualização (Firestore Timestamp) */
    updatedAt?: Date;

    /** Mascote Evolutivo (PyEvo) */
    pet?: UserPet;
}

// ============================================
// PYEVO (MASCOTE EVOLUTIVO)
// ============================================

export type PetStage = 'egg' | 'baby' | 'teen' | 'adult';
export type PetType = 'generic' | 'snake' | 'owl' | 'chameleon' | 'robot' | 'dragon';
export type PetMood = 'happy' | 'sad' | 'sleeping' | 'hungry' | 'coding' | 'excited';

export interface UserPet {
    name: string;
    stage: PetStage;
    /** Tipo do mascote (determinado pela evolução) */
    type: PetType;
    /** XP atual do mascote */
    xp: number;
    /** Nível do mascote */
    level: number;
    /** Fome (0-100, onde 0 é faminto e 100 é cheio) */
    hunger: number;
    /** Humor atual */
    mood: PetMood;
    /** Histórico de XP por mundo para determinar evolução */
    evolutionPath: Record<string, number>;
    /** Data da última alimentação (ISO) */
    lastFedAt: string;
    /** Se acabou de evoluir (para mostrar modal) */
    justEvolved?: boolean;
}
