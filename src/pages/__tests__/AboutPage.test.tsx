import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AboutPage } from '../AboutPage';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

describe('AboutPage', () => {
    it('renders the GitHub Sponsors iframe', () => {
        render(
            <HelmetProvider>
                <MemoryRouter>
                    <AboutPage />
                </MemoryRouter>
            </HelmetProvider>
        );

        const iframe = screen.getByTitle('Sponsor albertoivo');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', 'https://github.com/sponsors/albertoivo/card');
    });

    it('renders mission statement and values', () => {
        render(
            <HelmetProvider>
                <MemoryRouter>
                    <AboutPage />
                </MemoryRouter>
            </HelmetProvider>
        );

        expect(screen.getByText('Sobre o PyExplorer')).toBeInTheDocument();
        expect(screen.getByText('100% Gratuito')).toBeInTheDocument();
        expect(screen.getByText('Aprender Brincando')).toBeInTheDocument();
    });
});
