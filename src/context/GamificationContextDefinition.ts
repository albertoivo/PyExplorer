import { createContext } from 'react';
import type { useGamification as useGamificationHook } from '../hooks/useGamification';

export const GamificationContext = createContext<ReturnType<typeof useGamificationHook> | null>(null);
