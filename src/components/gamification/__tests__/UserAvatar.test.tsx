import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from '../UserAvatar';

// Mock shop items
vi.mock('../../../data/gamificationData', () => ({
    SHOP_ITEMS: [
        { id: 'avatar_snake_green', name: 'Cobra Verde', icon: '🐍', type: 'avatar' },
        { id: 'avatar_dog', name: 'Dog', icon: '🐶', type: 'avatar' },
        { id: 'frame_basic', name: 'Moldura Simples', color: '#000000', type: 'frame' },
        { id: 'frame_rainbow', name: 'Rainbow Frame', color: 'rainbow', type: 'frame' },
    ]
}));

describe('UserAvatar Component', () => {
    it('renders default avatar correctly', () => {
        render(<UserAvatar />);
        expect(screen.getByText('🐍')).toBeInTheDocument();
        // Title format is "Name com FrameName"
        const avatar = screen.getByTitle('Cobra Verde com Moldura Simples');
        expect(avatar).toHaveClass('user-avatar--medium');
    });

    it('renders specific avatar and frame', () => {
        render(<UserAvatar avatarId="avatar_dog" frameId="frame_rainbow" size="large" />);
        expect(screen.getByText('🐶')).toBeInTheDocument();
        const avatar = screen.getByTitle('Dog com Rainbow Frame');
        expect(avatar).toHaveClass('user-avatar--large');
        expect(avatar).toHaveClass('user-avatar--rainbow');
    });

    it('applies custom className', () => {
        render(<UserAvatar className="custom-class" />);
        const avatar = screen.getByTitle(/Cobra Verde/);
        expect(avatar).toHaveClass('custom-class');
    });

    it('handles fallback for invalid/missing ids', () => {
        render(<UserAvatar avatarId="invalid_avatar" frameId="invalid_frame" />);

        // Fallback logic uses '🐍'
        expect(screen.getByText('🐍')).toBeInTheDocument();

        // Frame color fallback is transparent
        const avatar = document.querySelector('.user-avatar');
        expect(avatar).toHaveStyle({ '--frame-color': 'transparent' });
    });

    it('sets css variable for frame color', () => {
         render(<UserAvatar frameId="frame_basic" />);
         const avatar = document.querySelector('.user-avatar');
         expect(avatar).toHaveStyle({ '--frame-color': '#000000' });
    });
});
