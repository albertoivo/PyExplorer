import { useState } from 'react';
import type { UserPowerUps, PowerUpType } from '../../../types/gamification';
import { POWERUPS } from '../../../data/gamificationData';
import { getLocalDateStr } from '../../../utils/gamificationUtils';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('gamification');
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
                                <h4 className="powerup-item__name">{t(`powerups.${powerUp.id}.name`, powerUp.name)}</h4>
                                <p className="powerup-item__description">{t(`powerups.${powerUp.id}.description`, powerUp.description)}</p>
                                <span className="powerup-item__limit">
                                    {t('powerUpBar.dailyLimit', { defaultValue: 'Máx. diário: {{left}}/{{max}} restantes',  left: usesLeft, max: powerUp.maxPerDay })}
                                </span>
                            </div>

                            <div className="powerup-item__actions">
                                {quantity > 0 ? (
                                    <button
                                        className="powerup-btn powerup-btn--use"
                                        onClick={() => onUsePowerUp(powerUp.id)}
                                        disabled={!canUseNow}
                                        title={usesLeft === 0 ? t('powerUpBar.limitReached', 'Limite diário atingido') : t(`powerups.${powerUp.id}.description`, powerUp.description)}
                                        aria-label={isActive ? t('powerUpBar.ariaActive', { defaultValue: '{{name}} ativado',  name: t(`powerups.${powerUp.id}.name`, powerUp.name) }) : t('powerUpBar.ariaUse', { defaultValue: 'Usar {{name}}',  name: t(`powerups.${powerUp.id}.name`, powerUp.name) })}
                                    >
                                        {isActive ? t('powerUpBar.btnActive', 'Ativo') : t('powerUpBar.btnUse', 'Usar')}
                                    </button>
                                ) : (
                                    <button
                                        className="powerup-btn powerup-btn--buy"
                                        onClick={() => onBuyPowerUp(powerUp.id, powerUp.price)}
                                        disabled={!canBuyNow}
                                        title={t('powerUpBar.buyFor', { defaultValue: 'Comprar por {{price}} estrelas',  price: powerUp.price })}
                                        aria-label={t('powerUpBar.ariaBuy', { defaultValue: 'Comprar {{name}} por {{price}} estrelas',  name: t(`powerups.${powerUp.id}.name`, powerUp.name), price: powerUp.price })}
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
    const { t } = useTranslation('gamification');
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
                        <h4>{t('powerUpBar.confirmBuyTitle', { defaultValue: 'Comprar {{name}}?',  name: t(`powerups.${targetPowerUp.id}.name`, targetPowerUp.name) })}</h4>
                        <p>{t('powerUpBar.cost', { defaultValue: 'Custo: ⭐ {{price}} | Saldo: ⭐ {{balance}}',  price: targetPowerUp.price, balance: userStars || 0 })}</p>
                        <div className="powerup-buy-confirm-actions">
                            <button
                                className="powerup-buy-btn-cancel"
                                onClick={() => setConfirmBuy(null)}
                            >
                                {t('powerUpBar.cancel', 'Cancelar')}
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
                                {(userStars || 0) < targetPowerUp.price ? t('powerUpBar.insufficientStars', 'Estrelas Insuficientes') : t('powerUpBar.buyAndUse', 'Comprar e Usar')}
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
                            title={isZero ? t('powerUpBar.compactBuyTitle', { defaultValue: '{{desc}} (Compre por {{price}}⭐)',  desc: t(`powerups.${powerUp.id}.description`, powerUp.description), price: powerUp.price }) : t(`powerups.${powerUp.id}.description`, powerUp.description)}
                            aria-label={isZero ? t('powerUpBar.ariaBuy', { defaultValue: 'Comprar {{name}} por {{price}} estrelas',  name: t(`powerups.${powerUp.id}.name`, powerUp.name), price: powerUp.price }) : t('powerUpBar.ariaUseAvailable', { defaultValue: 'Usar {{name}}. {{quantity}} disponíveis.',  name: t(`powerups.${powerUp.id}.name`, powerUp.name), quantity })}
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
