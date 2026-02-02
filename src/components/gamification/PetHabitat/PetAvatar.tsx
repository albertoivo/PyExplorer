import { memo } from 'react';
import type { UserPet } from '../../../types/gamification';
import './PetAvatar.css';

interface PetAvatarProps {
    pet: UserPet;
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
}

export const PetAvatar = memo(({ pet, size = 'medium', onClick }: PetAvatarProps) => {
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
        if (pet.mood === 'sleeping') return 'pet-anim-sleep';
        if (pet.mood === 'excited') return 'pet-anim-bounce';
        if (pet.mood === 'coding') return 'pet-anim-type';
        if (pet.mood === 'hungry') return 'pet-anim-shake';
        return 'pet-anim-float';
    };

    return (
        <div
            className={`pet-avatar pet-avatar--${size} ${getMoodAnimation()}`}
            onClick={onClick}
            role="img"
            aria-label={`Pet ${pet.name} (${pet.type}, ${pet.mood})`}
        >
            <span className="pet-emoji">{getEmoji()}</span>
            {pet.mood === 'sleeping' && <span className="pet-zzs">zzz</span>}
            {pet.mood === 'hungry' && <span className="pet-thought">🍖?</span>}
            {pet.mood === 'coding' && <span className="pet-thought">💻</span>}
        </div>
    );
});
