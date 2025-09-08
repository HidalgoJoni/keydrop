import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MarketplacePage.scss';

const MarketplacePage = () => {
  const { user, updateBalance } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [myListings, setMyListings] = useState([]);

  useEffect(() => { fetchItems(); if (user) fetchMyListings(); }, [user]);

  const fetchItems = async () => { const res = await api.get('/market'); setItems(res.data.items || []); };
  const fetchMyListings = async () => { const res = await api.get('/market/my'); setMyListings(res.data.items || []); };

  const handleBuy = async (listingId) => {
    await api.post('/market/buy', { listingId });
    fetchItems(); if (user) { const refreshed = await api.get('/users/me'); updateBalance(refreshed.data.user.balance); fetchMyListings(); }
  };

  const handleCancel = async (listingId) => {
    await api.post('/market/cancel', { listingId });
    fetchItems(); fetchMyListings();
  };

  return (
    <div className="marketplace container">
      <h2>Marketplace</h2>
      <div className="market-active">
        <h3>Active Listings</h3>
        {items.map(it => (
          <div key={it._id} className="market-item">
            <div>{it.skinId?.name} - {it.price}</div>
            <div>Seller: {it.sellerId?.username}</div>
            <div><button className="btn" onClick={() => handleBuy(it._id)}>Buy</button></div>
          </div>
        ))}
      </div>
      {user && (
        <div className="my-listings">
          <h3>My Listings</h3>
          {myListings.map(it => (
            <div key={it._id} className="market-item">
              <div>{it.skinId?.name} - {it.price}</div>
              <div>Status: {it.status}</div>
              <div><button className="btn" onClick={() => handleCancel(it._id)}>Cancel</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
