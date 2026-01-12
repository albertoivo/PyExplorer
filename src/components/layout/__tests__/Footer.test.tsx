import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../Footer';
import { MemoryRouter } from 'react-router-dom';

describe('Footer', () => {
    it('renders support link pointing to GitHub Sponsors', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        const supportLink = screen.getByRole('link', { name: /💜 Apoie o Projeto/i });
        expect(supportLink).toBeInTheDocument();
        expect(supportLink).toHaveAttribute('href', 'https://github.com/sponsors/albertoivo');
        expect(supportLink).toHaveAttribute('target', '_blank');
    });

    it('renders copyright and badges', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText(/© 2026 PyExplorer/i)).toBeInTheDocument();
        expect(screen.getByText('🎓 Educativo')).toBeInTheDocument();
        expect(screen.getByText('🔒 Seguro para crianças')).toBeInTheDocument();
    });
});
