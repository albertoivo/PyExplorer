import React, { memo } from 'react';
import type { SagaInfo } from '../../data/worlds';
import { useTranslation } from 'react-i18next';

interface SagaBannerProps {
    saga: SagaInfo;
    completedQuestions?: number;
    totalQuestions?: number;
    percentage?: number;
}

export const SagaBanner = memo(function SagaBanner({
    saga,
    completedQuestions = 0,
    totalQuestions = 0,
    percentage = 0,
}: SagaBannerProps) {
    const { t } = useTranslation('game');
    return (
        <div
            className="saga-banner"
            style={{
                '--saga-color': saga.color,
                '--saga-gradient': saga.gradient,
            } as React.CSSProperties}
            data-testid={`saga-banner-${saga.id}`}
        >
            <div className="saga-banner__icon-box">
                <span className="saga-banner__icon" role="img" aria-label={saga.title}>
                    {saga.icon}
                </span>
            </div>
            <div className="saga-banner__content">
                <div className="saga-banner__top">
                    <span className="saga-banner__badge">{t(`sagas.${saga.id}.badge`, saga.badge)}</span>
                    {totalQuestions > 0 && (
                        <span className="saga-banner__progress-chip">
                            {completedQuestions}/{totalQuestions} {t('sagaBanner.questions', 'Questões')} ({percentage.toFixed(0)}%)
                        </span>
                    )}
                </div>
                <h3 className="saga-banner__title">{t(`sagas.${saga.id}.title`, saga.title)}</h3>
                <p className="saga-banner__description">{t(`sagas.${saga.id}.description`, saga.description)}</p>

                {totalQuestions > 0 && (
                    <div className="saga-banner__progress-bar">
                        <div
                            className="saga-banner__progress-fill"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});
