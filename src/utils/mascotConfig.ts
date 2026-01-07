import type { MascotMood } from "../components/mascot/Mascot";

interface MoodConfig {
    face: string;
    animation: string;
    defaultMessage: string;
    color: string;
}

export const MOOD_CONFIGS: Record<MascotMood, MoodConfig> = {
    idle: {
        face: '🐍',
        animation: 'float',
        defaultMessage: 'Olá! Estou aqui para ajudar!',
        color: '#667eea',
    },
    happy: {
        face: '😊',
        animation: 'bounce',
        defaultMessage: 'Isso aí! Você está indo muito bem!',
        color: '#48bb78',
    },
    excited: {
        face: '🤩',
        animation: 'shake',
        defaultMessage: 'INCRÍVEL! Você é demais!',
        color: '#ffd700',
    },
    thinking: {
        face: '🤔',
        animation: 'tilt',
        defaultMessage: 'Hmm, deixe-me pensar...',
        color: '#9f7aea',
    },
    confused: {
        face: '😅',
        animation: 'wobble',
        defaultMessage: 'Oops! Não foi bem assim...',
        color: '#ed8936',
    },
    encouraging: {
        face: '💪',
        animation: 'pulse',
        defaultMessage: 'Você consegue! Tenta de novo!',
        color: '#00d9ff',
    },
    celebrating: {
        face: '🎉',
        animation: 'confetti',
        defaultMessage: 'PARABÉNS! Você é um campeão!',
        color: '#f093fb',
    },
    sleeping: {
        face: '😴',
        animation: 'float',
        defaultMessage: 'Zzz...',
        color: '#a0aec0',
    },
    waving: {
        face: '👋',
        animation: 'wave',
        defaultMessage: 'Bem-vindo de volta!',
        color: '#667eea',
    },
};
