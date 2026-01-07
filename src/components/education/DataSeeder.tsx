
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { questionsSeed } from '../../data/questionsSeed';
import { useAuth } from '../../hooks/useAuth';

export function DataSeeder() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    // Permite apenas para o usuário admin específico (hardcoded por segurança simples neste contexto)
    const isAdmin = user?.email === 'albertoivo@gmail.com';

    const handleSeed = async () => {
        if (!isAdmin) return;
        setLoading(true);
        setStatus('Iniciando seed...');

        try {
            let count = 0;
            for (const question of questionsSeed) {
                await setDoc(doc(db, 'questions', question.id), question);
                count++;
            }
            setStatus(`Sucesso! ${count} questões adicionadas/atualizadas.`);
        } catch (err) {
            console.error(err);
            setStatus('Erro ao salvar dados. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px', background: '#fff3cd' }}>
            <h3>🛠️ Área do Desenvolvedor</h3>
            <p>Admin detectado: {user?.email}</p>
            <div style={{ marginTop: '10px' }}>
                <button
                    onClick={handleSeed}
                    disabled={loading}
                    style={{ padding: '8px 16px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {loading ? 'Enviando...' : 'Popular Firestore com Questões'}
                </button>
            </div>
            {status && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{status}</p>}
        </div>
    );
}
