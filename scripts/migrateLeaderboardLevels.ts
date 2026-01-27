/**
 * Script de migração para sincronizar os níveis do leaderboard
 * 
 * Este script busca o nível de cada usuário na coleção "gamification"
 * e atualiza o campo "level" na coleção "leaderboard".
 * 
 * Execute com: npx tsx --env-file=.env scripts/migrateLeaderboardLevels.ts
 */

import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc,
    Timestamp 
} from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log('🔧 Configuração Firebase:');
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface LeaderboardEntry {
    uid: string;
    displayName?: string;
    level?: number;
    totalScore?: number;
}

interface GamificationData {
    level?: {
        level: number;
        totalXP: number;
    };
}

async function migrateLeaderboardLevels() {
    console.log('🚀 Iniciando migração dos níveis do leaderboard...\n');

    // 1. Busca todos os documentos do leaderboard
    const leaderboardRef = collection(db, 'leaderboard');
    const leaderboardSnapshot = await getDocs(leaderboardRef);

    console.log(`📊 Encontrados ${leaderboardSnapshot.docs.length} usuários no leaderboard\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const leaderboardDoc of leaderboardSnapshot.docs) {
        const uid = leaderboardDoc.id;
        const leaderboardData = leaderboardDoc.data() as LeaderboardEntry;
        const currentLevel = leaderboardData.level;

        try {
            // 2. Busca os dados de gamificação do usuário
            const gamificationRef = doc(db, 'gamification', uid);
            const gamificationSnap = await getDoc(gamificationRef);

            if (!gamificationSnap.exists()) {
                console.log(`⏭️  ${leaderboardData.displayName || uid}: Sem dados de gamificação (mantendo nível ${currentLevel || 1})`);
                skipped++;
                continue;
            }

            const gamificationData = gamificationSnap.data() as GamificationData;
            const actualLevel = gamificationData?.level?.level || 1;

            // 3. Verifica se precisa atualizar
            if (currentLevel === actualLevel) {
                console.log(`✅ ${leaderboardData.displayName || uid}: Nível já correto (${actualLevel})`);
                skipped++;
                continue;
            }

            // 4. Atualiza o leaderboard
            const leaderboardDocRef = doc(db, 'leaderboard', uid);
            await updateDoc(leaderboardDocRef, {
                level: actualLevel,
                updatedAt: Timestamp.now()
            });

            console.log(`🔄 ${leaderboardData.displayName || uid}: Atualizado de ${currentLevel || 'undefined'} → ${actualLevel}`);
            updated++;

        } catch (error) {
            console.error(`❌ Erro ao processar ${leaderboardData.displayName || uid}:`, error);
            errors++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMO DA MIGRAÇÃO:');
    console.log('='.repeat(50));
    console.log(`  ✅ Atualizados: ${updated}`);
    console.log(`  ⏭️  Ignorados (já corretos ou sem gamificação): ${skipped}`);
    console.log(`  ❌ Erros: ${errors}`);
    console.log(`  📊 Total processado: ${leaderboardSnapshot.docs.length}`);
    console.log('='.repeat(50));

    if (updated > 0) {
        console.log('\n🎉 Migração concluída com sucesso!');
    } else {
        console.log('\n✨ Nenhuma atualização necessária.');
    }
}

// Executa
migrateLeaderboardLevels()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Erro fatal na migração:', error);
        process.exit(1);
    });
