import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

/**
 * Configuração do Firebase
 * 
 * NOTA DE SEGURANÇA:
 * Idealmente, estas chaves devem vir de variáveis de ambiente (VITE_FIREBASE_*)
 * configuradas no .env (local) e nos Secrets do GitHub Actions (produção).
 *
 * Os valores hardcoded abaixo servem como FALLBACK TEMPORÁRIO para garantir
 * que a aplicação não quebre em produção caso os Secrets não estejam configurados.
 *
 * TODO: Remover os valores hardcoded após confirmar a configuração dos Secrets no GitHub.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBjrrWJRsxAqzmbjp7MBQgD5vhC0Ch6l_Q',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pyexplorer-cd32d.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pyexplorer-cd32d',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pyexplorer-cd32d.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '762952995670',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:762952995670:web:a709c16c4e0fe43c8cbcf7',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ZF147K9F7V',
};

// Validação (Apenas Log, não trava o app pois temos fallbacks)
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.warn('⚠️ Firebase rodando com credenciais de fallback. Configure as variáveis de ambiente para maior segurança.');
}

// Inicializa o Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    analytics = getAnalytics(app);
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    throw error;
}

export { app, auth, db, analytics };
export default app;
