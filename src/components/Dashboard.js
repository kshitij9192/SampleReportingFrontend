import React from 'react';
import './Dashboard.css';

const Dashboard = ({ cios, selectedCio, owners, loading, onCioChange, onOwnerClick }) => {
    return (
        <div className="dashboard-container">
            <div className="cio-selector-section">
                <div className="selector-card">
                    <label htmlFor="cio-select" className="selector-label">
                        <span className="label-icon">👤</span>
                        Select Chief Information Officer
                    </label>
                    <select
                        id="cio-select"
                        className="cio-select"
                        value={selectedCio}
                        onChange={(e) => onCioChange(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">-- Choose a CIO --</option>
                        {cios.map((cio) => (
                            <option key={cio} value={cio}>
                                {cio.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading data...</p>
                </div>
            )}

            {selectedCio && !loading && owners.length > 0 && (
                <div className="owners-section">
                    <h2 className="section-title">
                        <span className="title-icon">📈</span>
                        Data Owners under {selectedCio.toUpperCase()}
                    </h2>
                    <div className="owners-grid">
                        {owners.map((owner) => (
                            <div
                                key={owner}
                                className="owner-card"
                                onClick={() => onOwnerClick(owner)}
                            >
                                <div className="owner-avatar">
                                    {owner.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="owner-name">{owner}</h3>
                                <p className="owner-subtitle">View Analytics</p>
                                <div className="owner-stats">
                                    <span className="stat-badge">4 Metrics</span>
                                    <span className="stat-badge">8 Months</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedCio && !loading && owners.length === 0 && (
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>No owners found for this CIO</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
