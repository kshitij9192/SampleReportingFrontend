import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import OwnerModal from './components/OwnerModal';

const ownerApiUrl = 'https://yourapi.com/owner'; // Replace with your owner API URL
const graphApiUrls = {
  graph1: 'https://yourapi.com/graph1',
  graph2: 'https://yourapi.com/graph2',
  graph3: 'https://yourapi.com/graph3',
  graph4: 'https://yourapi.com/graph4',
};

function App() {
  const [infoVisible, setInfoVisible] = useState(true);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [cios, setCios] = useState([]);
  const [selectedCio, setSelectedCio] = useState('');
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerGraphs, setOwnerGraphs] = useState(null);
  const [loadingGraphs, setLoadingGraphs] = useState(false);
  const [months, setMonths] = useState([]);

  // Fetch all owner API data, process divisions and CIOs
  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch(ownerApiUrl);
      const data = await response.json();

      // Extract unique divisions
      const uniqueDivisions = [...new Set(data.map(item => item.Division))];
      setDivisions(uniqueDivisions);

      // Save full owner data for filtering later
      setOwnersData(data);
    } catch (e) {
      console.error('Error fetching owner data:', e);
    }
  };

  const [ownersData, setOwnersData] = useState([]);

  const handleDivisionChange = (division) => {
    setSelectedDivision(division);
    setSelectedCio('');
    setOwners([]);

    // Filter CIOs for selected division
    if (division) {
      const ciosInDivision = [...new Set(
        ownersData.filter(o => o.Division === division).map(o => o.CIO)
      )];
      setCios(ciosInDivision);
    } else {
      setCios([]);
    }
  };

  const handleCioChange = (cio) => {
    setSelectedCio(cio);
    setOwners([]);

    if (cio) {
      // Filter owners for selected Division and CIO
      const ownersList = ownersData
        .filter(o => o.Division === selectedDivision && o.CIO === cio)
        .map(o => o.Portfolio_Owner);
      const uniqueOwners = [...new Set(ownersList)];
      setOwners(uniqueOwners);
    }
  };

  // Fetch all four graph data for owner
  const fetchGraphsForOwner = async (owner) => {
    setLoadingGraphs(true);

    try {
      const allResponses = await Promise.all(Object.values(graphApiUrls).map(async (url) => {
        const response = await fetch(`${url}?owner=${owner}`);
        const data = await response.json();
        return data;
      }));

      // allResponses is array of graph data arrays for this owner
      // Process weeks/months dynamically from data
      const periodsSet = new Set();

      allResponses.forEach(graphData => {
        graphData.forEach(point => periodsSet.add(point.Period));
      });

      const periodsArray = Array.from(periodsSet);
      periodsArray.sort((a,b) => new Date(a) - new Date(b)); // Sort ascending by date string

      setMonths(periodsArray.slice(-6)); // last 6 months

      // Now prepare graph values per API in order
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
      setLoadingGraphs(false);
    }
  };

  const closeModal = () => {
    setSelectedOwner(null);
    setOwnerGraphs(null);
    setMonths([]);
  };

  return (
    <div className="App">
      {infoVisible && (
        <section className="info-section">
          <h1>Data Visualization Dashboard</h1>
          <p>We visualize owner performances under Divisions and CIOs with interactive graphs.</p>
          <button onClick={() => setInfoVisible(false)}>Start</button>
        </section>
      )}

      {!infoVisible && (
        <section className="selection-section">
          <div className="selector">
            <label>Division:</label>
            <select value={selectedDivision} onChange={e => handleDivisionChange(e.target.value)}>
              <option value="">Select Division</option>
              {divisions.map(div => <option key={div} value={div}>{div}</option>)}
            </select>
          </div>

          {cios.length > 0 && (
            <div className="selector">
              <label>CIO:</label>
              <select value={selectedCio} onChange={e => handleCioChange(e.target.value)}>
                <option value="">Select CIO</option>
                {cios.map(cio => <option key={cio} value={cio}>{cio}</option>)}
              </select>
            </div>
          )}

          {owners.length > 0 && (
            <div className="owners-list">
              {owners.map(owner => (
                <button 
                  key={owner} 
                  className="owner-button" 
                  onClick={() => fetchGraphsForOwner(owner)}
                >
                  {owner}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedOwner && ownerGraphs && !loadingGraphs && (
        <OwnerModal 
          cio={selectedCio} 
          owner={selectedOwner} 
          months={months} 
          ownerData={ownerGraphs} 
          onClose={closeModal} 
        />
      )}

      {loadingGraphs && <div className="loading">Loading graphs...</div>}
    </div>
  );
}

export default App;
