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
 * IMPORTANTE: Substitua os valores abaixo pelas suas credenciais do Firebase.
 * Você pode encontrar essas informações no Console do Firebase:
 * 1. Acesse https://console.firebase.google.com/
 * 2. Selecione seu projeto (ou crie um novo)
 * 3. Vá em Configurações do Projeto > Geral
 * 4. Role até "Seus apps" e copie as configurações
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
