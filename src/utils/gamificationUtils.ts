/**
 * Utilitários para lógica de gamificação
 */

interface StreakResult {
    streak: number;
    longestStreak: number;
    lastActiveDate: string;
    shouldUpdate: boolean;
}

/**
 * Calcula a nova ofensiva (streak) baseada na data da última atividade
 * @param currentStreak Ofensiva atual
 * @param currentLongestStreak Maior ofensiva atual
 * @param lastActiveDateStr Data da última atividade (YYYY-MM-DD)
 * @param todayDateStr Data de hoje (YYYY-MM-DD) - opcional, usa hoje se não passar
 */
export function calculateStreak(
    currentStreak: number,
    currentLongestStreak: number = 0,
    lastActiveDateStr: string | null | undefined,
    todayDateStr?: string
): StreakResult {
    const today = todayDateStr || new Date().toISOString().split('T')[0];
    const safeLongest = Math.max(currentLongestStreak, currentStreak);

    // Se não tem data anterior, é o primeiro dia
    if (!lastActiveDateStr) {
        return {
            streak: 1,
            longestStreak: Math.max(safeLongest, 1),
            lastActiveDate: today,
            shouldUpdate: true
        };
    }

    // Se já logou hoje, não muda nada
    if (lastActiveDateStr === today) {
        return {
            streak: currentStreak,
            longestStreak: safeLongest,
            lastActiveDate: today,
            shouldUpdate: false
        };
    }

    // Calcula a diferença em dias
    const last = new Date(lastActiveDateStr);
    const now = new Date(today);

    // Zera as horas para comparar apenas dias
    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // Foi ontem: incrementa streak
        const newStreak = currentStreak + 1;
        return {
            streak: newStreak,
            longestStreak: Math.max(safeLongest, newStreak),
            lastActiveDate: today,
            shouldUpdate: true
        };
    } else if (diffDays > 1) {
        // Passou mais de um dia: reseta para 1
        return {
            streak: 1,
            longestStreak: safeLongest, // Mantém o recorde
            lastActiveDate: today,
            shouldUpdate: true
        };
    }


    // Default (caso estranho de data futura ou erro): mantém
    return {
        streak: currentStreak,
        longestStreak: safeLongest,
        lastActiveDate: today,
        shouldUpdate: false
    };
}

/**
 * Retorna a data em string YYYY-MM-DD considerando o fuso horário local do usuário.
 * Substituto para Date.toISOString().split('T')[0] que retornava UTC.
 */
export function getLocalDateStr(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
