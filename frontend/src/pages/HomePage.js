import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CaseCard from '../components/CaseCard';
import './HomePage.scss';

const HomePage = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const { data } = await api.get('/cases');
                setCases(data);
            } catch (err) {
                setError('No se pudieron cargar las cajas.');
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    if (loading) return <p>Cargando cajas...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="home-page">
            <h1 className="page-title">Cajas Disponibles</h1>
            <div className="cases-grid">
                {cases.map(caseData => (
                    <CaseCard key={caseData._id} caseData={caseData} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;