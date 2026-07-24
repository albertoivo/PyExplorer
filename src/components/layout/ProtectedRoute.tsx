import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Se true, permite acesso a convidados também */
    allowGuest?: boolean;
}

/**
 * Componente que protege rotas que requerem autenticação
 */
export function ProtectedRoute({ children, allowGuest = true }: ProtectedRouteProps) {
    const { user, userData, loading, isGuest } = useAuth();
    const location = useLocation();

    // Mostra loading enquanto verifica autenticação ou carrega o perfil do usuário
    if (loading || (user && !userData)) {
        return (
            <div className="protected-route__loading">
                <div className="protected-route__spinner"></div>
                <p className="protected-route__loading-text">Carregando...</p>
            </div>
        );
    }

    // Se não há usuário (nem convidado), redireciona para login
    if (!userData && !isGuest) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se não permite convidado e é convidado, redireciona
    if (!allowGuest && isGuest) {
        return <Navigate to="/login" state={{ from: location, requireLogin: true }} replace />;
    }

    return <>{children}</>;
}

