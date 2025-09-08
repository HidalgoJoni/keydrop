// src/components/OpeningModal.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import './OpeningModal.scss';

const OpeningModal = ({ caseData, isOpen, onClose, battleId, isBattle }) => {
    const [items, setItems] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [wonSkin, setWonSkin] = useState(null);
    const { updateBalance, user, token } = useContext(AuthContext);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setIsSpinning(false);
                setWonSkin(null);
                setItems([]);
            }, 300);
            return;
        }

        if (isBattle && battleId) {
            const cleanup = startBattleListen(battleId);
            return cleanup;
        } else if (!isBattle) {
            startOpening();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, caseData, battleId, isBattle]);

    const startBattleListen = (battleId) => {
        setIsSpinning(true);
        setWonSkin(null);
        const socket = connectSocket(token);

        const onBattleStarted = (payload) => {
            const strip = [];
            for (let i = 0; i < 40; i++) strip.push({ imageUrl: '', name: '...' });
            setItems(strip);
            setIsSpinning(true);
        };

        const onBattleSpin = (payload) => {
            const { items: frameItems } = payload;
            setItems(frameItems);
            setIsSpinning(true);
        };

        const onBattleResult = (payload) => {
            const { results, winner, winnerSkin } = payload;
            setIsSpinning(false);
            setWonSkin(winnerSkin || null);
            // refresh user if needed
            if (user && String(winner.userId) === String(user.id)) {
                api.get('/users/me').then(res => updateBalance(res.data.user.balance)).catch(()=>{});
            }
        };

        socket.on('battle-started', onBattleStarted);
        socket.on('battle-spin', onBattleSpin);
        socket.on('battle-result', onBattleResult);

        return () => {
            socket.off('battle-started', onBattleStarted);
            socket.off('battle-spin', onBattleSpin);
            socket.off('battle-result', onBattleResult);
        };
    };

    const startOpening = async () => {
        setIsSpinning(true);
        setWonSkin(null);

        try {
            if (!caseData || !caseData._id) {
                throw new Error('No case data');
            }
            const response = await api.post('/cases/open', { caseId: caseData._id });
            const finalSkin = response.data.wonSkin;
            updateBalance && updateBalance(response.data.newBalance);

            const casePossibleSkins = (caseData.possibleSkins || []).map(s => (s && (s.skin || s)));
            let spinnerItems = [];
            if (casePossibleSkins.length === 0) {
                for (let i = 0; i < 50; i++) spinnerItems.push(finalSkin);
            } else {
                for (let i = 0; i < 50; i++) {
                    spinnerItems.push(casePossibleSkins[Math.floor(Math.random() * casePossibleSkins.length)]);
                }
            }
            if (spinnerItems.length >= 49) spinnerItems[48] = finalSkin;
            setItems(spinnerItems);

            setTimeout(() => {
                setIsSpinning(false);
                setWonSkin(finalSkin);
            }, 4500);

        } catch (error) {
            console.error('Error opening case', error);
            alert(error.response?.data?.message || error.message || 'No se pudo abrir la caja.');
            onClose && onClose();
        }
    };

    if (!isOpen) return null;

    const rarityClass = wonSkin && wonSkin.rarity ? String(wonSkin.rarity).toLowerCase().replace(/ /g, '-').replace('/', '') : '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {!wonSkin && (
                    <div className="spinner-container">
                        <div className="spinner-ticker"></div>
                        <div className="spinner-track" style={{ transform: isSpinning ? 'translateX(-3500px)' : 'translateX(0)' }}>
                            {items.map((item, index) => (
                                <div key={index} className="spinner-item">
                                    <img src={item?.imageUrl || (item?.skinId?.imageUrl) || ''} alt={item?.name || item?.skinId?.name || 'item'} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {wonSkin && (
                    <div className={`result-container rarity--${rarityClass}`}>
                        <div className="result-rarity-bar"></div>
                        <h2 className="result-title">¡Has conseguido!</h2>
                        <img src={wonSkin.imageUrl} alt={wonSkin.name} className="result-image" />
                        <p className="result-name">{wonSkin.name}</p>
                        <p className="result-weapon">{wonSkin.weaponType}</p>
                        <button onClick={onClose} className="result-close-btn">Cerrar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpeningModal;