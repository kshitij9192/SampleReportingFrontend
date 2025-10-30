import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import './OwnerModal.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
  annotationPlugin
);

const METRIC_TO_KPI = [
  { graphKey: 'graph1', label: 'Release Frequency', threshold: 2 },
  { graphKey: 'graph2', label: 'Lead Time For Change', threshold: 7 },
  { graphKey: 'graph3', label: 'Change Failure Rate', threshold: 2.5 },
  { graphKey: 'graph4', label: 'Mean Time to Recover', threshold: 12 }
];

const getLastValue = (dataArr) => {
  if (!dataArr || dataArr.length === 0) return '';
  return typeof dataArr[dataArr.length - 1] === 'number'
    ? dataArr[dataArr.length - 1].toFixed(2)
    : dataArr[dataArr.length - 1];
};

const getDelta = (dataArr) => {
  if (!dataArr || dataArr.length < 2) return { value: '', color: '' };
  const prev = dataArr[dataArr.length - 2];
  const curr = dataArr[dataArr.length - 1];
  if (prev === 0) return { value: '0%', color: '#64748b' };
  const val = ((curr - prev) / prev) * 100;
  const rounded = Math.round(val * 100) / 100;
  const color = val > 0 ? '#10b981' : val < 0 ? '#ef4444' : '#64748b';
  return { 
    value: `${val > 0 ? '+' : ''}${rounded}%`, 
    color 
  };
};

const getMinValue = (dataArr) => {
  if (!dataArr || dataArr.length === 0) return 0;
  return Math.min(...dataArr);
};

const skyBlue = '#38bdf8';

const getChartOptions = (threshold, minVal) => {
  const yMin = Math.max(0, Math.floor(minVal - 1));
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#2563eb',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 13 },
        borderColor: '#dbeafe',
        borderWidth: 1
      },
      datalabels: {
        anchor: 'end',
        align: 'start',
        offset: 16,
        color: '#2563eb',
        font: { weight: 'bold', size: 14 },
        formatter: value => value.toFixed(1),
        display: true
      },
      annotation: {
        annotations: {
          thresholdLine: {
            type: 'line',
            yMin: threshold,
            yMax: threshold,
            borderColor: '#ef4444',
            borderWidth: 2.5,
            borderDash: [8, 5],
            label: {
              display: true,
              content: 'Threshold',
              position: 'start',
              color: '#fff',
              backgroundColor: '#ef4444',
              font: { size: 10, weight: 'bold' },
              padding: 4,
              borderRadius: 4
            }
          }
        }
      }
    },
    elements: {
      point: {
        radius: 5,
        backgroundColor: skyBlue,
        borderWidth: 2,
        borderColor: '#fff',
        hoverRadius: 7
      },
      line: { 
        tension: 0.4,
        borderWidth: 3
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { 
          color: '#64748b', 
          font: { size: 11, weight: '600' },
          padding: 6
        }
      },
      y: {
        min: yMin,
        grid: { display: false, drawBorder: true, color: '#e2e8f0', lineWidth: 1 },
        ticks: { 
          display: true,
          color: '#64748b',
          font: { size: 11, weight: '500' },
          stepSize: 1,
          padding: 6,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        }
      }
    }
  };
};

const OwnerModal = ({
  cio, owner, months, ownerData, onClose, onNavigate, currentIndex, totalOwners
}) => {
  if (!ownerData) {
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
    <div className="modal-overlay">
      <div className="modal-content owner-modal-improved">
        <div className="modal-header improved-header">
          <div className="header-info">
            <h2 className="modal-title">
              <span className="owner-badge">{owner.toUpperCase()}</span>
              <span className="cio-info">CIO: {cio.toUpperCase()}</span>
            </h2>
            <p className="modal-subtitle">
              Owner {currentIndex + 1} of {totalOwners}
            </p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="charts-grid improved-grid">
          {METRIC_TO_KPI.map((metric) => {
            const minVal = getMinValue(ownerData[metric.graphKey]);
            const actual = getLastValue(ownerData[metric.graphKey]);
            const delta = getDelta(ownerData[metric.graphKey]);
            return (
              <div className="chart-wrapper" key={metric.label}>
                <div className="chart-title-bar">
                  <h3>{metric.label}</h3>
                </div>
                <div className="chart-canvas-wrapper">
                  <Line
                    data={{
                      labels: months,
                      datasets: [
                        {
                          label: metric.label,
                          data: ownerData[metric.graphKey],
                          borderColor: skyBlue,
                          backgroundColor: `${skyBlue}15`,
                          borderWidth: 3,
                          fill: true,
                          pointRadius: 5,
                          pointHoverRadius: 7,
                          pointBackgroundColor: skyBlue,
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2
                        }
                      ]
                    }}
                    options={getChartOptions(metric.threshold, minVal)}
                    plugins={[ChartDataLabels]}
                  />
                </div>
                <div className="chart-stats-bar">
                  <span className="stat-actual">Actual: {actual}</span>
                  <span className="stat-delta" style={{ color: delta.color }}>
                    {delta.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer improved-footer">
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
