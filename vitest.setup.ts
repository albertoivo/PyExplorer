// Add any global setup for tests here if needed.
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import i18n from './src/i18n';

class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

globalThis.ResizeObserver = ResizeObserverMock;
if (typeof window !== 'undefined') {
    window.ResizeObserver = ResizeObserverMock;
}

beforeEach(async () => {
    // Reset to default Portuguese for unit tests expecting PT copy
    await i18n.changeLanguage('pt');
});
