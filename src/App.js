import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import OwnerModal from './components/OwnerModal';

function App() {
  const [cios, setCios] = useState([]);
  const [selectedCio, setSelectedCio] = useState('');
  const [owners, setOwners] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch all CIOs on component mount
  useEffect(() => {
    fetchCios();
  }, []);

  const fetchCios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cios`);
      const data = await response.json();
      setCios(data.cios);
      setError(null);
    } catch (err) {
      setError('Failed to fetch CIOs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCioChange = async (cioName) => {
    if (!cioName) {
      setSelectedCio('');
      setOwners([]);
      return;
    }

    try {
      setLoading(true);
      setSelectedCio(cioName);
      const response = await fetch(`${API_BASE_URL}/cio/${cioName}`);
      const data = await response.json();
      setOwners(data.owners);
      setMonths(data.months);
      setError(null);
    } catch (err) {
      setError('Failed to fetch owners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerClick = (ownerName) => {
    setSelectedOwner(ownerName);
  };

  const closeModal = () => {
    setSelectedOwner(null);
  };

  const navigateOwner = (direction) => {
    const currentIndex = owners.indexOf(selectedOwner);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % owners.length;
    } else {
      newIndex = (currentIndex - 1 + owners.length) % owners.length;
    }

    setSelectedOwner(owners[newIndex]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="icon">📊</span>
            CIO Data Analytics Dashboard
          </h1>
          <p className="app-subtitle">Visualize owner performance metrics across multiple dimensions</p>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <Dashboard
          cios={cios}
          selectedCio={selectedCio}
          owners={owners}
          loading={loading}
          onCioChange={handleCioChange}
          onOwnerClick={handleOwnerClick}
        />

        {selectedOwner && (
          <OwnerModal
            cio={selectedCio}
            owner={selectedOwner}
            months={months}
            onClose={closeModal}
            onNavigate={navigateOwner}
            currentIndex={owners.indexOf(selectedOwner)}
            totalOwners={owners.length}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Data Analytics Platform | Professional Dashboard Solution</p>
      </footer>
    </div>
  );
}

export default App;
