/**
 * Analytics Charts Component
 * Visual charts for admin dashboard analytics
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const AnalyticsCharts = ({ requests }) => {
  const deviceTypeChartRef = useRef(null);
  const conditionChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const deviceTypeChartInstance = useRef(null);
  const conditionChartInstance = useRef(null);
  const statusChartInstance = useRef(null);

  useEffect(() => {
    if (!requests || requests.length === 0) return;

    // Calculate device type statistics
    const deviceTypes = {};
    const conditions = {};
    const statuses = {};

    requests.forEach(request => {
      // Device types
      deviceTypes[request.deviceType] = (deviceTypes[request.deviceType] || 0) + 1;
      
      // Conditions
      conditions[request.condition] = (conditions[request.condition] || 0) + 1;
      
      // Statuses
      statuses[request.status] = (statuses[request.status] || 0) + 1;
    });

    // Device Type Chart
    if (deviceTypeChartRef.current) {
      if (deviceTypeChartInstance.current) {
        deviceTypeChartInstance.current.destroy();
      }

      const ctx = deviceTypeChartRef.current.getContext('2d');
      deviceTypeChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(deviceTypes),
          datasets: [{
            label: 'Device Types',
            data: Object.values(deviceTypes),
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
              '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            title: {
              display: true,
              text: 'Device Type Distribution',
              font: { size: 16, weight: 'bold' },
              padding: 20
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Condition Chart
    if (conditionChartRef.current) {
      if (conditionChartInstance.current) {
        conditionChartInstance.current.destroy();
      }

      const ctx = conditionChartRef.current.getContext('2d');
      
      // Define color mapping for device conditions
      const conditionColorMap = {
        'Dead': '#ef4444',      // Red
        'Working': '#10b981',   // Green
        'Damaged': '#f59e0b'    // Yellow
      };
      
      const conditionLabels = Object.keys(conditions);
      const conditionColors = conditionLabels.map(condition => 
        conditionColorMap[condition] || '#94a3b8'
      );
      
      conditionChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: conditionLabels,
          datasets: [{
            label: 'Device Condition',
            data: Object.values(conditions),
            backgroundColor: conditionColors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            title: {
              display: true,
              text: 'Device Condition',
              font: { size: 16, weight: 'bold' },
              padding: 20
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Status Chart
    if (statusChartRef.current) {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }

      const ctx = statusChartRef.current.getContext('2d');
      
      // Define color mapping for each status
      const statusColorMap = {
        'PENDING': '#fbbf24',      // Yellow
        'IN_PROGRESS': '#3b82f6',  // Blue
        'ASSIGNED': '#8b5cf6',     // Purple
        'POSTPONED': '#fb923c',    // Orange
        'COMPLETED': '#10b981',    // Green
        'RESOLVED': '#10b981',     // Green
        'REJECTED': '#ef4444',     // Red
        'IN_REVIEW': '#eab308',    // Yellow-Green
        'ON_HOLD': '#6366f1'       // Indigo
      };
      
      statusChartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(statuses).map(status => {
            const statusMap = {
              'PENDING': 'Pending',
              'IN_PROGRESS': 'In Progress',
              'ASSIGNED': 'Assigned',
              'POSTPONED': 'Postponed',
              'COMPLETED': 'Completed',
              'RESOLVED': 'Completed',
              'REJECTED': 'Rejected',
              'IN_REVIEW': 'In Review',
              'ON_HOLD': 'On Hold'
            };
            return statusMap[status] || status;
          }),
          datasets: [{
            label: 'Request Status',
            data: Object.values(statuses),
            backgroundColor: Object.keys(statuses).map(status => statusColorMap[status] || '#999999'),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            title: {
              display: true,
              text: 'Request Status',
              font: { size: 16, weight: 'bold' },
              padding: 20
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Cleanup
    return () => {
      if (deviceTypeChartInstance.current) deviceTypeChartInstance.current.destroy();
      if (conditionChartInstance.current) conditionChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [requests]);

  if (!requests || requests.length === 0) {
    return (
      <div className="analytics-empty">
        <div className="empty-icon">📊</div>
        <h3>No Data Available</h3>
        <p>Analytics will be displayed once pickup requests are available.</p>
      </div>
    );
  }

  // Calculate summary statistics
  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'RESOLVED').length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card blue">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <div className="summary-value">{totalRequests}</div>
            <div className="summary-label">Total Requests</div>
          </div>
        </div>
        <div className="summary-card yellow">
          <div className="summary-icon">⏳</div>
          <div className="summary-info">
            <div className="summary-value">{pendingRequests}</div>
            <div className="summary-label">Pending</div>
          </div>
        </div>
        <div className="summary-card green">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <div className="summary-value">{completedRequests}</div>
            <div className="summary-label">Completed</div>
          </div>
        </div>
        <div className="summary-card red">
          <div className="summary-icon">❌</div>
          <div className="summary-info">
            <div className="summary-value">{rejectedRequests}</div>
            <div className="summary-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <canvas ref={deviceTypeChartRef}></canvas>
        </div>
        <div className="chart-card">
          <canvas ref={statusChartRef}></canvas>
        </div>
        <div className="chart-card">
          <canvas ref={conditionChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
