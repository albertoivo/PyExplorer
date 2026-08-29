import { useOffline } from '../../hooks/useOffline';
import { usePWA } from '../../hooks/usePWA';
import './OfflineIndicator.css';

/**
 * Indicador de status offline/online e opções de PWA
 */
export function OfflineIndicator() {
    const {
        isOnline,
        pendingSync,
        isSyncing,
        syncPendingProgress,
    } = useOffline();

    const {
        isPWA,
        canInstall,
        installPWA,
        updateAvailable,
        applyUpdate,
    } = usePWA();

    // Não mostra nada se está online, é PWA e não tem nada pendente
    if (isOnline && isPWA && pendingSync === 0 && !updateAvailable) {
        return null;
    }

    return (
        <>
            {/* Indicador Offline - Alert para avisar imediatamente */}
            {!isOnline && (
                <div
                    className="offline-indicator offline-indicator--offline"
                    role="alert"
                >
                    <span className="offline-indicator__icon" aria-hidden="true">📡</span>
                    <span className="offline-indicator__text">Sem conexão</span>
                    {pendingSync > 0 && (
                        <span className="offline-indicator__pending">
                            {pendingSync} pendente{pendingSync > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Indicador de sincronização pendente - Status para feedback sem interrupção */}
            {isOnline && pendingSync > 0 && (
                <div
                    className="offline-indicator offline-indicator--syncing"
                    role="status"
                >
                    <span className="offline-indicator__icon" aria-hidden="true">
                        {isSyncing ? '⏳' : '🔄️'}
                    </span>
                    <span className="offline-indicator__text">
                        {isSyncing ? 'Sincronizando...' : `${pendingSync} item(s) para sincronizar`}
                    </span>
                    {!isSyncing && (
                        <button className="offline-indicator__btn" onClick={syncPendingProgress}>
                            Sincronizar
                        </button>
                    )}
                </div>
            )}

            {/* Prompt de instalação PWA - Polite para não ser intrusivo */}
            {canInstall && !isPWA && (
                <div
                    className="offline-indicator offline-indicator--install"
                    aria-live="polite"
                >
                    <span className="offline-indicator__icon" aria-hidden="true">📲</span>
                    <span className="offline-indicator__text">Instale o app!</span>
                    <button className="offline-indicator__btn offline-indicator__btn--primary" onClick={installPWA}>
                        Instalar
                    </button>
                </div>
            )}

            {/* Atualização disponível - Polite */}
            {updateAvailable && (
                <div
                    className="offline-indicator offline-indicator--update"
                    aria-live="polite"
                >
                    <span className="offline-indicator__icon" aria-hidden="true">✨</span>
                    <span className="offline-indicator__text">Nova versão disponível!</span>
                    <button className="offline-indicator__btn offline-indicator__btn--primary" onClick={applyUpdate}>
                        Atualizar
                    </button>
                </div>
            )}
        </>
    );
}
