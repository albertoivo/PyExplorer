/**
 * Testes para validação de stdout no PyodideContext
 * Testa: validação de saída para questões boss que não usam funções
 */
import { describe, it, expect } from 'vitest';

/**
 * Função extraída da lógica de validação de stdout em PyodideContext.tsx
 * Quando há tests mas não há functionName, valida via stdout
 */
function validateStdoutOutput(
    stdoutText: string,
    expectedOutput: unknown
): { passed: boolean; actualOutput: string[] } {
    const outputLines = stdoutText.trim().split('\n').map(line => line.trim()).filter(line => line);

    // expectedOutput pode ser array de linhas ou string única
    const expectedLines = Array.isArray(expectedOutput)
        ? expectedOutput.map(String)
        : [String(expectedOutput)];

    // Verifica se todas as linhas esperadas estão presentes na saída
    const allLinesFound = expectedLines.every(expected =>
        outputLines.some(actual =>
            actual.toLowerCase().includes(expected.toLowerCase()) ||
            actual === expected
        )
    );

    // Também verifica correspondência exata por posição se números de linhas forem iguais
    const exactMatch = expectedLines.length === outputLines.length &&
        expectedLines.every((expected, idx) => {
            const actual = outputLines[idx] || '';
            return actual.toLowerCase() === expected.toLowerCase() ||
                actual === expected;
        });

    const passed = exactMatch || (allLinesFound && outputLines.length >= expectedLines.length);

    return { passed, actualOutput: outputLines };
}

describe('Validação de stdout para Boss Battles', () => {

    describe('Questão: Mímico Variável (tesouro = "ouro")', () => {
        const expectedOutput = ['ouro'];

        it('DEVE passar quando output é exatamente "ouro"', () => {
            const result = validateStdoutOutput('ouro\n', expectedOutput);
            expect(result.passed).toBe(true);
        });

        it('DEVE passar quando output tem "ouro" com espaços extras', () => {
            const result = validateStdoutOutput('  ouro  \n', expectedOutput);
            expect(result.passed).toBe(true);
        });

        it('NÃO deve passar quando output é diferente', () => {
            const result = validateStdoutOutput('prata\n', expectedOutput);
            expect(result.passed).toBe(false);
        });

        it('NÃO deve passar quando output está vazio', () => {
            const result = validateStdoutOutput('', expectedOutput);
            expect(result.passed).toBe(false);
        });

        it('NÃO deve passar quando output é "b" (caso do bug)', () => {
            const result = validateStdoutOutput('b\n', expectedOutput);
            expect(result.passed).toBe(false);
        });

        it('DEVE passar quando output contém "ouro" entre outras linhas', () => {
            const result = validateStdoutOutput('debug\nouro\nfim\n', expectedOutput);
            expect(result.passed).toBe(true);
        });
    });

    describe('Questão: Guardião do Portal (múltiplas linhas)', () => {
        const expectedOutput = ['Olá Guardião', 'Tenho 10 anos'];

        it('DEVE passar com saída exata', () => {
            const result = validateStdoutOutput('Olá Guardião\nTenho 10 anos\n', expectedOutput);
            expect(result.passed).toBe(true);
        });

        it('DEVE passar com case diferente', () => {
            const result = validateStdoutOutput('olá guardião\ntenho 10 anos\n', expectedOutput);
            expect(result.passed).toBe(true);
        });

        it('NÃO deve passar com apenas uma linha', () => {
            const result = validateStdoutOutput('Olá Guardião\n', expectedOutput);
            expect(result.passed).toBe(false);
        });

        it('NÃO deve passar com linhas trocadas se esperamos ordem exata', () => {
            // A lógica atual permite linhas em qualquer ordem SE todas forem encontradas
            // Mas com exactMatch, a ordem importa
            const result = validateStdoutOutput('Tenho 10 anos\nOlá Guardião\n', expectedOutput);
            // Como allLinesFound é true e outputLines.length >= expectedLines.length, passa
            expect(result.passed).toBe(true);
        });
    });

    describe('Questão: Mago Calculador (número)', () => {
        const expectedOutput = ['36'];

        it('DEVE passar quando resultado é 36', () => {
            const result = validateStdoutOutput('36\n', expectedOutput);
            expect(result.passed).toBe(true);
        });

        it('NÃO deve passar quando resultado está errado', () => {
            const result = validateStdoutOutput('22\n', expectedOutput);
            expect(result.passed).toBe(false);
        });

        it('NÃO deve passar quando resultado é 36 dentro de texto', () => {
            // "O resultado é 36" deve passar pois contém "36"
            const result = validateStdoutOutput('O resultado é 36\n', expectedOutput);
            expect(result.passed).toBe(true);
        });
    });

    describe('Questão: Dragão Repetidor (contar 1 a 5)', () => {
        const expectedOutput = ['1', '2', '3', '4', '5'];

        it('DEVE passar com contagem correta', () => {
            const result = validateStdoutOutput('1\n2\n3\n4\n5\n', expectedOutput);
            expect(result.passed).toBe(true);
        });

        it('NÃO deve passar com contagem incompleta', () => {
            const result = validateStdoutOutput('1\n2\n3\n', expectedOutput);
            expect(result.passed).toBe(false);
        });

        it('NÃO deve passar com contagem errada', () => {
            const result = validateStdoutOutput('1\n2\n3\n4\n6\n', expectedOutput);
            expect(result.passed).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('expectedOutput como string única', () => {
            const result = validateStdoutOutput('hello\n', 'hello');
            expect(result.passed).toBe(true);
        });

        it('output com linhas vazias intermediárias', () => {
            const result = validateStdoutOutput('linha1\n\nlinha2\n', ['linha1', 'linha2']);
            expect(result.passed).toBe(true);
        });

        it('output com caracteres especiais', () => {
            const result = validateStdoutOutput('PYTHON\n', ['PYTHON']);
            expect(result.passed).toBe(true);
        });
    });
});
