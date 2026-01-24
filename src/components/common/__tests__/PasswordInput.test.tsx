import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../PasswordInput';
import { describe, it, expect, vi } from 'vitest';

describe('PasswordInput', () => {
    it('renders with type password initially', () => {
        render(<PasswordInput id="password" placeholder="Enter password" />);
        const input = screen.getByPlaceholderText('Enter password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('toggles password visibility when button is clicked', () => {
        render(<PasswordInput id="password" placeholder="Enter password" />);
        const input = screen.getByPlaceholderText('Enter password');
        const toggleButton = screen.getByLabelText('Mostrar senha');

        // Click to show password
        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute('type', 'text');
        expect(screen.getByLabelText('Ocultar senha')).toBeInTheDocument();

        // Click to hide password
        fireEvent.click(screen.getByLabelText('Ocultar senha'));
        expect(input).toHaveAttribute('type', 'password');
        expect(screen.getByLabelText('Mostrar senha')).toBeInTheDocument();
    });

    it('passes other props to input element', () => {
        const handleChange = vi.fn();
        render(
            <PasswordInput
                id="password"
                placeholder="Enter password"
                onChange={handleChange}
                disabled
                required
            />
        );
        const input = screen.getByPlaceholderText('Enter password');

        expect(input).toBeDisabled();
        expect(input).toBeRequired();

        // Simulating change on disabled input usually doesn't work in browsers but RTL might allow it.
        // Let's re-render enabled for change test
    });

    it('calls onChange when typed into', () => {
        const handleChange = vi.fn();
        render(<PasswordInput id="password" placeholder="Enter password" onChange={handleChange} />);
        const input = screen.getByPlaceholderText('Enter password');

        fireEvent.change(input, { target: { value: 'secret' } });
        expect(handleChange).toHaveBeenCalled();
    });
});
