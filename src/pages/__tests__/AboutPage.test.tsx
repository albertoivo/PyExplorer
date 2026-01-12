import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AboutPage } from '../AboutPage';
import { MemoryRouter } from 'react-router-dom';

describe('AboutPage', () => {
    it('renders the GitHub Sponsors iframe', () => {
        render(
            <MemoryRouter>
                <AboutPage />
            </MemoryRouter>
        );

        const iframe = screen.getByTitle('Sponsor albertoivo');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', 'https://github.com/sponsors/albertoivo/card');
    });

    it('renders mission statement and values', () => {
        render(
            <MemoryRouter>
                <AboutPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Sobre o PyExplorer')).toBeInTheDocument();
        expect(screen.getByText('100% Gratuito')).toBeInTheDocument();
        expect(screen.getByText('Aprender Brincando')).toBeInTheDocument();
    });
});
