/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Configuração específica para rodar testes de Regras do Firestore
// Usada pelo comando "npm run test:rules"
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/__tests__/firestore.rules.test.ts'], // Inclui explicitamente apenas este arquivo
        exclude: [
            'node_modules/**',
            // A exclusão que existe no vitest.config.ts principal NÃO é aplicada aqui
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/__tests__/setup.ts',
            ],
        },
    },
})
