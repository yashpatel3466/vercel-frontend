import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintCard from "../components/ComplaintCard";
import { complaintAPI } from "../utils/api";

import ComplaintHeatmap from "../components/ComplaintHeatmap";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: ""
  });
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    loadComplaints();
  }, [filters, showHeatmap]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const queryFilters = {};
      if (filters.status) queryFilters.status = filters.status;
      if (filters.category) queryFilters.category = filters.category;
      if (filters.priority) queryFilters.priority = filters.priority;

      // Fetch all complaints for heatmap
      if (showHeatmap) {
        queryFilters.scope = "global";
      }

      const data = await complaintAPI.getAll(queryFilters);
      setComplaints(data.complaints || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadComplaints();
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  // Function to convert Google Drive URL to embeddable format
  const getGoogleDriveEmbedUrl = (url) => {
    try {
      const match = url.match(/id=([^&]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    } catch (e) {
      console.error("Error extracting drive file ID:", e);
    }
    return url;
  };

  const getImageSrc = (image) => {
    if (image.startsWith('data:')) return image;
    if (image.includes('drive.google.com')) return getGoogleDriveEmbedUrl(image);
    return image;
  };

  // --- Render Header ---
  const renderHeader = () => (
    <div className="dashboard-header">
      <div
        className="logo-section"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
          alt="logo"
          className="logo-img"
        />
        <span className="logo-text">CivicFix</span>
      </div>
      <div className="nav-section">
        <button
          className="dashboard-nav-button"
          onClick={() => navigate("/user/dashboard")}
        >
          My Complaints
        </button>
        <button
          className="dashboard-nav-button"
          onClick={() => navigate("/user/scoreboard")}
        >
          Scoreboard
        </button>
        <button
          className="dashboard-nav-button"
          onClick={() => navigate("/user/profile")}
        >
          Profile
        </button>
        <button
          className="btn-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );

  if (showForm) {
    return (
      <div className="dashboard-page">
        <div className="glass-overlay"></div>
        {renderHeader()}
        <div className="dashboard-container">
          <ComplaintForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  if (selectedComplaint) {
    return (
      <div className="dashboard-page">
        <div className="glass-overlay"></div>
        {renderHeader()}
        <div className="dashboard-container">
          <button
            onClick={() => setSelectedComplaint(null)}
            className="btn-back"
          >
            ← Back to List
          </button>

          <div className="detail-view-container">
            <h2 className="detail-title">{selectedComplaint.title}</h2>

            <div className="detail-badges">
              <span className={`badge badge-${selectedComplaint.status}`}>
                {selectedComplaint.status.replace("_", " ")}
              </span>
              <span className={`badge badge-${selectedComplaint.priority}`}>
                {selectedComplaint.priority}
              </span>
              <span className="badge badge-info">{selectedComplaint.category}</span>
            </div>

            <div className="detail-description">{selectedComplaint.description}</div>

            <div className="detail-grid">
              <div className="detail-row">
                <strong>Location:</strong>
                <span>{selectedComplaint.location.address}</span>
              </div>
              <div className="detail-row">
                <strong>Coordinates:</strong>
                <span>{selectedComplaint.location.latitude}, {selectedComplaint.location.longitude}</span>
              </div>
              <div className="detail-row">
                <strong>Reported:</strong>
                <span>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
              </div>
              {selectedComplaint.assignedTo && (
                <div className="detail-row">
                  <strong>Assigned to:</strong>
                  <span>{selectedComplaint.assignedTo.name}</span>
                </div>
              )}
              {selectedComplaint.resolutionNotes && (
                <div className="detail-row">
                  <strong>Resolution Notes:</strong>
                  <span>{selectedComplaint.resolutionNotes}</span>
                </div>
              )}
            </div>

            {/* Display Images if any */}
            {selectedComplaint.images && selectedComplaint.images.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Attached Photos</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedComplaint.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageSrc(img)}
                      alt={`Complaint attachment ${idx + 1}`}
                      style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Work Progress Update */}
            {selectedComplaint.progressUpdate && selectedComplaint.progressUpdate.status === 'approved' && (
              <div className="action-card" style={{ marginTop: '20px', borderLeft: `4px solid ${selectedComplaint.status === 'resolved' ? '#2f855a' : '#28a745'}` }}>
                <h3 className="section-title" style={{ color: selectedComplaint.status === 'resolved' ? '#2f855a' : '#28a745', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{selectedComplaint.status === 'resolved' ? '✅' : '🚧'}</span>
                  {selectedComplaint.status === 'resolved' ? 'Complaint Resolved' : 'Work in Progress Update'}
                </h3>
                <div style={{ marginBottom: '10px', color: '#666' }}>
                  {selectedComplaint.status === 'resolved'
                    ? "The technician has resolved this complaint. Here is the verified proof of completion from the site:"
                    : "The technician has started work on this complaint. Here is the verified photo from the site:"}
                </div>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                  <img
                    src={getImageSrc(selectedComplaint.progressUpdate.image)}
                    alt="Work Proof"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#888' }}>
                  Verified on {new Date(selectedComplaint.progressUpdate.submittedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="glass-overlay"></div>
      {renderHeader()}

      <div className="dashboard-container">
        <div className="page-header-container">
          {!showHeatmap && <h2 className="user-page-title">My Complaints</h2>}

          <div className="header-actions" style={{ marginLeft: showHeatmap ? 'auto' : '0' }}>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`btn-action btn-toggle-map ${showHeatmap ? 'active' : ''}`}
            >
              {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
            </button>

            {!showHeatmap && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-action btn-create"
              >
                + New Complaint
              </button>
            )}
          </div>
        </div>

        {showHeatmap && (
          <ComplaintHeatmap complaints={complaints} />
        )}

        {!showHeatmap && (
          <>
            <div className="filters-section">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="Road Repair">Road Repair</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Street Lighting">Street Lighting</option>
                <option value="Drainage">Drainage</option>
                <option value="Parks & Recreation">Parks & Recreation</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="filter-select"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {error && <div className="error-container">{error}</div>}

            {loading ? (
              <div className="state-container">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="state-container">
                <p>No complaints found. Create your first complaint!</p>
              </div>
            ) : (
              <div className="complaints-list">
                {complaints.map(complaint => (
                  <ComplaintCard
                    key={complaint._id}
                    complaint={complaint}
                    onView={handleViewDetails}
                    userRole="user"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
