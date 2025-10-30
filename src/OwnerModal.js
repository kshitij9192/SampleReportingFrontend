import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './OwnerModal.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OwnerModal = ({ cio, owner, months, onClose, onNavigate, currentIndex, totalOwners }) => {
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerData();
  }, [cio, owner]);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/cio/${cio}/owner/${owner}`);
      const data = await response.json();
      setOwnerData(data);
    } catch (err) {
      console.error('Failed to fetch owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChartData = (dataPoints, label, color) => ({
    labels: months,
    datasets: [
      {
        label: label,
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}33`,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  });

  const createBarChartData = (dataPoints, label, color) => ({
    labels: months,
    datasets: [
      {
        label: label,
        data: dataPoints,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: `${color}CC`
      }
    ]
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 11, weight: 'bold' },
          padding: 10,
          color: '#333'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#666' }
      },
      y: {
        grid: { color: '#e0e0e0', lineWidth: 1 },
        ticks: { font: { size: 10 }, color: '#666' }
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="header-info">
            <h2 className="modal-title">
              <span className="owner-badge">{owner.toUpperCase()}</span>
              <span className="cio-info">CIO: {cio.toUpperCase()}</span>
            </h2>
            <p className="modal-subtitle">
              Owner {currentIndex + 1} of {totalOwners} | Performance Analytics
            </p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Metric 1: Performance Trend</h3>
            </div>
            <Line
              data={createChartData(ownerData.data.graph1, 'Performance', '#4f46e5')}
              options={chartOptions}
            />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Metric 2: Engagement Score</h3>
            </div>
            <Line
              data={createChartData(ownerData.data.graph2, 'Engagement', '#06b6d4')}
              options={chartOptions}
            />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Metric 3: Quality Index</h3>
            </div>
            <Bar
              data={createBarChartData(ownerData.data.graph3, 'Quality', '#10b981')}
              options={chartOptions}
            />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Metric 4: Efficiency Rating</h3>
            </div>
            <Bar
              data={createBarChartData(ownerData.data.graph4, 'Efficiency', '#f59e0b')}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="nav-button prev-button"
            onClick={() => onNavigate('prev')}
            aria-label="Previous owner"
          >
            <span className="nav-icon">←</span> Previous
          </button>
          <div className="pagination-dots">
            {Array.from({ length: totalOwners }).map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          <button
            className="nav-button next-button"
            onClick={() => onNavigate('next')}
            aria-label="Next owner"
          >
            Next <span className="nav-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerModal;