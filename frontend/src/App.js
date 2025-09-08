import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BattlesPage from './pages/BattlesPage';
import InventoryPage from './pages/InventoryPage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import './App.scss';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Header onOpenLogin={() => setShowAuth(true)} />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onSuccess={() => setShowAuth(false)} />} />
            <Route path="/battles" element={<BattlesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/market" element={<MarketplacePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;