import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import SkinCard from '../components/SkinCard'; // Tendrás que crear este componente
import './InventoryPage.scss';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, updateBalance } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            api.get('/users/inventory')
                .then(response => {
                    setInventory(response.data);
                })
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleSellSkin = async (inventoryItemId) => {
        try {
            const { data } = await api.post('/users/inventory/sell', { inventoryItemId });
            // Actualizar el saldo en el contexto global
            updateBalance(data.newBalance);
            // Filtrar el inventario para quitar la skin vendida
            setInventory(prev => prev.filter(item => item._id !== inventoryItemId));
        } catch (error) {
            console.error("Error al vender la skin", error);
        }
    };
    
    if (loading) return <p>Cargando inventario...</p>;

    return (
        <div className="inventory-page">
            <h1 className="page-title">Mi Inventario ({inventory.length} items)</h1>
            <div className="skins-grid">
                {inventory.length > 0 ? (
                    inventory.map(item => (
                        // Pasa la función para venderla al componente SkinCard
                        <SkinCard key={item._id} item={item} onSell={handleSellSkin} />
                    ))
                ) : (
                    <p>No tienes skins en tu inventario.</p>
                )}
            </div>
        </div>
    );
};

export default InventoryPage;