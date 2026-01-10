import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryModal } from '../components/game/StoryModal';
import { STORY_CHAPTERS } from '../data/gamificationData';

describe('StoryModal', () => {
    const mockEpisode = STORY_CHAPTERS[0]; // Intro do basic_commands
    const mockOnComplete = vi.fn();

    it('renders initial state correctly', () => {
        render(<StoryModal episode={mockEpisode} onComplete={mockOnComplete} />);

        expect(screen.getByText(mockEpisode.title)).toBeDefined();
        // First dialogue
        expect(screen.getByText(mockEpisode.dialogue[0].text)).toBeDefined();
        expect(screen.getByText(mockEpisode.dialogue[0].speaker)).toBeDefined();
        expect(screen.getByText(`1 / ${mockEpisode.dialogue.length}`)).toBeDefined();
    });

    it('advances dialogue on next click', () => {
        render(<StoryModal episode={mockEpisode} onComplete={mockOnComplete} />);

        const nextBtn = screen.getByText('Próximo ➡️');
        fireEvent.click(nextBtn);

        // Should show second dialogue
        expect(screen.getByText(mockEpisode.dialogue[1].text)).toBeDefined();
        expect(screen.getByText(`2 / ${mockEpisode.dialogue.length}`)).toBeDefined();
    });

    it('calls onComplete when skip is clicked', () => {
        render(<StoryModal episode={mockEpisode} onComplete={mockOnComplete} />);

        const skipBtn = screen.getByText('Pular');
        fireEvent.click(skipBtn);

        expect(mockOnComplete).toHaveBeenCalled();
    });

    it('calls onComplete when finishing story', () => {
        render(<StoryModal episode={mockEpisode} onComplete={mockOnComplete} />);

        const nextBtn = screen.getByText('Próximo ➡️');

        // Click through all dialogues until the last one
        for (let i = 0; i < mockEpisode.dialogue.length - 1; i++) {
            fireEvent.click(nextBtn);
        }

        // Button should change to "Start Adventure"
        const finishBtn = screen.getByText(/Começar Aventura/i);
        fireEvent.click(finishBtn);

        expect(mockOnComplete).toHaveBeenCalled();
    });
});
