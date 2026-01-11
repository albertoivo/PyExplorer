import { useState } from 'react';
import { seedQuestions, forceSeedQuestions } from '../../firebase/questionsService';
import { useAuth } from '../../hooks/useAuth';

export function DataSeeder() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    // Permite para admin ou em ambiente de desenvolvimento local
    const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const isAdmin = user?.email === 'albertoivo@gmail.com' || isLocalDev;

    const handleSeed = async () => {
        if (!isAdmin) return;
        setLoading(true);
        setStatus('Iniciando seed...');

        try {
            const result = await seedQuestions();
            if (result.success) {
                setStatus(`✅ Sucesso! ${result.count} questões no Firestore.`);
            } else {
                setStatus(`❌ Erro: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Erro ao salvar dados. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    const handleForceSeed = async () => {
        if (!isAdmin) return;
        if (!confirm('⚠️ Isso vai DELETAR todas as questões e criar novas. Continuar?')) return;

        setLoading(true);
        setStatus('🗑️ Deletando questões antigas...');

        try {
            const result = await forceSeedQuestions();
            if (result.success) {
                setStatus(`✅ Re-seed completo! ${result.count} questões atualizadas.`);
            } else {
                setStatus(`❌ Erro: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Erro ao salvar dados. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncLeaderboard = async () => {
        if (!user) return;
        setLoading(true);
        setStatus('🔄 Sincronizando leaderboard...');

        try {
            // Import dinâmico para evitar dependências circulares se houver
            const { updateUserScore } = await import('../../firebase/firestore');

            // Adicionando 0 pontos, forçamos a atualização da coleção leaderboard no backend
            // pois a função updateUserScore agora chama updateLeaderboard
            await updateUserScore(user.uid, 0);

            setStatus('✅ Leaderboard sincronizado para este usuário!');
        } catch (err) {
            console.error(err);
            setStatus('❌ Erro ao sincronizar leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <div style={{ padding: '20px', border: '2px solid #22c55e', margin: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
            <h3 style={{ margin: '0 0 10px', color: '#166534' }}>🛠️ Área do Desenvolvedor</h3>
            <p style={{ margin: '0 0 15px', color: '#15803d' }}>Admin: {user?.email}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleSeed}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#86efac' : '#22c55e',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'wait' : 'pointer',
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                    }}
                >
                    {loading ? '⏳ Enviando...' : '📚 Seed (se vazio)'}
                </button>
                <button
                    onClick={handleForceSeed}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#fca5a5' : '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'wait' : 'pointer',
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                    }}
                >
                    🔄 Force Re-Seed (deleta tudo)
                </button>
                <button
                    onClick={handleSyncLeaderboard}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#93c5fd' : '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'wait' : 'pointer',
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                    }}
                >
                    🏆 Sync Leaderboard (Self)
                </button>
            </div>
            {status && (
                <p style={{ marginTop: '15px', fontWeight: 'bold', padding: '10px', borderRadius: '6px', background: status.includes('✅') ? '#bbf7d0' : status.includes('🗑️') ? '#fef3c7' : '#fecaca' }}>
                    {status}
                </p>
            )}
        </div>
    );
}
