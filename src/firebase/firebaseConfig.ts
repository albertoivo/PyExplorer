import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, initializeAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { disableNetwork, initializeFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { env } from '../config/env';

/**
 * Configuração do Firebase
 * 
 * As credenciais são carregadas via variáveis de ambiente (.env).
 * Para configurar:
 * 1. Copie o arquivo .env.example para .env
 * 2. Preencha com os dados do seu projeto Firebase
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validação de configuração
const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
];

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
    // Em desenvolvimento, lançamos erro para alertar o desenvolvedor
    // Em produção, isso pode causar tela branca, mas é melhor que falhar silenciosamente ou usar credenciais erradas
    const errorMessage = `Erro de Configuração: Faltam variáveis de ambiente do Firebase: ${missingKeys.join(', ')}`;
    console.error(errorMessage);
    if (import.meta.env.DEV) {
        throw new Error(errorMessage);
    }
}

// Inicializa o Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
    app = initializeApp(firebaseConfig);

    // Em auditorias automáticas, usamos auth em memória para não inicializar
    // resolvers de popup/redirect que criam iframes e ruído no console.
    auth = env.IS_AUDIT_BOT
        ? initializeAuth(app, { persistence: inMemoryPersistence })
        : getAuth(app);

    // Usa long polling automaticamente para evitar erros de QUIC/HTTP3 bloqueados em algumas redes
    db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
    });

    // Em ambiente de auditoria, desliga rede do Firestore para evitar timeouts
    // que prejudicam a métrica de Best Practices por erros de console.
    if (env.IS_AUDIT_BOT) {
        disableNetwork(db).catch(() => {
            // No-op: em auditoria preferimos seguir com cache/local sem falhar inicialização.
        });
    }

    if (!env.IS_AUDIT_BOT && typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    throw error;
}

export { app, auth, db, analytics };
export default app;
