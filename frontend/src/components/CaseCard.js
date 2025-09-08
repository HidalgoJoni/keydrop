import React from 'react';
import './CaseCard.scss';

const CaseCard = ({ caseData }) => {
    
    const handleOpenCase = () => {
        console.log("Abriendo caja:", caseData._id);
        // Aquí iría la lógica para abrir la caja,
        // probablemente llamando a una función del contexto
        // que muestre un modal con la animación de la ruleta.
    };

    return (
        <div className="case-card">
            <div className="case-card__image-container">
                <img src={caseData.imageUrl} alt={caseData.name} className="case-card__image" />
            </div>
            <div className="case-card__info">
                <h3 className="case-card__name">{caseData.name}</h3>
                <button onClick={handleOpenCase} className="case-card__button">
                    ${caseData.price.toFixed(2)}
                </button>
            </div>
        </div>
    );
};

export default CaseCard;