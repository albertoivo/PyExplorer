import { memo } from 'react';
import type { UserPet } from '../../../types/gamification';
import './PetAvatar.css';

interface PetAvatarProps {
    pet: UserPet;
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
    isFeeding?: boolean;
    isPetting?: boolean;
    disabled?: boolean;
}

export const PetAvatar = memo(({
    pet,
    size = 'medium',
    onClick,
    isFeeding = false,
    isPetting = false,
    disabled = false
}: PetAvatarProps) => {
    const getEmoji = () => {
        if (pet.stage === 'egg') return '🥚';
        if (pet.stage === 'baby') return '🐣';

        switch (pet.type) {
            case 'snake': return '🐍';
            case 'owl': return '🦉';
            case 'chameleon': return '🦎';
            case 'robot': return '🤖';
            case 'dragon': return '🐉';
            default: return '👾';
        }
    };

    const getMoodAnimation = () => {
        if (isFeeding) return 'pet-anim-eat';
        if (isPetting) return 'pet-anim-bounce';
        if (pet.mood === 'sleeping') return 'pet-anim-sleep';
        if (pet.mood === 'excited') return 'pet-anim-bounce';
        if (pet.mood === 'coding') return 'pet-anim-type';
        if (pet.mood === 'hungry') return 'pet-anim-shake';
        if (pet.mood === 'sad') return 'pet-anim-sad';
        return 'pet-anim-float';
    };

    const isInteractive = Boolean(onClick && !disabled);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isInteractive || !onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={`pet-avatar pet-avatar--${size} ${getMoodAnimation()} ${isInteractive ? 'pet-avatar--interactive' : ''} ${pet.stage === 'adult' ? 'pet-avatar--adult' : ''}`}
            onClick={isInteractive ? onClick : undefined}
            onKeyDown={isInteractive ? handleKeyDown : undefined}
            role={isInteractive ? 'button' : 'img'}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={`Pet ${pet.name} (${pet.type}, ${pet.mood})`}
        >
            <span className="pet-emoji">{getEmoji()}</span>
            {pet.stage === 'adult' && <span className="pet-crown" aria-hidden="true">👑</span>}
            {pet.mood === 'sleeping' && !isFeeding && !isPetting && <span className="pet-zzs">zzz</span>}
            {pet.mood === 'hungry' && !isFeeding && !isPetting && <span className="pet-thought" aria-hidden="true">🍖?</span>}
            {pet.mood === 'coding' && !isFeeding && !isPetting && <span className="pet-thought" aria-hidden="true">💻</span>}
            {pet.mood === 'sad' && !isFeeding && !isPetting && <span className="pet-thought" aria-hidden="true">💧</span>}
            {pet.mood === 'excited' && !isFeeding && !isPetting && <span className="pet-thought" aria-hidden="true">✨</span>}
            {(isFeeding || isPetting) && <span className="pet-heart-float" aria-hidden="true">💖</span>}
        </div>
    );
});

