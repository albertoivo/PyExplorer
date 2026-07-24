import React from 'react';

export interface AuthCardProps {
    icon: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

/**
 * Componente de layout reutilizável para páginas de autenticação (Login, Registro, etc.)
 */
export function AuthCard({ icon, title, subtitle, children }: AuthCardProps) {
    return (
        <div className="auth-card">
            <div className="auth-card__header">
                <div className="auth-card__icon">{icon}</div>
                <h1 className="auth-card__title">{title}</h1>
                <p className="auth-card__subtitle">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}
