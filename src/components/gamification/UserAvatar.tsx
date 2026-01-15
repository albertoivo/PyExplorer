import { SHOP_ITEMS } from '../../data/gamificationData';
import './UserAvatar.css';

interface UserAvatarProps {
    avatarId?: string;
    frameId?: string;
    size?: 'small' | 'medium' | 'large' | 'xl';
    className?: string;
}

export function UserAvatar({
    avatarId = 'avatar_snake_green',
    frameId = 'frame_basic',
    size = 'medium',
    className = ''
}: UserAvatarProps) {
    const avatarItem = SHOP_ITEMS.find(i => i.id === avatarId);
    const frameItem = SHOP_ITEMS.find(i => i.id === frameId);

    // Fallback safe
    const avatarIcon = avatarItem?.icon || '🐍';
    const frameColor = frameItem?.color || 'transparent'; // Default to transparent if no color

    // Custom styles for frame
    const style: React.CSSProperties = {
        '--frame-color': frameColor === 'rainbow'
            ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
            : frameColor.startsWith('#') ? frameColor : 'transparent',
    } as React.CSSProperties;

    // Special class for rainbow
    const frameClass = frameColor === 'rainbow' ? 'user-avatar--rainbow' : '';

    // Size mapping handled in CSS
    // const sizeMap = {
    //     small: '32px',
    //     medium: '48px',
    //     large: '80px',
    //     xl: '120px'
    // };

    return (
        <div
            className={`user-avatar user-avatar--${size} ${frameClass} ${className}`}
            style={style}
            title={`${avatarItem?.name || ''} com ${frameItem?.name || ''}`}
        >
            <div className="user-avatar__frame"></div>
            <div className="user-avatar__content">
                {avatarIcon}
            </div>
        </div>
    );
}
