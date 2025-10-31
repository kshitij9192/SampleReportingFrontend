import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import OwnerModal from './components/OwnerModal';

const division = 'RFT'; // <-- hardcoded division you want to filter by
const ownerApiUrl = 'https://yourapi.com/owner'; // Replace with your owner API URL
const graphApiUrls = {
  graph1: 'https://yourapi.com/graph1',
  graph2: 'https://yourapi.com/graph2',
  graph3: 'https://yourapi.com/graph3',
  graph4: 'https://yourapi.com/graph4',
};

function App() {
  const [cios, setCios] = useState([]);
  const [selectedCio, setSelectedCio] = useState('');
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerGraphs, setOwnerGraphs] = useState(null);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch and filter CIOs for your hardcoded division
  useEffect(() => {
    fetchOwners();
  }, []);

  const [ownersData, setOwnersData] = useState([]);

  const fetchOwners = async () => {
    try {
      const response = await fetch(ownerApiUrl);
      const data = await response.json();

      // Filter all owners for your hardcoded division
      setOwnersData(data);

      // Extract CIOs under given division
      const ciosFiltered = [...new Set(data.filter(o => o.Division === division).map(o => o.CIO))];
      setCios(ciosFiltered);
    } catch (e) {
      console.error('Error fetching owner data:', e);
    }
  };

  const handleCioChange = async (cio) => {
    setSelectedCio(cio);
    setOwners([]);
    if (cio) {
      const filteredOwners = ownersData
        .filter(o => o.Division === division && o.CIO === cio)
        .map(o => o.Portfolio_Owner);
      const uniqueOwners = [...new Set(filteredOwners)];
      setOwners(uniqueOwners);
    }
  };

  const fetchGraphsForOwner = async (owner) => {
    setLoading(true);
    try {
      const allResponses = await Promise.all(
        Object.values(graphApiUrls).map(async (url) => {
          const resp = await fetch(`${url}?owner=${owner}`);
          const jsonData = await resp.json();
          return jsonData;
        })
      );

      const periodsSet = new Set();
      allResponses.forEach(graphData => {
        graphData.forEach(point => periodsSet.add(point.Period));
      });
      const periodsArray = Array.from(periodsSet);
      periodsArray.sort((a,b) => new Date(a) - new Date(b));
      setMonths(periodsArray.slice(-6));

      const graphsData = {};
      Object.keys(graphApiUrls).forEach((graphKey, index) => {
        let graphPoints = [];
        const graphData = allResponses[index];

        periodsArray.slice(-6).forEach(p => {
          const point = graphData.find(g => g.Period === p);
          graphPoints.push(point ? point.Value : 0);
        });
        graphsData[graphKey] = graphPoints;
      });

      setOwnerGraphs(graphsData);
      setSelectedOwner(owner);
    } catch (e) {
      console.error('Error fetching graph data:', e);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedOwner(null);
    setOwnerGraphs(null);
    setMonths([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Data Visualization Dashboard</h1>
        <p>Visualizing owners under Division "{division}" and CIOs.</p>
      </header>

      <main className="main-content">
        <div>
          <label htmlFor="cio-select">Select CIO:</label>
          <select
            id="cio-select"
            value={selectedCio}
            onChange={e => handleCioChange(e.target.value)}
          >
            <option value="">-- Select CIO --</option>
            {cios.map(cio => (
              <option key={cio} value={cio}>{cio}</option>
            ))}
          </select>
        </div>

        {owners.length > 0 && (
          <div className="owners-list">
            {owners.map(owner => (
              <button key={owner} onClick={() => fetchGraphsForOwner(owner)}>
                {owner}
              </button>
            ))}
          </div>
        )}

        {selectedOwner && ownerGraphs && !loading && (
          <OwnerModal
            cio={selectedCio}
            owner={selectedOwner}
            months={months}
            ownerData={ownerGraphs}
            onClose={closeModal}
          />
        )}

        {loading && <p>Loading graphs...</p>}
      </main>
    </div>
  );
}

export default App;
