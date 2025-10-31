import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import OwnerModal from './components/OwnerModal';

const division = 'RFT'; // Hardcoded division to filter
const ownerApiUrl = 'https://yourapi.com/owner'; // Your actual owner API URL
const graphApiUrls = {
  graph1: 'https://yourapi.com/graph1',
  graph2: 'https://yourapi.com/graph2',
  graph3: 'https://yourapi.com/graph3',
  graph4: 'https://yourapi.com/graph4',
};

function App() {
  const [CIO, setCIO] = useState([]);
  const [selectedCIO, setSelectedCIO] = useState('');
  const [portfolioOwners, setPortfolioOwners] = useState([]);
  const [selectedPortfolioOwner, setSelectedPortfolioOwner] = useState(null);
  const [ownerGraphs, setOwnerGraphs] = useState(null);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownersData, setOwnersData] = useState([]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch(ownerApiUrl);
      const data = await response.json();
      console.log('Raw owner data from API:', data);

      const ownerList = Array.isArray(data) ? data : (data.results || data.items || data.data || []);

      if (!Array.isArray(ownerList)) {
        throw new Error('Owner data is not an array.');
      }

      setOwnersData(ownerList);
      const filteredData = ownerList.filter(o =>
        o.Division && o.Division.toLowerCase() === division.toLowerCase()
      );
      const ciosFiltered = [...new Set(filteredData.map(o => o.CIO))];
      setCIO(ciosFiltered);
    } catch (e) {
      console.error('Error fetching owner data:', e);
    }
  };

  const handleCIOChange = (cio) => {
    setSelectedCIO(cio);
    setPortfolioOwners([]);
    if (cio) {
      const filteredOwners = ownersData
        .filter(o => o.Division.toLowerCase() === division.toLowerCase() && o.CIO === cio)
        .map(o => o.Portfolio_Owner);
      const uniqueOwners = [...new Set(filteredOwners)];
      setPortfolioOwners(uniqueOwners);
    }
  };

  const fetchGraphsForOwner = async (portfolioOwner) => {
    setLoading(true);
    try {
      const allResponses = await Promise.all(
        Object.values(graphApiUrls).map(async (url) => {
          const response = await fetch(`${url}?owner=${portfolioOwner}`);
          return response.json();
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
        const graphData = allResponses[index];
        const graphPoints = periodsArray.slice(-6).map(p => {
          const point = graphData.find(g => g.Period === p);
          return point ? point.Value : 0;
        });
        graphsData[graphKey] = graphPoints;
      });

      setOwnerGraphs(graphsData);
      setSelectedPortfolioOwner(portfolioOwner);
    } catch (e) {
      console.error('Error fetching graph data:', e);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedPortfolioOwner(null);
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
        <div className="selector">
          <label htmlFor="cio-select">Select CIO:</label>
          <select id="cio-select" value={selectedCIO} onChange={e => handleCIOChange(e.target.value)}>
            <option value="">-- Select CIO --</option>
            {CIO.map(cio => <option key={cio} value={cio}>{cio}</option>)}
          </select>
        </div>

        {portfolioOwners.length > 0 && (
          <div className="owners-list">
            {portfolioOwners.map(po => (
              <button key={po} onClick={() => fetchGraphsForOwner(po)}>
                {po}
              </button>
            ))}
          </div>
        )}

        {selectedPortfolioOwner && ownerGraphs && !loading && (
          <OwnerModal
            cio={selectedCIO}
            owner={selectedPortfolioOwner}
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
