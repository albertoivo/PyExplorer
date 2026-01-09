import { describe, it, expect } from 'vitest';
import { app } from '../firebaseConfig';

describe('Firebase Configuration', () => {
    it('should be initialized with valid configuration', () => {
        const config = app.options;

        // Ensure critical fields are present
        expect(config.apiKey).toBeDefined();
        expect(config.authDomain).toBeDefined();
        expect(config.projectId).toBeDefined();

        // Ensure we are NOT using the placeholder values
        expect(config.apiKey).not.toBe('YOUR_API_KEY');
        expect(config.authDomain).not.toBe('YOUR_AUTH_DOMAIN');
        expect(config.projectId).not.toBe('YOUR_PROJECT_ID');
        expect(config.storageBucket).not.toBe('YOUR_STORAGE_BUCKET');
        expect(config.messagingSenderId).not.toBe('YOUR_MESSAGING_SENDER_ID');
        expect(config.appId).not.toBe('YOUR_APP_ID');

        // Optional: Verify specific values if needed for this environment
        // We know what they should be in this fix, so we can check them to ensure our hardcoding worked
        // BUT to be less brittle as requested, we mainly check they are "real-looking" values
        expect(config.projectId).toBe('pyexplorer-cd32d');
        expect(config.apiKey?.length).toBeGreaterThan(20);
    });
});
