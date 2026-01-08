import { useState, useEffect, useCallback } from 'react';
import type { QuestionDocument } from '../types/question';
import { MOCK_QUESTIONS } from '../data/mockQuestions';
import { useAuth } from '../context/AuthContext';
import { updateProgress } from '../firebase/firestore';

// Chaves do localStorage
const CACHED_QUESTIONS_KEY = 'pyexplorer_cached_questions';
const OFFLINE_PROGRESS_KEY = 'pyexplorer_offline_progress';
const LAST_SYNC_KEY = 'pyexplorer_last_sync';

interface OfflineProgress {
    questionId: string;
    passed: boolean;
    score: number;
    timestamp: number;
}

interface OfflineState {
    /** Se está online */
    isOnline: boolean;
    /** Se o app está instalado como PWA */
    isPWA: boolean;
    /** Questões em cache */
    cachedQuestions: QuestionDocument[];
    /** Progresso pendente de sincronização */
    pendingProgress: OfflineProgress[];
    /** Data da última sincronização */
    lastSync: Date | null;
    /** Se está sincronizando */
    isSyncing: boolean;
}

/**
 * Hook para gerenciar modo offline e sincronização
 */
export function useOffline() {
    const [state, setState] = useState<OfflineState>({
        isOnline: navigator.onLine,
        isPWA: window.matchMedia('(display-mode: standalone)').matches,
        cachedQuestions: [],
        pendingProgress: [],
        lastSync: null,
        isSyncing: false,
    });

    /**
     * Carrega dados do cache local
     */
    const loadCachedData = useCallback(() => {
        try {
            // Carrega questões em cache
            const cachedQuestionsStr = localStorage.getItem(CACHED_QUESTIONS_KEY);
            const cachedQuestions = cachedQuestionsStr
                ? JSON.parse(cachedQuestionsStr)
                : MOCK_QUESTIONS; // Usa questões mock como fallback

            // Carrega progresso pendente
            const pendingProgressStr = localStorage.getItem(OFFLINE_PROGRESS_KEY);
            const pendingProgress = pendingProgressStr
                ? JSON.parse(pendingProgressStr)
                : [];

            // Carrega última sincronização
            const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
            const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

            setState(prev => ({
                ...prev,
                cachedQuestions,
                pendingProgress,
                lastSync,
            }));
        } catch (error) {
            console.error('Erro ao carregar dados em cache:', error);
        }
    }, []);

    /**
     * Salva questões no cache para uso offline
     */
    const cacheQuestions = useCallback((questions: QuestionDocument[]) => {
        try {
            localStorage.setItem(CACHED_QUESTIONS_KEY, JSON.stringify(questions));
            setState(prev => ({ ...prev, cachedQuestions: questions }));
        } catch (error) {
            console.error('Erro ao salvar questões em cache:', error);
        }
    }, []);

    /**
     * Salva progresso para sincronização posterior (modo offline)
     */
    const saveOfflineProgress = useCallback((questionId: string, passed: boolean, score: number) => {
        const newProgress: OfflineProgress = {
            questionId,
            passed,
            score,
            timestamp: Date.now(),
        };

        setState(prev => {
            const updated = [...prev.pendingProgress, newProgress];
            localStorage.setItem(OFFLINE_PROGRESS_KEY, JSON.stringify(updated));
            return { ...prev, pendingProgress: updated };
        });
    }, []);

    const { user } = useAuth();

    /**
     * Sincroniza progresso pendente com o servidor
     */
    const syncPendingProgress = useCallback(async (): Promise<boolean> => {
        if (!state.isOnline || state.pendingProgress.length === 0 || state.isSyncing) {
            return false;
        }

        if (!user) {
            // Se não estiver logado, não faz sentido sincronizar com o Firestore.
            // Poderíamos sincronizar com dados de convidado no LocalStorage se a lógica de login como convidado
            // não usasse o mesmo LocalStorage.
            return false;
        }

        setState(prev => ({ ...prev, isSyncing: true }));

        try {
            console.log('Sincronizando progresso:', state.pendingProgress);

            // TODO: Otimizar para usar batch writes se houver muitos itens
            for (const item of state.pendingProgress) {
                await updateProgress(user.uid, item.questionId, item.passed, item.score);
            }

            // Sucesso
            localStorage.removeItem(OFFLINE_PROGRESS_KEY);
            localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

            setState(prev => ({
                ...prev,
                pendingProgress: [],
                lastSync: new Date(),
                isSyncing: false,
            }));

            return true;
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            setState(prev => ({ ...prev, isSyncing: false }));
            return false;
        }
    }, [state.isOnline, state.pendingProgress, state.isSyncing, user]);

    // Monitora status de conexão
    useEffect(() => {
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOnline: true }));
            // Tenta sincronizar quando volta online
            syncPendingProgress();
        };

        const handleOffline = () => {
            setState(prev => ({ ...prev, isOnline: false }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncPendingProgress]);

    // Carrega dados do cache ao iniciar
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCachedData();
    }, [loadCachedData]);

    /**
     * Obtém questões (do cache se offline)
     */
    const getQuestions = useCallback((world?: string): QuestionDocument[] => {
        let questions = state.cachedQuestions;

        if (world) {
            questions = questions.filter(q => q.world === world);
        }

        return questions;
    }, [state.cachedQuestions]);

    /**
     * Verifica se pode instalar como PWA
     */
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

    useEffect(() => {
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    /**
     * Instala o app como PWA
     */
    const installPWA = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promptEvent = deferredPrompt as any;
        promptEvent.prompt();

        const { outcome } = await promptEvent.userChoice;
        setDeferredPrompt(null);

        return outcome === 'accepted';
    }, [deferredPrompt]);

    /**
     * Verifica se há atualização do service worker
     */
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                setSWRegistration(registration);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });
            });
        }
    }, []);

    /**
     * Aplica atualização do service worker
     */
    const applyUpdate = useCallback(() => {
        if (swRegistration?.waiting) {
            swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, [swRegistration]);

    return {
        // Estado
        isOnline: state.isOnline,
        isPWA: state.isPWA,
        pendingSync: state.pendingProgress.length,
        lastSync: state.lastSync,
        isSyncing: state.isSyncing,

        // Questões
        cachedQuestions: state.cachedQuestions,
        cacheQuestions,
        getQuestions,

        // Progresso offline
        saveOfflineProgress,
        syncPendingProgress,

        // PWA
        canInstall: !!deferredPrompt,
        installPWA,

        // Update
        updateAvailable,
        applyUpdate,
    };
}
