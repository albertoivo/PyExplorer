import './ProgressBar.css';

interface ProgressBarProps {
    /** Valor atual (0-100 ou valor absoluto) */
    current: number;
    /** Valor máximo (para cálculo de porcentagem) */
    max?: number;
    /** Label a ser exibido */
    label?: string;
    /** Cor da barra (preset ou custom) */
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'rainbow';
    /** Tamanho da barra */
    size?: 'small' | 'medium' | 'large';
    /** Se mostra porcentagem */
    showPercentage?: boolean;
    /** Se a barra é animada */
    animated?: boolean;
}

/**
 * Barra de progresso com várias opções de estilo
 */
// fallow-ignore-next-line unused-export
export function ProgressBar({
    current,
    max = 100,
    label,
    variant = 'primary',
    size = 'medium',
    showPercentage = true,
    animated = true,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className={`progress-bar progress-bar--${size}`}>
            {(label || showPercentage) && (
                <div className="progress-bar__header">
                    {label && <span className="progress-bar__label">{label}</span>}
                    {showPercentage && (
                        <span className="progress-bar__percentage">
                            {current}/{max} ({Math.round(percentage)}%)
                        </span>
                    )}
                </div>
            )}

            <div
                className="progress-bar__track"
                role="progressbar"
                aria-valuenow={current}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label || (showPercentage ? `${Math.round(percentage)}%` : 'Progresso')}
            >
                <div
                    className={`progress-bar__fill progress-bar__fill--${variant} ${animated ? 'progress-bar__fill--animated' : ''}`}
                    style={{ width: `${percentage}%` }}
                >
                    {variant === 'rainbow' && (
                        <div className="progress-bar__shine"></div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Barra de progresso de mundo com ícone
 */
interface WorldProgressBarProps {
    worldName: string;
    worldIcon: string;
    completed: number;
    total: number;
}

export function WorldProgressBar({
    worldName,
    worldIcon,
    completed,
    total,
}: WorldProgressBarProps) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const isComplete = completed === total;

    return (
        <div className={`world-progress ${isComplete ? 'world-progress--complete' : ''}`}>
            <div className="world-progress__icon" aria-hidden="true">{worldIcon}</div>
            <div className="world-progress__content">
                <div className="world-progress__header">
                    <span className="world-progress__name">{worldName}</span>
                    <span className="world-progress__count">
                        {completed}/{total}
                        {isComplete && ' ✓'}
                    </span>
                </div>
                <div
                    className="world-progress__track"
                    role="progressbar"
                    aria-valuenow={completed}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-label={`Progresso em ${worldName}`}
                >
                    <div
                        className={`world-progress__fill ${isComplete ? 'world-progress__fill--complete' : ''}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
            {isComplete && <div className="world-progress__badge" aria-hidden="true">🏆</div>}
        </div>
    );
}

