/**
 * Utilitário para efeitos sonoros simples usando AudioContext
 * Evita a necessidade de carregar arquivos de áudio externos por enquanto
 */

// Singleton do AudioContext
let audioCtx: AudioContext | null = null;

type WindowWithWebkitAudio = Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
};

const getAudioContext = () => {
    if (!audioCtx) {
        const AudioContextCtor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
        if (!AudioContextCtor) {
            throw new Error('AudioContext API is not supported in this browser');
        }
        audioCtx = new AudioContextCtor();
    }
    return audioCtx;
};

export const playSound = (type: 'success' | 'error' | 'click' | 'celebration') => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        if (type === 'celebration') {
            const notes = [
                { freq: 523.25, start: 0, dur: 0.2 },
                { freq: 659.25, start: 0.1, dur: 0.2 },
                { freq: 783.99, start: 0.2, dur: 0.4 },
                { freq: 1046.50, start: 0.3, dur: 0.6 }
            ];
            notes.forEach(({ freq, start, dur }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + start);
                gain.gain.setValueAtTime(0.3, now + start);
                gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + start);
                osc.stop(now + start + dur);
            });
            return;
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        switch (type) {
            case 'success':
                // Melodia de sucesso (C5 -> E5 -> G5)
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, now); // C5
                oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'error':
                // Som de erro (grave e descendente)
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'click':
                // Click suave
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
        }
    } catch (e) {
        console.warn('AudioContext not supported or blocked', e);
    }
};
