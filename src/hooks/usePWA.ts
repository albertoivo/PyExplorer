import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const checkIsPWA = (): boolean => {
    if (typeof window === 'undefined') return false;
    const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
    const isIOSStandalone = 'standalone' in navigator && (navigator as unknown as { standalone?: boolean }).standalone === true;
    return isStandaloneMedia || isIOSStandalone;
};

export function usePWA() {
    const [isPWA, setIsPWA] = useState<boolean>(checkIsPWA);
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Update isPWA state if display mode changes
    useEffect(() => {
        const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
        if (!mediaQuery) return;

        const handleChange = (e: MediaQueryListEvent) => {
            setIsPWA(e.matches || checkIsPWA());
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else if ('addListener' in mediaQuery) {
            (mediaQuery as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(handleChange);
            return () => (mediaQuery as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(handleChange);
        }
    }, []);

    // Handle beforeinstallprompt and appinstalled events
    useEffect(() => {
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsPWA(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installPWA = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;

        const promptEvent = deferredPrompt as BeforeInstallPromptEvent;
        promptEvent.prompt();

        const { outcome } = await promptEvent.userChoice;
        setDeferredPrompt(null);

        return outcome === 'accepted';
    }, [deferredPrompt]);

    // Service Worker update detection
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                setSWRegistration(registration);

                const checkWorkerState = (worker: ServiceWorker) => {
                    worker.addEventListener('statechange', () => {
                        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                            setUpdateAvailable(true);
                        }
                    });
                };

                // Check if an updated worker is already waiting
                if (registration.waiting && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                }

                // Check if an updated worker is currently installing
                if (registration.installing) {
                    checkWorkerState(registration.installing);
                }

                // Listen for future updates
                registration.addEventListener('updatefound', () => {
                    if (registration.installing) {
                        checkWorkerState(registration.installing);
                    }
                });
            });

            // Checa por atualizações ao focar na janela (quando o usuário volta à aba)
            const handleFocus = () => {
                navigator.serviceWorker.getRegistration().then(reg => {
                    reg?.update().catch(() => {});
                });
            };
            window.addEventListener('focus', handleFocus);
            return () => window.removeEventListener('focus', handleFocus);
        }
    }, []);

    const applyUpdate = useCallback(async () => {
        setIsUpdating(true);

        let registration = swRegistration;
        if (!registration && 'serviceWorker' in navigator) {
            try {
                registration = (await navigator.serviceWorker.getRegistration()) || null;
            } catch {
                // Silencioso em caso de erro ao obter registro
            }
        }

        let reloaded = false;
        const handleReload = () => {
            if (!reloaded) {
                reloaded = true;
                window.location.reload();
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener?.('controllerchange', handleReload, { once: true });
        }

        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            // Fallback reload caso controllerchange não dispare
            setTimeout(handleReload, 500);
        } else {
            // Se nenhum worker estiver em espera (ex: já ativado, redundant ou skipWaiting automático),
            // força o reload da página diretamente para carregar os novos assets
            handleReload();
        }
    }, [swRegistration]);

    return {
        isPWA,
        canInstall: !!deferredPrompt,
        installPWA,
        updateAvailable,
        applyUpdate,
        isUpdating,
    };
}
