// src/components/CaseCard.js (Actualizado)
import React, { useContext } from 'react';
import './CaseCard.scss';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CaseCard = ({ caseData, onOpen }) => {
  const { updateBalance } = useContext(AuthContext);

  const handleOpen = async () => {
    if (onOpen) return onOpen(caseData);

    try {
      const res = await api.post('/cases/open', { caseId: caseData._id });
      alert('Won ' + res.data.wonSkin.name);
      if (res.data.newBalance && updateBalance) updateBalance(res.data.newBalance);
    } catch (err) {
      alert(err.response?.data?.message || 'Error opening case');
    }
  };

  return (
    <div className="case-card">
      <h3 className="case-card__name">{caseData.name}</h3>
      <div className="case-card__button">
        ${caseData.price.toFixed(2)}
      </div>
      <button className="btn" onClick={handleOpen}>Open</button>
    </div>
  );
};

export default CaseCard;