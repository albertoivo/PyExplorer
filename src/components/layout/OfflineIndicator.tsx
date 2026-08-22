import { useOffline } from '../../hooks/useOffline';
import { useTranslation } from 'react-i18next';
import './OfflineIndicator.css';

/**
 * Indicador de status offline/online e opções de PWA
 */
export function OfflineIndicator() {
    const { t } = useTranslation('common');
    const {
        isOnline,
        isPWA,
        pendingSync,
        isSyncing,
        canInstall,
        installPWA,
        updateAvailable,
        applyUpdate,
        syncPendingProgress,
    } = useOffline();

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
                    <span className="offline-indicator__text">{t('offline.noConnection', 'Sem conexão')}</span>
                    {pendingSync > 0 && (
                        <span className="offline-indicator__pending">
                            {t('offline.pending', { count: pendingSync, defaultValue: `${pendingSync} pendentes` })}
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
                        {isSyncing ? t('offline.syncing', 'Sincronizando...') : t('offline.pendingToSync', { count: pendingSync, defaultValue: `${pendingSync} itens para sincronizar` })}
                    </span>
                    {!isSyncing && (
                        <button className="offline-indicator__btn" onClick={syncPendingProgress}>
                            {t('offline.syncNow', 'Sincronizar')}
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
                    <span className="offline-indicator__text">{t('offline.installApp', 'Instale o app!')}</span>
                    <button className="offline-indicator__btn offline-indicator__btn--primary" onClick={installPWA}>
                        {t('offline.install', 'Instalar')}
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
                    <span className="offline-indicator__text">{t('offline.updateAvailable', 'Nova versão disponível!')}</span>
                    <button className="offline-indicator__btn offline-indicator__btn--primary" onClick={applyUpdate}>
                        {t('offline.update', 'Atualizar')}
                    </button>
                </div>
            )}
        </>
    );
}
