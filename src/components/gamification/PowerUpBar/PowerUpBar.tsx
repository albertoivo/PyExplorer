import type { UserPowerUps, PowerUpType } from '../../../types/gamification';
import { POWERUPS } from '../../../data/gamificationData';
import './PowerUpBar.css';

interface PowerUpBarProps {
    userPowerUps: UserPowerUps;
    userStars: number;
    onUsePowerUp: (type: PowerUpType) => boolean;
    onBuyPowerUp: (type: PowerUpType) => boolean;
    activePowerUp?: PowerUpType | null;
}

/**
 * Barra de power-ups disponíveis
 */
export function PowerUpBar({
    userPowerUps,
    userStars,
    onUsePowerUp,
    onBuyPowerUp,
    activePowerUp,
}: PowerUpBarProps) {
    const today = new Date().toISOString().split('T')[0];
    const isResetNeeded = userPowerUps.lastResetDate !== today;

    const getUsesLeft = (type: PowerUpType) => {
        const powerUp = POWERUPS.find(p => p.id === type);
        if (!powerUp) return 0;
        const usesToday = isResetNeeded ? 0 : userPowerUps.usesToday[type];
        return powerUp.maxPerDay - usesToday;
    };

    const canUse = (type: PowerUpType) => {
        const quantity = userPowerUps.inventory[type];
        const usesLeft = getUsesLeft(type);
        return quantity > 0 && usesLeft > 0;
    };

    const canBuy = (price: number) => userStars >= price;

    return (
        <div className="powerup-bar">
            <div className="powerup-bar__title">
                <span className="powerup-bar__title-icon">⚡</span>
                <span>Power-ups</span>
            </div>

            <div className="powerup-bar__items">
                {POWERUPS.map(powerUp => {
                    const quantity = userPowerUps.inventory[powerUp.id];
                    const usesLeft = getUsesLeft(powerUp.id);
                    const isActive = activePowerUp === powerUp.id;
                    const canUseNow = canUse(powerUp.id);
                    const canBuyNow = canBuy(powerUp.price);

                    return (
                        <div
                            key={powerUp.id}
                            className={`powerup-item ${isActive ? 'powerup-item--active' : ''} ${!canUseNow ? 'powerup-item--disabled' : ''}`}
                        >
                            <div className="powerup-item__icon">{powerUp.icon}</div>

                            <div className="powerup-item__info">
                                <span className="powerup-item__name">{powerUp.name}</span>
                                <span className="powerup-item__quantity">
                                    {quantity > 0 ? `${quantity}x` : 'Esgotado'}
                                </span>
                            </div>

                            <div className="powerup-item__actions">
                                {quantity > 0 ? (
                                    <button
                                        className="powerup-item__use-btn"
                                        onClick={() => onUsePowerUp(powerUp.id)}
                                        disabled={!canUseNow || isActive}
                                        title={usesLeft === 0 ? 'Limite diário atingido' : powerUp.description}
                                    >
                                        {isActive ? 'Ativo!' : 'Usar'}
                                    </button>
                                ) : (
                                    <button
                                        className="powerup-item__buy-btn"
                                        onClick={() => onBuyPowerUp(powerUp.id)}
                                        disabled={!canBuyNow}
                                        title={`Comprar por ${powerUp.price} estrelas`}
                                    >
                                        <span className="powerup-item__buy-icon">⭐</span>
                                        {powerUp.price}
                                    </button>
                                )}
                            </div>

                            {quantity > 0 && usesLeft < POWERUPS.find(p => p.id === powerUp.id)!.maxPerDay && (
                                <div className="powerup-item__uses-left">
                                    {usesLeft}/{POWERUPS.find(p => p.id === powerUp.id)!.maxPerDay} hoje
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Versão compacta para o jogo
 */
export function PowerUpBarCompact({
    userPowerUps,
    onUsePowerUp,
    activePowerUp,
}: Omit<PowerUpBarProps, 'userStars' | 'onBuyPowerUp'>) {
    const today = new Date().toISOString().split('T')[0];
    const isResetNeeded = userPowerUps.lastResetDate !== today;

    const getUsesLeft = (type: PowerUpType) => {
        const powerUp = POWERUPS.find(p => p.id === type);
        if (!powerUp) return 0;
        const usesToday = isResetNeeded ? 0 : userPowerUps.usesToday[type];
        return powerUp.maxPerDay - usesToday;
    };

    const canUse = (type: PowerUpType) => {
        const quantity = userPowerUps.inventory[type];
        const usesLeft = getUsesLeft(type);
        return quantity > 0 && usesLeft > 0;
    };

    const availablePowerUps = POWERUPS.filter(p => userPowerUps.inventory[p.id] > 0);

    if (availablePowerUps.length === 0) return null;

    return (
        <div className="powerup-bar-compact">
            {availablePowerUps.map(powerUp => {
                const quantity = userPowerUps.inventory[powerUp.id];
                const isActive = activePowerUp === powerUp.id;
                const canUseNow = canUse(powerUp.id);

                return (
                    <button
                        key={powerUp.id}
                        className={`powerup-compact ${isActive ? 'powerup-compact--active' : ''}`}
                        onClick={() => onUsePowerUp(powerUp.id)}
                        disabled={!canUseNow || isActive}
                        title={powerUp.description}
                    >
                        <span className="powerup-compact__icon">{powerUp.icon}</span>
                        <span className="powerup-compact__count">{quantity}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default PowerUpBar;
