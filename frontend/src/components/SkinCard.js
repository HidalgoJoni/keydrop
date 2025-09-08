import React from 'react';
import './SkinCard.scss';

const SkinCard = ({ item, onSell }) => {
    // El 'item' que viene del inventario es { _id, skin: { ... } }
    const { skin } = item;
    
    // Convertimos la rareza a un formato usable como clase CSS
    const rarityClass = skin.rarity.toLowerCase().replace(/ /g, '-').replace('/', '');

    return (
        <div className={`skin-card rarity--${rarityClass}`}>
            <div className="skin-card__rarity-bar"></div>
            <div className="skin-card__image-container">
                <img src={skin.imageUrl} alt={skin.name} className="skin-card__image" />
            </div>
            <div className="skin-card__info">
                <p className="skin-card__name">{skin.name}</p>
                <p className="skin-card__weapon">{skin.weaponType}</p>
            </div>
            <button onClick={() => onSell(item._id)} className="skin-card__sell-button">
                Vender por ${skin.value.toFixed(2)}
            </button>
        </div>
    );
};

export default SkinCard;