import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from '../SEO';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SEO Component', () => {
    // Wrapper to provide Helmet context
    const renderWithHelmet = (component: React.ReactNode) => {
        return render(
            <HelmetProvider>
                {component}
            </HelmetProvider>
        );
    };

    beforeEach(() => {
        // Reset title before each test
        document.title = 'Original Title';
    });

    afterEach(() => {
        // Cleanup title if needed
    });

    it('updates the document title correctly', async () => {
        renderWithHelmet(<SEO title="Test Page" />);

        await waitFor(() => {
            expect(document.title).toBe('Test Page | PyExplorer');
        });
    });

    it('renders default description if none provided', async () => {
        renderWithHelmet(<SEO title="Test" />);

        await waitFor(() => {
            const metaDesc = document.querySelector('meta[name="description"]');
            expect(metaDesc).not.toBeNull();
            expect(metaDesc?.getAttribute('content')).toContain('Aprenda Python de forma divertida');
        });
    });

    it('renders custom description when provided', async () => {
        const customDesc = 'This is a custom description for testing.';
        renderWithHelmet(<SEO title="Test" description={customDesc} />);

        await waitFor(() => {
            const metaDesc = document.querySelector('meta[name="description"]');
            expect(metaDesc?.getAttribute('content')).toBe(customDesc);
        });
    });

    it('renders Open Graph tags correctly', async () => {
        renderWithHelmet(
            <SEO
                title="Social Page"
                description="Social Desc"
                type="article"
            />
        );

        await waitFor(() => {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogType = document.querySelector('meta[property="og:type"]');
            const ogDesc = document.querySelector('meta[property="og:description"]');

            expect(ogTitle?.getAttribute('content')).toBe('Social Page | PyExplorer');
            expect(ogType?.getAttribute('content')).toBe('article');
            expect(ogDesc?.getAttribute('content')).toBe('Social Desc');
        });
    });

    it('renders Twitter Card tags correctly', async () => {
        renderWithHelmet(<SEO title="Twitter Test" />);

        await waitFor(() => {
            const twitterCard = document.querySelector('meta[name="twitter:card"]');
            const twitterTitle = document.querySelector('meta[name="twitter:title"]');

            expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
            expect(twitterTitle?.getAttribute('content')).toBe('Twitter Test | PyExplorer');
        });
    });

    it('uses canonical URL when provided', async () => {
        const canonical = 'https://pyexplorer.com/custom-url';
        renderWithHelmet(<SEO title="Canonical Test" canonical={canonical} />);

        await waitFor(() => {
            const link = document.querySelector('link[rel="canonical"]');
            expect(link?.getAttribute('href')).toBe(canonical);
        });
    });
});
