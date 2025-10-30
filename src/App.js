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
      setError(null);
      
      // Fetch data from all 4 APIs
      const responses = await Promise.all([
        fetch(API_URLS.graph1).then(r => {
          if (!r.ok) throw new Error(`Graph1 API failed: ${r.statusText}`);
          return r.json();
        }),
        fetch(API_URLS.graph2).then(r => {
          if (!r.ok) throw new Error(`Graph2 API failed: ${r.statusText}`);
          return r.json();
        }),
        fetch(API_URLS.graph3).then(r => {
          if (!r.ok) throw new Error(`Graph3 API failed: ${r.statusText}`);
          return r.json();
        }),
        fetch(API_URLS.graph4).then(r => {
          if (!r.ok) throw new Error(`Graph4 API failed: ${r.statusText}`);
          return r.json();
        })
      ]);

      console.log('API Responses:', responses);

      // Transform API data to match frontend structure
      const transformedData = transformApiData(responses);
      
      console.log('Transformed Data:', transformedData);
      
      setApiData(transformedData);
      
      // Extract unique CIOs from first graph data (should have all CIOs)
      const uniqueCios = [...new Set(responses[0].map(item => item.CIO))];
      console.log('Unique CIOs:', uniqueCios);
      
      setCios(uniqueCios);
      
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const transformApiData = (apiResponses) => {
    try {
      const [graph1Data, graph2Data, graph3Data, graph4Data] = apiResponses;
      
      // Validate that data is arrays
      if (!Array.isArray(graph1Data) || !Array.isArray(graph2Data) || 
          !Array.isArray(graph3Data) || !Array.isArray(graph4Data)) {
        throw new Error('API response is not an array');
      }

      // Build structure: { cio: { owner: { months: [], graph1: [], graph2: [], graph3: [], graph4: [] } } }
      const structured = {};

      // Create a map to track periods for each owner
      const ownerPeriodMap = {};

      // Process each graph's data
      [graph1Data, graph2Data, graph3Data, graph4Data].forEach((graphData, graphIndex) => {
        const graphKey = `graph${graphIndex + 1}`;
        
        graphData.forEach(item => {
          const cio = item.CIO?.toLowerCase() || 'unknown';
          const owner = item.Portfolio_Owner?.toLowerCase() || 'unknown';
          const period = item.Period || 'Unknown';
          const value = parseFloat(item.Value) || 0;

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

          // Track unique periods for this owner
          const ownerKey = `${cio}|${owner}`;
          if (!ownerPeriodMap[ownerKey]) {
            ownerPeriodMap[ownerKey] = new Set();
          }
          ownerPeriodMap[ownerKey].add(period);

          // Add value to corresponding graph
          structured[cio][owner][graphKey].push(value);
        });
      });

      // Set months for each owner based on their periods
      Object.keys(structured).forEach(cio => {
        Object.keys(structured[cio]).forEach(owner => {
          const ownerKey = `${cio}|${owner}`;
          if (ownerPeriodMap[ownerKey]) {
            structured[cio][owner].months = Array.from(ownerPeriodMap[ownerKey]).sort();
          }
        });
      });

      return structured;
    } catch (err) {
      console.error('Data transformation error:', err);
      throw err;
    }
  };

  const handleCioChange = async (cioName) => {
    if (!cioName || !apiData) {
      setSelectedCio('');
      setOwners([]);
      setMonths([]);
      return;
    }

    try {
      setLoading(true);
      setSelectedCio(cioName);
      
      // Get owners for selected CIO from transformed data
      const cioData = apiData[cioName.toLowerCase()];
      if (!cioData) {
        setOwners([]);
        setMonths([]);
        return;
      }

      const cioOwners = Object.keys(cioData);
      setOwners(cioOwners);
      
      // Get months from first owner (assuming all owners have same months)
      if (cioOwners.length > 0) {
        const firstOwner = cioData[cioOwners[0]];
        setMonths(firstOwner.months || []);
      }
      
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
          cios={cios || []}
          selectedCio={selectedCio}
          owners={owners || []}
          loading={loading}
          onCioChange={handleCioChange}
          onOwnerClick={handleOwnerClick}
        />

        {selectedOwner && apiData && (
          <OwnerModal
            cio={selectedCio}
            owner={selectedOwner}
            months={months}
            ownerData={apiData[selectedCio.toLowerCase()] && apiData[selectedCio.toLowerCase()][selectedOwner]}
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
