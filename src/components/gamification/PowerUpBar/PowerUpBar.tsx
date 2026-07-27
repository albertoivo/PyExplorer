import { useState } from 'react';
import type { UserPowerUps, PowerUpType } from '../../../types/gamification';
import { POWERUPS } from '../../../data/gamificationData';
import { getLocalDateStr } from '../../../utils/gamificationUtils';
import './PowerUpBar.css';

interface PowerUpBarProps {
    userPowerUps: UserPowerUps;
    userStars: number;
    onUsePowerUp: (type: PowerUpType) => boolean;
    onBuyPowerUp: (type: PowerUpType, price: number) => boolean;
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
    const today = getLocalDateStr();
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
                            className={`powerup-item ${isActive ? 'powerup-item--active' : ''} ${quantity === 0 ? 'powerup-item--empty' : ''}`}
                        >
                            <div className="powerup-item__icon-wrapper">
                                <span className="powerup-item__icon">{powerUp.icon}</span>
                                {quantity > 0 && (
                                    <span className="powerup-item__badge">{quantity}x</span>
                                )}
                            </div>

                            <div className="powerup-item__info">
                                <h4 className="powerup-item__name">{powerUp.name}</h4>
                                <p className="powerup-item__description">{powerUp.description}</p>
                                <span className="powerup-item__limit">
                                    Máx. diário: {usesLeft}/{powerUp.maxPerDay} restantes
                                </span>
                            </div>

                            <div className="powerup-item__actions">
                                {quantity > 0 ? (
                                    <button
                                        className="powerup-btn powerup-btn--use"
                                        onClick={() => onUsePowerUp(powerUp.id)}
                                        disabled={!canUseNow}
                                        title={usesLeft === 0 ? 'Limite diário atingido' : powerUp.description}
                                        aria-label={isActive ? `${powerUp.name} ativado` : `Usar ${powerUp.name}`}
                                    >
                                        {isActive ? 'Ativo' : 'Usar'}
                                    </button>
                                ) : (
                                    <button
                                        className="powerup-btn powerup-btn--buy"
                                        onClick={() => onBuyPowerUp(powerUp.id, powerUp.price)}
                                        disabled={!canBuyNow}
                                        title={`Comprar por ${powerUp.price} estrelas`}
                                        aria-label={`Comprar ${powerUp.name} por ${powerUp.price} estrelas`}
                                    >
                                        ⭐ {powerUp.price}
                                    </button>
                                )}
                            </div>
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
    userStars,
    onBuyPowerUp,
}: Omit<PowerUpBarProps, 'userStars' | 'onBuyPowerUp'> & {
    userStars?: number;
    onBuyPowerUp?: (type: PowerUpType, price: number) => boolean;
}) {
    const [confirmBuy, setConfirmBuy] = useState<PowerUpType | null>(null);
    const today = getLocalDateStr();
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

    const availablePowerUps = POWERUPS.filter(p => {
        if (p.id === 'shield') return false;
        if (onBuyPowerUp) return true;
        return userPowerUps.inventory[p.id] > 0;
    });

    if (availablePowerUps.length === 0) return null;

    const targetPowerUp = confirmBuy ? POWERUPS.find(p => p.id === confirmBuy) : null;

    return (
        <div className="powerup-bar-compact-wrapper">
            {targetPowerUp && (
                <div className="powerup-buy-confirm-overlay">
                    <div className="powerup-buy-confirm-box">
                        <h4>Comprar {targetPowerUp.name}?</h4>
                        <p>Custo: ⭐ {targetPowerUp.price} | Saldo: ⭐ {userStars || 0}</p>
                        <div className="powerup-buy-confirm-actions">
                            <button
                                className="powerup-buy-btn-cancel"
                                onClick={() => setConfirmBuy(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="powerup-buy-btn-confirm"
                                disabled={(userStars || 0) < targetPowerUp.price}
                                onClick={() => {
                                    if (onBuyPowerUp && onBuyPowerUp(targetPowerUp.id, targetPowerUp.price)) {
                                        onUsePowerUp(targetPowerUp.id);
                                    }
                                    setConfirmBuy(null);
                                }}
                            >
                                {(userStars || 0) < targetPowerUp.price ? 'Estrelas Insuficientes' : 'Comprar e Usar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="powerup-bar-compact">
                {availablePowerUps.map(powerUp => {
                    const quantity = userPowerUps.inventory[powerUp.id];
                    const isActive = activePowerUp === powerUp.id;
                    const canUseNow = canUse(powerUp.id);
                    const isZero = quantity === 0;

                    return (
                        <button
                            key={powerUp.id}
                            className={`powerup-compact ${isActive ? 'powerup-compact--active' : ''} ${isZero ? 'powerup-compact--buy' : ''}`}
                            onClick={() => {
                                if (isZero && onBuyPowerUp) {
                                    setConfirmBuy(powerUp.id);
                                } else {
                                    onUsePowerUp(powerUp.id);
                                }
                            }}
                            disabled={(isZero ? !onBuyPowerUp : !canUseNow) || isActive}
                            title={isZero ? `${powerUp.description} (Compre por ${powerUp.price}⭐)` : powerUp.description}
                            aria-label={isZero ? `Comprar ${powerUp.name} por ${powerUp.price} estrelas` : `Usar ${powerUp.name}. ${quantity} disponíveis.`}
                        >
                            <span className="powerup-compact__icon" aria-hidden="true">
                                {powerUp.icon}
                            </span>
                            <span className="powerup-compact__count">
                                {isZero ? `+⭐${powerUp.price}` : quantity}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
