/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [react()],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/__tests__/setup.ts'],
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            exclude: [
                'node_modules/**',
                'src/__tests__/firestore.rules.test.ts', // Needs emulator
            ],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
                exclude: [
                    'node_modules/',
                    'src/__tests__/setup.ts',
                ],
            },
            env: {
                ...process.env,
                ...env,
            },
        },
    }
})
