import { useState, useCallback } from 'react';

/**
 * Hook customizado para gerenciar estado persistido no localStorage.
 * Semelhante ao useState, mas sincroniza alterações com o localStorage.
 *
 * @param key Chave a ser usada no localStorage
 * @param initialValue Valor inicial caso não exista no localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Inicializa o estado lendo do localStorage, se possível
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Analisa JSON armazenado ou, se não houver, retorna o valor inicial
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Retorna uma versão embutida da função de configuração de estado que ...
    // ... persiste o novo valor no localStorage.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        // Permite que value seja uma função, para ter a mesma API de useState
        setStoredValue((prevState) => {
            const valueToStore = value instanceof Function ? value(prevState) : value;
            try {
                // Salva o estado atual
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
            return valueToStore;
        });
    }, [key]);

    return [storedValue, setValue];
}
