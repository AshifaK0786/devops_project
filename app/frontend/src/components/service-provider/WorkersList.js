import React, { useState, useEffect } from 'react';
import WorkerForm from './WorkerForm';
import './WorkersList.css';

const WorkersList = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchWorkers();
    fetchStats();
  }, [filterStatus]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all' 
        ? 'http://localhost:5000/api/workers'
        : `http://localhost:5000/api/workers?status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers);
      } else {
        console.error('Error fetching workers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/workers/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddWorker = async (workerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workerData)
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        fetchWorkers();
        fetchStats();
        alert('Worker added successfully!');
      } else {
        alert(data.message || 'Error adding worker');
      }
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Error adding worker');
    }
  };

  const handleEditWorker = async (workerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/workers/${editingWorker._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workerData)
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingWorker(null);
        fetchWorkers();
        fetchStats();
        alert('Worker updated successfully!');
      } else {
        alert(data.message || 'Error updating worker');
      }
    } catch (error) {
      console.error('Error updating worker:', error);
      alert('Error updating worker');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/workers/${workerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchWorkers();
        fetchStats();
        alert('Worker deleted successfully!');
      } else {
        alert(data.message || 'Error deleting worker');
      }
    } catch (error) {
      console.error('Error deleting worker:', error);
      alert('Error deleting worker');
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Inactive': return '#6c757d';
      case 'On Leave': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'Full-time': return '👔';
      case 'Part-time': return '⏰';
      case 'Contract': return '📝';
      case 'Freelance': return '💼';
      default: return '👔';
    }
  };

  if (showForm) {
    return (
      <WorkerForm
        worker={editingWorker}
        onSubmit={editingWorker ? handleEditWorker : handleAddWorker}
        onCancel={() => {
          setShowForm(false);
          setEditingWorker(null);
        }}
        isEditing={!!editingWorker}
      />
    );
  }

  return (
    <div className="workers-list-container">
      {/* Header */}
      <div className="workers-header">
        <h2>👥 Worker Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="add-worker-btn"
        >
          ➕ Add New Worker
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalWorkers}</h3>
              <p>Total Workers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.activeWorkers}</h3>
              <p>Active Workers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.experience.avgExperience.toFixed(1)}</h3>
              <p>Avg Experience</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{stats.experience.totalExperience}</h3>
              <p>Total Experience</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="workers-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search workers by name, specialization, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <label>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Workers List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading workers...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Workers Found</h3>
          <p>
            {searchTerm 
              ? `No workers match your search "${searchTerm}"`
              : 'Start by adding your first worker to the team'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowForm(true)}
              className="add-first-worker-btn"
            >
              Add Your First Worker
            </button>
          )}
        </div>
      ) : (
        <div className="workers-grid">
          {filteredWorkers.map((worker) => (
            <div key={worker._id} className="worker-card">
              <div className="worker-header">
                <div className="worker-avatar">
                  {worker.name.charAt(0).toUpperCase()}
                </div>
                <div className="worker-basic-info">
                  <h3>{worker.name}</h3>
                  <p className="worker-specialization">{worker.specialization}</p>
                  <span 
                    className="worker-status"
                    style={{ backgroundColor: getStatusColor(worker.status) }}
                  >
                    {worker.status}
                  </span>
                </div>
              </div>

              <div className="worker-details">
                <div className="detail-row">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{worker.email}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">📱 Phone:</span>
                  <span className="detail-value">{worker.phone}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">💼 Experience:</span>
                  <span className="detail-value">{worker.experience} years</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">{getAvailabilityIcon(worker.availability)} Availability:</span>
                  <span className="detail-value">{worker.availability}</span>
                </div>

                {worker.hourlyRate && (
                  <div className="detail-row">
                    <span className="detail-label">💰 Rate:</span>
                    <span className="detail-value">${worker.hourlyRate}/hour</span>
                  </div>
                )}

                {worker.address && (
                  <div className="detail-row">
                    <span className="detail-label">📍 Address:</span>
                    <span className="detail-value">{worker.address}</span>
                  </div>
                )}

                {worker.notes && (
                  <div className="detail-row notes-row">
                    <span className="detail-label">📝 Notes:</span>
                    <span className="detail-value">{worker.notes}</span>
                  </div>
                )}
              </div>

              <div className="worker-actions">
                <button 
                  onClick={() => {
                    setEditingWorker(worker);
                    setShowForm(true);
                  }}
                  className="edit-btn"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDeleteWorker(worker._id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="worker-footer">
                <small>
                  Joined: {new Date(worker.joiningDate || worker.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkersList;