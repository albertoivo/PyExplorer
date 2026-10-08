import i18n from '../i18n';

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

    const t = (key: string, def: string, options?: Record<string, unknown>) => {
        try {
            return i18n.t(`pythonErrors.${key}` as never, { defaultValue: def, ns: 'game', ...options });
        } catch {
            return def;
        }
    };

    // Traduz erros comuns
    formatted = formatted.replace(
        /SyntaxError: invalid syntax/g,
        t('syntaxError', '❌ Erro de Sintaxe: Algo está escrito errado no código')
    );

    formatted = formatted.replace(
        /NameError: name '(.+)' is not defined/g,
        (_, name) => t('nameError', `❌ Ops! O nome "${name}" não foi criado ainda`, { name })
    );

    formatted = formatted.replace(
        /IndentationError/g,
        t('indentationError', '❌ Erro de Espaçamento: Verifique os espaços no início das linhas')
    );

    formatted = formatted.replace(
        /TypeError/g,
        t('typeError', '❌ Erro de Tipo: Você misturou tipos diferentes (como texto e número)')
    );

    formatted = formatted.replace(
        /ZeroDivisionError/g,
        t('zeroDivisionError', '❌ Ops! Não podemos dividir por zero!')
    );

    formatted = formatted.replace(
        /IndexError/g,
        t('indexError', '❌ Erro de Índice: Você tentou acessar algo que não existe na lista')
    );

    return formatted;
}
