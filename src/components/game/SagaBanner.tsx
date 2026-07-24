import React, { memo } from 'react';
import type { SagaInfo } from '../../data/worlds';

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
                    <span className="saga-banner__badge">{saga.badge}</span>
                    {totalQuestions > 0 && (
                        <span className="saga-banner__progress-chip">
                            {completedQuestions}/{totalQuestions} Questões ({percentage.toFixed(0)}%)
                        </span>
                    )}
                </div>
                <h3 className="saga-banner__title">{saga.title}</h3>
                <p className="saga-banner__description">{saga.description}</p>

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
