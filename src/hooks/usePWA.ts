import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
    const [isPWA, setIsPWA] = useState(() => window.matchMedia('(display-mode: standalone)').matches);
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Update isPWA state if it changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e: MediaQueryListEvent) => setIsPWA(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

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

    const installPWA = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;

        const promptEvent = deferredPrompt as BeforeInstallPromptEvent;
        promptEvent.prompt();

        const { outcome } = await promptEvent.userChoice;
        setDeferredPrompt(null);

        return outcome === 'accepted';
    }, [deferredPrompt]);

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

    const applyUpdate = useCallback(() => {
        if (swRegistration?.waiting) {
            swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, [swRegistration]);

    return {
        isPWA,
        canInstall: !!deferredPrompt,
        installPWA,
        updateAvailable,
        applyUpdate,
    };
}
