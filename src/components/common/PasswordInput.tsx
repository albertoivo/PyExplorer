import React, { useState } from 'react';
import './PasswordInput.css';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="password-input-wrapper">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
            />
            <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
                {showPassword ? (
                    // Eye Off Icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19.5c-5 0-9.27-3.11-11-7.5a11.89 11.89 0 0 1 4.25-5.17l2.97 2.97c-.61.33-1.16.78-1.58 1.33A7.95 7.95 0 0 0 12 17c1.74 0 3.35-.55 4.71-1.48l1.23 1.23zM3.41 4.86L2 6.27l6.97 6.97c.65.17 1.34.26 2.03.26.28 0 .55-.02.82-.04l5.91 5.91 1.41-1.41L3.41 4.86zm7.42-2.36L13.8 5.47A7.94 7.94 0 0 1 17.18 8c.53.81.93 1.7 1.18 2.65l1.64 1.64c.24-.76.43-1.54.56-2.34A12.06 12.06 0 0 0 12 2.5c-1.99 0-3.88.5-5.59 1.37l1.79 1.79c1.21-.45 2.51-.66 3.8-.66z"/>
                    </svg>
                ) : (
                    // Eye Icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                )}
            </button>
        </div>
    );
};
