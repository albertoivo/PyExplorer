import { useState } from 'react';
import type { ShopItem, ShopItemType, UserInventory } from '../../../types/gamification';
import { getShopItemsByType } from '../../../data/gamificationData';
import './AvatarShop.css';

interface AvatarShopProps {
    userStars: number;
    userLevel: number;
    inventory: UserInventory;
    onBuy: (itemId: string, price: number) => boolean;
    onEquip: (itemId: string, type: 'avatar' | 'frame' | 'title') => void;
}

const TAB_LABELS: Record<ShopItemType, { name: string; icon: string }> = {
    avatar: { name: 'Avatares', icon: '🐍' },
    frame: { name: 'Molduras', icon: '🖼️' },
    badge: { name: 'Emblemas', icon: '🏅' },
    title: { name: 'Títulos', icon: '📛' },
};

/**
 * Loja de avatares, molduras e itens cosméticos
 */
export function AvatarShop({ userStars, userLevel, inventory, onBuy, onEquip }: AvatarShopProps) {
    const [selectedTab, setSelectedTab] = useState<ShopItemType>('avatar');
    const [buyingItem, setBuyingItem] = useState<string | null>(null);

    const items = getShopItemsByType(selectedTab);
    const tabs = Object.keys(TAB_LABELS) as ShopItemType[];

    const isOwned = (itemId: string) => inventory.ownedItems.includes(itemId);
    const isEquipped = (item: ShopItem) => {
        switch (item.type) {
            case 'avatar': return inventory.equippedAvatar === item.id;
            case 'frame': return inventory.equippedFrame === item.id;
            case 'title': return inventory.equippedTitle === item.id;
            default: return false;
        }
    };
    const canAfford = (price: number) => userStars >= price;
    const meetsLevel = (requiredLevel?: number) => !requiredLevel || userLevel >= requiredLevel;

    const handleBuy = (item: ShopItem) => {
        if (isOwned(item.id)) return;
        if (!canAfford(item.price)) return;
        if (!meetsLevel(item.requiredLevel)) return;

        setBuyingItem(item.id);

        const success = onBuy(item.id, item.price);

        setTimeout(() => {
            setBuyingItem(null);
            if (success) {
                // Equipar automaticamente se for o primeiro do tipo
                if (item.type === 'avatar' || item.type === 'frame' || item.type === 'title') {
                    onEquip(item.id, item.type);
                }
            }
        }, 500);
    };

    const handleEquip = (item: ShopItem) => {
        if (!isOwned(item.id)) return;
        if (isEquipped(item)) return;
        if (item.type === 'avatar' || item.type === 'frame' || item.type === 'title') {
            onEquip(item.id, item.type);
        }
    };

    return (
        <div className="avatar-shop">
            <div className="avatar-shop__header">
                <h2 className="avatar-shop__title">🛒 Loja</h2>
                <div className="avatar-shop__balance">
                    <span className="avatar-shop__balance-icon">⭐</span>
                    <span className="avatar-shop__balance-value">{userStars}</span>
                </div>
            </div>

            <div className="avatar-shop__tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`avatar-shop__tab ${selectedTab === tab ? 'avatar-shop__tab--active' : ''}`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        <span className="avatar-shop__tab-icon">{TAB_LABELS[tab].icon}</span>
                        <span className="avatar-shop__tab-name">{TAB_LABELS[tab].name}</span>
                    </button>
                ))}
            </div>

            <div className="avatar-shop__grid">
                {items.map(item => {
                    const owned = isOwned(item.id);
                    const equipped = isEquipped(item);
                    const affordable = canAfford(item.price);
                    const hasLevel = meetsLevel(item.requiredLevel);
                    const isBuying = buyingItem === item.id;

                    return (
                        <div
                            key={item.id}
                            className={`shop-item ${owned ? 'shop-item--owned' : ''} ${equipped ? 'shop-item--equipped' : ''} ${!affordable && !owned ? 'shop-item--expensive' : ''}`}
                            style={{ '--item-color': item.color || '#667eea' } as React.CSSProperties}
                        >
                            {item.limited && (
                                <div className="shop-item__limited">⏰ Limitado</div>
                            )}

                            <div className="shop-item__preview">
                                <span className="shop-item__icon" style={item.color ? { filter: `drop-shadow(0 0 10px ${item.color})` } : {}}>
                                    {item.icon}
                                </span>
                                {equipped && <div className="shop-item__equipped-badge">✓ Equipado</div>}
                            </div>

                            <div className="shop-item__info">
                                <h4 className="shop-item__name">{item.name}</h4>
                                <p className="shop-item__description">{item.description}</p>
                            </div>

                            {!owned ? (
                                <div className="shop-item__purchase">
                                    {item.requiredLevel && !hasLevel && (
                                        <div className="shop-item__level-req">
                                            🔒 Nível {item.requiredLevel}
                                        </div>
                                    )}

                                    <div className="shop-item__price">
                                        <span className="shop-item__price-icon">⭐</span>
                                        <span className={`shop-item__price-value ${!affordable ? 'shop-item__price-value--expensive' : ''}`}>
                                            {item.price === 0 ? 'Grátis' : item.price}
                                        </span>
                                    </div>

                                    <button
                                        className={`shop-item__buy-btn ${isBuying ? 'shop-item__buy-btn--buying' : ''}`}
                                        onClick={() => handleBuy(item)}
                                        disabled={!affordable || !hasLevel || isBuying}
                                    >
                                        {isBuying ? '...' : (item.price === 0 ? 'Obter' : 'Comprar')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className={`shop-item__equip-btn ${equipped ? 'shop-item__equip-btn--equipped' : ''}`}
                                    onClick={() => handleEquip(item)}
                                    disabled={equipped}
                                >
                                    {equipped ? '✓ Equipado' : 'Equipar'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {items.length === 0 && (
                <div className="avatar-shop__empty">
                    <span className="avatar-shop__empty-icon">🏪</span>
                    <p>Nenhum item disponível nesta categoria</p>
                </div>
            )}
        </div>
    );
}

export default AvatarShop;
