import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar, WorldProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
    it('renders with label and percentage', () => {
        render(<ProgressBar current={50} max={100} label="Loading..." />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('50/100 (50%)')).toBeInTheDocument();
    });

    it('renders correct width based on percentage', () => {
        const { container } = render(<ProgressBar current={50} max={100} />);
        const fill = container.querySelector('.progress-bar__fill');
        expect(fill).toHaveStyle('width: 50%');
    });

    it('should have accessible role and attributes', () => {
        render(<ProgressBar current={50} max={100} label="Progress" />);
        // This is expected to fail before my changes
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
        expect(progressBar).toHaveAttribute('aria-label', 'Progress');
    });
});

describe('WorldProgressBar', () => {
    it('renders with world info', () => {
        render(<WorldProgressBar worldName="Python World" worldIcon="🐍" completed={5} total={10} />);
        expect(screen.getByText('Python World')).toBeInTheDocument();
        expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should have accessible role and attributes', () => {
        render(<WorldProgressBar worldName="Python World" worldIcon="🐍" completed={5} total={10} />);
        // This is expected to fail before my changes
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '5');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '10');
        expect(progressBar).toHaveAttribute('aria-label', 'Progresso em Python World');
    });
});
