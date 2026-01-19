/**
 * Script para deletar usuários cujo displayName começa com "Ivo"
 * 
 * Uso: npx ts-node scripts/delete-ivo-users.ts
 * 
 * ATENÇÃO: Este script deleta dados permanentemente!
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Configuração do Firebase (mesma do app)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'pyexplorer-cd32d',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteIvoUsers() {
    const collections = ['users', 'leaderboard', 'userProgress'];

    for (const collectionName of collections) {
        console.log(`\n📂 Verificando coleção: ${collectionName}`);

        const snapshot = await getDocs(collection(db, collectionName));
        let deletedCount = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const displayName = data.displayName || '';
            const email = data.email || '';

            // Pular o admin
            if (email === 'albertoivo@gmail.com') {
                console.log(`  ⏭️  Pulando admin: ${displayName}`);
                continue;
            }

            if (displayName.startsWith('Ivo')) {
                console.log(`  🗑️  Deletando: ${displayName} (${docSnap.id})`);
                await deleteDoc(doc(db, collectionName, docSnap.id));
                deletedCount++;
            }
        }

        console.log(`  ✅ ${deletedCount} documento(s) deletado(s) de ${collectionName}`);
    }

    console.log('\n🎉 Limpeza concluída!');
}

deleteIvoUsers().catch(console.error);
