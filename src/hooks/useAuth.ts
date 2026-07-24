import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContextDefinition';

/**
 * Hook para acessar o contexto de autenticação.
 *
 * Definido aqui (e não no AuthContext.tsx) para evitar problemas com
 * React Fast Refresh ao exportar hooks e componentes do mesmo arquivo.
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
