const [CIO, setCIO] = useState([]);
const [selectedCIO, setSelectedCIO] = useState('');
const [portfolioOwners, setPortfolioOwners] = useState([]);
const [selectedPortfolioOwner, setSelectedPortfolioOwner] = useState(null);

// In fetchOwners, setCIO for unique CIO values:
const ciosFiltered = [...new Set(filteredData.map(o => o.CIO))];
setCIO(ciosFiltered);  // variable named CIO, holding array of CIOs

// In JSX:
<select value={selectedCIO} onChange={e => handleCIOChange(e.target.value)}>
  <option value="">-- Select CIO --</option>
  {CIO.map(cio => (
    <option key={cio} value={cio}>{cio}</option>
  ))}
</select>

// Handle CIO change:
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
