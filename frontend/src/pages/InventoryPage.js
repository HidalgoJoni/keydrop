import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './InventoryPage.scss';

const InventoryPage = () => {
  const { user, updateBalance } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const [priceByIndex, setPriceByIndex] = useState({});

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) return;
      const res = await api.get('/users/me').catch(()=>null);
      setInventory(res?.data?.user?.inventory || user.inventory || []);
    };
    fetchInventory();
  }, [user]);

  const handleUpgrade = async (index) => {
    try {
      const res = await api.post('/skins/upgrade', { inventoryIndex: index });
      alert(res.data.success ? 'Upgrade success' : 'Upgrade failed');
      if (res.data.newBalance) updateBalance(res.data.newBalance);
      // refresh inventory
      const refreshed = await api.get('/users/me');
      setInventory(refreshed.data.user.inventory || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleSell = async (index) => {
    try {
      const item = inventory[index];
      const price = priceByIndex[index] || Math.max(1, Math.round((item.skinId?.value || 1) * 0.5));
      const res = await api.post('/market/sell', { skinId: item.skinId._id, price });
      alert('Listed for sale');
      const refreshed = await api.get('/users/me');
      setInventory(refreshed.data.user.inventory || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Error listing skin');
    }
  };

  return (
    <div className="inventory-page container">
      <h2>Inventory</h2>
      <div className="inventory-grid">
        {inventory.map((it, i) => (
          <div className="inventory-item" key={i}>
            <div>{it.skinId?.name || 'Unknown'}</div>
            <div>Value: {it.skinId?.value || 'N/A'}</div>
            <div>
              <input type="number" placeholder="price" value={priceByIndex[i] || ''} onChange={e => setPriceByIndex(prev => ({ ...prev, [i]: e.target.value }))} />
              <button className="btn" onClick={() => handleUpgrade(i)}>Upgrade</button>
              <button className="btn" onClick={() => handleSell(i)}>Sell</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;