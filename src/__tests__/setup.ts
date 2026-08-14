import '@testing-library/jest-dom'
import { vi } from 'vitest'
import '../i18n'

// Mock queryCommandSupported for Monaco editor compatibility in jsdom
if (typeof document !== 'undefined') {
    document.queryCommandSupported = document.queryCommandSupported || (() => false);
}

// Mock Firebase Analytics to prevent "API key not valid" errors in tests
vi.mock('firebase/analytics', () => ({
    getAnalytics: vi.fn(),
    logEvent: vi.fn(),
    isSupported: vi.fn().mockResolvedValue(false),
}));

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
