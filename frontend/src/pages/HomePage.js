import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CaseCard from '../components/CaseCard';
import OpeningModal from '../components/OpeningModal';
import './HomePage.scss';

const HomePage = () => {
    const [cases, setCases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

     useEffect(() => {
        let mounted = true;
        const fetchCases = async () => {
            try {
                const res = await api.get('/cases');
                const data = res.data && (res.data.cases || res.data);
                if (mounted) setCases(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching cases:', err);
            }
        };
        fetchCases();
        return () => { mounted = false; };
    }, []);

    const handleOpenModal = (caseData) => {
        setSelectedCase(caseData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCase(null);
    };

    return (
        <div className="home-page">
            <h1 className="page-title">Cajas Disponibles</h1>
            <div className="cases-grid">
                {cases.map(caseData => (
                    <CaseCard 
                        key={caseData._id} 
                        caseData={caseData} 
                        onOpen={handleOpenModal} 
                        />
                ))}
            </div>
            {selectedCase && (
                <OpeningModal 
                    caseData={selectedCase}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default HomePage;