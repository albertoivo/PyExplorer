/**
 * Compara outputs considerando diferentes tipos
 */
export function compareOutputs(actual: unknown, expected: unknown): boolean {
    // Comparação direta
    if (actual === expected) return true;

    // Comparação de strings (ignorando espaços extras)
    if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.trim() === expected.trim();
    }

    // Comparação de números (com tolerância para floats)
    if (typeof actual === 'number' && typeof expected === 'number') {
        return Math.abs(actual - expected) < 0.0001;
    }

    // Comparação de arrays e objetos via JSON
    try {
        return JSON.stringify(actual) === JSON.stringify(expected);
    } catch {
        return false;
    }
}

/**
 * Formata mensagens de erro do Python para serem mais amigáveis
 */
export function formatPythonError(error: string): string {
    // Remove caminhos de arquivo longos
    let formatted = error.replace(/File ".*?", /g, '');

    // Traduz erros comuns
    const translations: [RegExp, string][] = [
        [/SyntaxError: invalid syntax/g, '❌ Erro de Sintaxe: Algo está escrito errado no código'],
        [/NameError: name '(.+)' is not defined/g, '❌ Ops! O nome "$1" não foi criado ainda'],
        [/IndentationError/g, '❌ Erro de Espaçamento: Verifique os espaços no início das linhas'],
        [/TypeError/g, '❌ Erro de Tipo: Você misturou tipos diferentes (como texto e número)'],
        [/ZeroDivisionError/g, '❌ Ops! Não podemos dividir por zero!'],
        [/IndexError/g, '❌ Erro de Índice: Você tentou acessar algo que não existe na lista'],
    ];

    for (const [pattern, replacement] of translations) {
        formatted = formatted.replace(pattern, replacement);
    }

    return formatted;
}
