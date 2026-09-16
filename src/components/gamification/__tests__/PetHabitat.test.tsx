import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PetHabitat } from '../PetHabitat/PetHabitat';
import type { UserPet } from '../../../types/gamification';
import type { UserData } from '../../../types/question';

// Mocks
const mockFeedPet = vi.fn();
const mockPlaySound = vi.fn();

let mockPet: UserPet | null = null;
let mockUserData: Partial<UserData> | null = null;
let mockIsGuest = false;

vi.mock('../../../context/GamificationContext', () => ({
    useGamification: () => ({
        pet: mockPet,
        feedPet: mockFeedPet,
    }),
}));

vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        userData: mockUserData,
        isGuest: mockIsGuest,
    }),
}));

vi.mock('../../../utils/soundEffects', () => ({
    playSound: (type: string) => mockPlaySound(type),
}));

describe('PetHabitat', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockFeedPet.mockReset().mockReturnValue(true);
        mockPlaySound.mockReset();
        mockIsGuest = false;
        mockUserData = {
            uid: 'user-1',
            balance: 50,
            displayName: 'Dev Player',
            avatar: '',
            email: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            totalScore: 100,
            unlockedWorlds: [],
        };
        mockPet = {
            name: 'Ovo Quentinho',
            stage: 'egg',
            type: 'generic',
            xp: 25,
            level: 1,
            hunger: 80,
            mood: 'sleeping',
            evolutionPath: {},
            lastFedAt: new Date().toISOString(),
        };
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('returns null when pet is not defined', () => {
        mockPet = null;
        const { container } = render(<PetHabitat />);
        expect(container.firstChild).toBeNull();
    });

    it('renders egg stage with warming labels and fire icon', () => {
        render(<PetHabitat />);

        expect(screen.getByText('Ovo Quentinho')).toBeInTheDocument();
        expect(screen.getByText('Lvl 1')).toBeInTheDocument();
        expect(screen.getByText('Ovo')).toBeInTheDocument();
        expect(screen.getByText('Dormindo')).toBeInTheDocument();
        expect(screen.getByText('Calor do Ovo')).toBeInTheDocument();
        expect(screen.getByText('80%')).toBeInTheDocument();
        expect(screen.getByText('25/50')).toBeInTheDocument();

        // Button should say "Aquecer Ovo (10 ⭐)"
        const heatBtn = screen.getByRole('button', { name: /Aquecer Ovo/i });
        expect(heatBtn).toBeEnabled();
        expect(heatBtn).toHaveClass('pet-feed-btn--heat');
    });

    it('renders hatched pet with meat icon and feed labels', () => {
        mockPet = {
            name: 'Pytinho',
            stage: 'baby',
            type: 'snake',
            xp: 60,
            level: 2,
            hunger: 40,
            mood: 'happy',
            evolutionPath: { loops: 60 },
            lastFedAt: new Date().toISOString(),
        };

        render(<PetHabitat />);

        expect(screen.getByText('Pytinho')).toBeInTheDocument();
        expect(screen.getByText('Lvl 2')).toBeInTheDocument();
        expect(screen.getByText('Filhote')).toBeInTheDocument();
        expect(screen.getByText('Cobra')).toBeInTheDocument();
        expect(screen.getByText('Feliz')).toBeInTheDocument();
        expect(screen.getByText('Energia do Pet')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();

        // 60 % 50 = 10 XP in current level
        expect(screen.getByText('10/50')).toBeInTheDocument();

        const feedBtn = screen.getByRole('button', { name: /Alimentar/i });
        expect(feedBtn).toBeEnabled();
        expect(feedBtn).not.toHaveClass('pet-feed-btn--heat');
    });

    it('renders accessible progress bars with correct ARIA attributes', () => {
        render(<PetHabitat />);

        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars).toHaveLength(2);

        // XP bar
        const xpBar = progressBars[0];
        expect(xpBar).toHaveAttribute('aria-valuenow', '25');
        expect(xpBar).toHaveAttribute('aria-valuemin', '0');
        expect(xpBar).toHaveAttribute('aria-valuemax', '50');

        // Heat/Hunger bar
        const energyBar = progressBars[1];
        expect(energyBar).toHaveAttribute('aria-valuenow', '80');
        expect(energyBar).toHaveAttribute('aria-valuemin', '0');
        expect(energyBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('executes handleFeed successfully, plays success sound and resets feeding state', () => {
        render(<PetHabitat />);

        const heatBtn = screen.getByRole('button', { name: /Aquecer Ovo/i });
        fireEvent.click(heatBtn);

        expect(mockFeedPet).toHaveBeenCalledTimes(1);
        expect(mockPlaySound).toHaveBeenCalledWith('success');

        // While feeding, button text reflects active action
        expect(screen.getByText(/Aquecendo\.\.\./i)).toBeInTheDocument();

        // Advance timers past feeding duration
        act(() => {
            vi.advanceTimersByTime(700);
        });

        expect(screen.queryByText(/Aquecendo\.\.\./i)).not.toBeInTheDocument();
    });

    it('handles guest state properly by disabling feed and guiding user to sign in', () => {
        mockIsGuest = true;
        render(<PetHabitat />);

        const btn = screen.getByRole('button', { name: /Entrar para Cuidar/i });
        expect(btn).toBeDisabled();
        expect(btn).toHaveAttribute('title', expect.stringContaining('Crie uma conta'));

        // Clicking button when disabled doesn't fire
        fireEvent.click(btn);
        expect(mockFeedPet).not.toHaveBeenCalled();
    });

    it('handles insufficient balance (< 10 stars) by disabling feed button', () => {
        mockUserData = { ...mockUserData, balance: 5 };
        render(<PetHabitat />);

        const btn = screen.getByRole('button', { name: /Aquecer Ovo/i });
        expect(btn).toBeDisabled();
        expect(btn).toHaveAttribute('title', expect.stringContaining('10 ⭐'));

        // Clicking avatar plays error sound
        const avatar = screen.getByRole('button', { name: /Pet Ovo Quentinho/i });
        fireEvent.click(avatar);
        expect(mockPlaySound).toHaveBeenCalledWith('error');
        expect(mockFeedPet).not.toHaveBeenCalled();
    });

    it('handles full pet (100% hunger): shows pet full button and allows petting on click', () => {
        if (mockPet) mockPet.hunger = 100;
        render(<PetHabitat />);

        const btn = screen.getByRole('button', { name: /Ovo Aquecido/i });
        expect(btn).toBeDisabled();
        expect(btn).toHaveAttribute('title', expect.stringContaining('aquecido'));

        // Clicking avatar when full triggers petting with 'click' sound
        const avatar = screen.getByRole('button', { name: /Pet Ovo Quentinho/i });
        fireEvent.click(avatar);

        expect(mockPlaySound).toHaveBeenCalledWith('click');
        expect(mockFeedPet).not.toHaveBeenCalled();

        // Shows heart float
        expect(screen.getByText('💖')).toBeInTheDocument();

        // Petting resets after timer
        act(() => {
            vi.advanceTimersByTime(900);
        });
        expect(screen.queryByText('💖')).not.toBeInTheDocument();
    });

    it('supports keyboard interaction on PetAvatar with Enter and Space', () => {
        render(<PetHabitat />);

        const avatar = screen.getByRole('button', { name: /Pet Ovo Quentinho/i });
        avatar.focus();

        act(() => {
            fireEvent.keyDown(avatar, { key: 'Enter' });
        });
        expect(mockFeedPet).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(700);
        });

        act(() => {
            fireEvent.keyDown(avatar, { key: ' ' });
        });
        expect(mockFeedPet).toHaveBeenCalledTimes(2);

        act(() => {
            vi.advanceTimersByTime(700);
        });
    });

    it('displays adult crown when pet reaches adult stage', () => {
        mockPet = {
            name: 'Dragão Mestre',
            stage: 'adult',
            type: 'dragon',
            xp: 1300,
            level: 27,
            hunger: 90,
            mood: 'excited',
            evolutionPath: { lists: 1300 },
            lastFedAt: new Date().toISOString(),
        };

        render(<PetHabitat />);

        expect(screen.getByText('👑')).toBeInTheDocument();
        expect(screen.getByText('Adulto')).toBeInTheDocument();
        expect(screen.getByText('Dragão')).toBeInTheDocument();
    });

    it('applies critical pulse style when hunger is below 20%', () => {
        if (mockPet) mockPet.hunger = 15;
        const { container } = render(<PetHabitat />);

        const criticalBar = container.querySelector('.pet-bar-fill--critical');
        expect(criticalBar).toBeInTheDocument();
    });
});
