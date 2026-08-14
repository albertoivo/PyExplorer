import React, { memo } from 'react';
import type { SagaInfo } from '../../data/worlds';
import { useTranslation } from 'react-i18next';

interface SagaTabsProps {
    sagas: SagaInfo[];
    selectedSagaId: string;
    sagaStats: Map<string, { completed: number; total: number; percentage: number; unlockedCount: number }>;
    onSelectSaga: (sagaId: string) => void;
}

export const SagaTabs = memo(function SagaTabs({
    sagas,
    selectedSagaId,
    sagaStats,
    onSelectSaga,
}: SagaTabsProps) {
    const { t } = useTranslation('game');
    return (
        <div className="world-map__saga-tabs" role="tablist" aria-label={t('sagaTabs.ariaLabel', 'Filtro de Sagas')}>
            <button
                className={`world-map__tab ${selectedSagaId === 'all' ? 'world-map__tab--active' : ''}`}
                onClick={() => onSelectSaga('all')}
                role="tab"
                aria-selected={selectedSagaId === 'all'}
                data-testid="saga-tab-all"
            >
                ✨ {t('sagaTabs.allSagas', 'Todas as Sagas')}
            </button>
            {sagas.map(saga => {
                const st = sagaStats.get(saga.id);
                const isSagaActive = selectedSagaId === saga.id;
                return (
                    <button
                        key={saga.id}
                        className={`world-map__tab ${isSagaActive ? 'world-map__tab--active' : ''}`}
                        style={{ '--tab-color': saga.color } as React.CSSProperties}
                        onClick={() => onSelectSaga(saga.id)}
                        role="tab"
                        aria-selected={isSagaActive}
                        data-testid={`saga-tab-${saga.id}`}
                    >
                        <span className="world-map__tab-icon">{saga.icon}</span>
                        <span className="world-map__tab-title">{t(`sagas.${saga.id}.badge`, saga.badge)}</span>
                        {st && st.total > 0 && (
                            <span className="world-map__tab-badge">{st.percentage.toFixed(0)}%</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
});
