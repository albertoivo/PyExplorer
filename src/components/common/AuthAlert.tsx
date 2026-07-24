import React from 'react';

export interface AuthAlertProps {
    type: 'error' | 'warning' | 'success';
    message?: string | null;
    children?: React.ReactNode;
}

/**
 * Componente reutilizável para mensagens de alerta de autenticação (erro, aviso, sucesso).
 */
export function AuthAlert({ type, message, children }: AuthAlertProps) {
    const content = message || children;
    if (!content) return null;

    const icons = {
        error: '❌',
        warning: '⚠️',
        success: '✅',
    };

    const role = type === 'success' ? 'status' : 'alert';

    return (
        <div className={`auth-alert auth-alert--${type}`} role={role}>
            {icons[type]} {content}
        </div>
    );
}
