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
  const [apiData, setApiData] = useState(null);

  // Replace these with your actual API URLs
  const API_URLS = {
    graph1: 'https://your-api.com/release-frequency',
    graph2: 'https://your-api.com/lead-time-for-change',
    graph3: 'https://your-api.com/change-failure-rate',
    graph4: 'https://your-api.com/mean-time-to-recover'
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all 4 APIs
      const responses = await Promise.all([
        fetch(API_URLS.graph1).then(r => r.json()),
        fetch(API_URLS.graph2).then(r => r.json()),
        fetch(API_URLS.graph3).then(r => r.json()),
        fetch(API_URLS.graph4).then(r => r.json())
      ]);

      // Transform API data to match frontend structure
      const transformedData = transformApiData(responses);
      
      setApiData(transformedData);
      
      // Extract unique CIOs
      const uniqueCios = [...new Set(responses[0].map(item => item.CIO))];
      setCios(uniqueCios);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const transformApiData = (apiResponses) => {
    const [graph1Data, graph2Data, graph3Data, graph4Data] = apiResponses;
    
    // Build structure: { cio: { owner: { months: [], graph1: [], graph2: [], graph3: [], graph4: [] } } }
    const structured = {};

    // Process each graph's data
    [graph1Data, graph2Data, graph3Data, graph4Data].forEach((graphData, graphIndex) => {
      const graphKey = `graph${graphIndex + 1}`;
      
      graphData.forEach(item => {
        const cio = item.CIO;
        const owner = item.Portfolio_Owner;
        const period = item.Period;
        const value = item.Value;

        // Initialize CIO if not exists
        if (!structured[cio]) {
          structured[cio] = {};
        }

        // Initialize owner if not exists
        if (!structured[cio][owner]) {
          structured[cio][owner] = {
            months: [],
            graph1: [],
            graph2: [],
            graph3: [],
            graph4: []
          };
        }

        // Add month if not exists
        if (!structured[cio][owner].months.includes(period)) {
          structured[cio][owner].months.push(period);
        }

        // Add value to corresponding graph
        structured[cio][owner][graphKey].push(value);
      });
    });

    return structured;
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
      
      // Get owners for selected CIO from transformed data
      const cioOwners = Object.keys(apiData[cioName] || {});
      setOwners(cioOwners);
      
      // Get months from first owner (assuming all owners have same months)
      if (cioOwners.length > 0) {
        const firstOwner = apiData[cioName][cioOwners[0]];
        setMonths(firstOwner.months);
      }
      
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

        {selectedOwner && apiData && (
          <OwnerModal
            cio={selectedCio}
            owner={selectedOwner}
            months={months}
            ownerData={apiData[selectedCio][selectedOwner]}
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
