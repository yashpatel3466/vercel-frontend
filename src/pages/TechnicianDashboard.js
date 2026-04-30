import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintCard from "../components/ComplaintCard";
import TechnicianDashboardHeader from "../components/TechnicianDashboardHeader";
import { complaintAPI } from "../utils/api";
import { openGoogleDrivePicker } from "../utils/googleDrivePicker";
import toast from "react-hot-toast";
import "./TechnicianDashboard.css";

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]); // Store all relevant complaints for notifications
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: ""
  });
  const [statusUpdate, setStatusUpdate] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [quotation, setQuotation] = useState({
    amount: "",
    estimatedDays: "",
    description: ""
  });
  const [showQuotationForm, setShowQuotationForm] = useState(false);

  // Progress Verification State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressImage, setProgressImage] = useState("");
  const [progressLocation, setProgressLocation] = useState(null);
  const [verifyingLocation, setVerifyingLocation] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Function to convert Google Drive URL to embeddable format
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

  // Function to get image source with proper handling
  const getImageSrc = (image) => {
    if (image.startsWith('data:')) return image; // Base64 image
    if (image.includes('drive.google.com')) return getGoogleDriveEmbedUrl(image); // Google Drive image
    return image; // Regular URL
  };

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintAPI.getAll(filters);
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!currentUser || !currentUser.id) {
        setComplaints([]);
        setAllComplaints([]);
        return;
      }

      const allRelevant = (data.complaints || []).filter(complaint => {
        const technicianAssignment = complaint.assignedTechnicians?.find(
          assignment => {
            if (!assignment || !assignment.technician) return false;
            const techId = assignment.technician._id || assignment.technician;
            return techId.toString() === currentUser.id.toString();
          }
        );
        return !!technicianAssignment;
      });
      setAllComplaints(allRelevant);

      // Filter out complaints where technician was rejected for the main list
      const filteredComplaints = allRelevant.filter(complaint => {
        // Check if technician is assigned to this complaint
        // Check if technician is assigned to this complaint
        const technicianAssignment = complaint.assignedTechnicians?.find(
          assignment => {
            if (!assignment || !assignment.technician) return false;
            const techId = assignment.technician._id || assignment.technician;
            return techId.toString() === currentUser.id.toString();
          }
        );

        // Only show complaints where technician is not rejected
        return technicianAssignment && technicianAssignment.status !== "rejected";
      });

      setComplaints(filteredComplaints);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDrivePick = (data) => {
    if (data.url) {
      setProgressImage(data.url);
      toast.success("Image selected from Google Drive");
    }
  };

  // Handle file upload from device
  const handleDeviceUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProgressImage(reader.result); // This is the Base64 string
        toast.success("Image uploaded from device");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureLocation = () => {
    setVerifyingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setVerifyingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProgressLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success("Location captured successfully");
        setVerifyingLocation(false);
      },
      (error) => {
        console.error("Error capturing location:", error);
        toast.error("Failed to capture location. Please enable location services.");
        setVerifyingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmitProgress = async () => {
    if (!progressImage || !progressLocation) {
      toast.error("Please provide both an image and your location");
      return;
    }

    try {
      const target = statusUpdate === "resolved" ? "resolved" : "in_progress";

      await complaintAPI.submitProgressUpdate(selectedComplaint._id, {
        image: progressImage,
        location: progressLocation,
        targetStatus: target,
        resolutionNotes: resolutionNotes // Send the notes from state
      });
      toast.success("Progress verification submitted! Awaiting Admin approval.");

      // Reset state
      setShowProgressModal(false);
      setProgressImage("");
      setProgressLocation(null);
      setStatusUpdate("");
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      toast.error(err.message || "Failed to submit progress report");
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) {
      toast.error("Please select a status");
      return;
    }

    // Intercept "In Progress" AND "Resolved" status for verification
    if (statusUpdate === "in_progress" || statusUpdate === "resolved") {
      setShowProgressModal(true);
      return;
    }

    try {
      const updateData = { status: statusUpdate };
      if (statusUpdate === "resolved" && resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }

      await complaintAPI.updateStatus(selectedComplaint._id, updateData);
      toast.success("Status updated successfully!");
      setStatusUpdate("");
      setResolutionNotes("");
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleQuotationSubmit = async () => {
    if (!quotation.amount || !quotation.estimatedDays || !quotation.description) {
      toast.error("Please fill all quotation fields");
      return;
    }

    try {
      await complaintAPI.submitQuotation(selectedComplaint._id, quotation);
      toast.success("Quotation submitted successfully!");
      setQuotation({ amount: "", estimatedDays: "", description: "" });
      setShowQuotationForm(false);
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      toast.error(err.message || "Failed to submit quotation");
    }
  };

  const handleViewDetails = async (complaint) => {
    try {
      const data = await complaintAPI.getById(complaint._id);
      setSelectedComplaint(data.complaint);

      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!currentUser || !currentUser.id) {
        setShowQuotationForm(false);
        return;
      }

      const technicianAssignment = data.complaint.assignedTechnicians?.find(
        assignment => {
          if (!assignment || !assignment.technician) return false;
          return assignment.technician._id === currentUser.id ||
            assignment.technician._id?.toString() === currentUser.id.toString();
        }
      );

      // Only show quotation form if technician is assigned (pending or selected) and hasn't quoted yet
      const isAssigned = technicianAssignment?.status === "pending" || technicianAssignment?.status === "selected";

      // Check if already quoted
      const hasQuoted = data.complaint.quotations?.some(
        q => q.technician._id === currentUser.id || q.technician._id.toString() === currentUser.id.toString()
      );

      setShowQuotationForm(isAssigned && !hasQuoted);
    } catch (err) {
      toast.error(err.message || "Failed to load complaint details");
    }
  };

  const assignedCount = complaints.filter(
    (c) => c.status !== "resolved" && c.status !== "rejected"
  ).length;

  const inProgressCount = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  // --- Modal for Progress Verification ---
  if (showProgressModal) {
    return (
      <div className="dashboard-page">
        <div className="glass-overlay"></div>
        <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div className="action-card" style={{ maxWidth: '500px', width: '100%' }}>
            <h3 className="action-title">📸 Progress Update</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              To set this complaint to "In Progress", you must upload a photo of the work site and verify you are within 500m of the location.
            </p>

            {/* Step 1: Image Upload */}
            <div className="form-group">
              <label className="form-label">1. Upload Photo (Proof of work):</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => openGoogleDrivePicker({ onPick: (data) => handleGoogleDrivePick(data) })}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <span style={{ marginRight: '5px' }}>📁</span> Google Drive
                  </button>

                  <label className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                    <span style={{ marginRight: '5px' }}>📱</span> Device Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {progressImage && (
                  <div style={{ marginTop: '10px', height: '150px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={getImageSrc(progressImage)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                {progressImage && <p style={{ color: '#28a745', fontSize: '0.9rem', textAlign: 'center' }}>✓ Image Selected</p>}
              </div>
            </div>

            {/* Step 2: Location Verification */}
            <div className="form-group">
              <label className="form-label">2. Verify Location:</label>
              <button
                onClick={handleCaptureLocation}
                className="btn-secondary"
                disabled={verifyingLocation}
                style={{ width: '100%' }}
              >
                {verifyingLocation ? "Locating..." : (progressLocation ? "✓ Location Captured" : "📍 Capture Current Location")}
              </button>
              {progressLocation && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                  Lat: {progressLocation.latitude.toFixed(6)}, Lng: {progressLocation.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => { setShowProgressModal(false); setProgressImage(""); setProgressLocation(null); }}
                className="btn-back"
                style={{ flex: 1, marginBottom: 0 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProgress}
                className="btn-primary"
                style={{ flex: 1, marginTop: 0 }}
                disabled={!progressImage || !progressLocation}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- DETAILS VIEW ---------------- */
  if (selectedComplaint) {
    return (
      <div className="dashboard-page">
        <div className="glass-overlay"></div>
        <div className="glass-overlay"></div>
        <TechnicianDashboardHeader complaints={allComplaints} />

        <div className="dashboard-container">
          <button onClick={() => setSelectedComplaint(null)} className="btn-back">
            ← Back to List
          </button>

          <div className="detail-view-container">
            <div className="detail-header">
              <h2 className="detail-title">{selectedComplaint.title}</h2>
              <div className="detail-badges">
                {(() => {
                  const currentUser = JSON.parse(localStorage.getItem("user"));
                  const assignment = selectedComplaint.assignedTechnicians?.find(
                    a => a.technician._id === currentUser.id || a.technician === currentUser.id
                  );
                  const isRejected = assignment?.status === "rejected";
                  const displayStatus = isRejected ? "rejected" : selectedComplaint.status;

                  return (
                    <span className={`badge badge-${displayStatus}`}>
                      {displayStatus ? displayStatus.replace("_", " ") : ''}
                    </span>
                  );
                })()}
                <span className={`badge badge-${selectedComplaint.priority}`}>
                  {selectedComplaint.priority}
                </span>
                <span className="badge badge-info">{selectedComplaint.category}</span>
              </div>
            </div>

            <div className="detail-description">{selectedComplaint.description}</div>

            {/* Display uploaded photos */}
            {selectedComplaint.images && selectedComplaint.images.length > 0 && (
              <div className="photo-section">
                <h4 className="section-title">Uploaded Photos:</h4>
                <div className="photo-grid">
                  {selectedComplaint.images.map((image, index) => (
                    <div key={index} className="photo-item">
                      <img
                        src={getImageSrc(image)}
                        alt={`Complaint photo ${index + 1}`}
                        className="photo-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-grid" style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Location:</strong> {selectedComplaint.location?.address}</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Coordinates:</strong> {selectedComplaint.location?.latitude}, {selectedComplaint.location?.longitude}</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Reported by:</strong> {selectedComplaint.reportedBy?.name}</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Reported on:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</div>
            </div>

            {/* Status Update Section */}
            {(() => {
              const currentUser = JSON.parse(localStorage.getItem("user"));
              if (!currentUser || !currentUser.id) return null;

              const technicianAssignment = selectedComplaint.assignedTechnicians?.find(
                assignment => {
                  if (!assignment || !assignment.technician) return false;
                  return assignment.technician._id === currentUser.id ||
                    assignment.technician._id?.toString() === currentUser.id.toString();
                }
              );



              // Only show status update if technician is assigned (final assignment)
              const canUpdateStatus = technicianAssignment?.status === "assigned" ||
                selectedComplaint.assignedTo?._id === currentUser.id ||
                selectedComplaint.assignedTo?._id?.toString() === currentUser.id.toString();

              if (!canUpdateStatus) return null;

              if (selectedComplaint.progressUpdate?.status === 'pending') {
                return (
                  <div className="status-message">
                    <h3 style={{ color: "#fd7e14" }}>⏳ Pending Verification</h3>
                    <p>Your request to start work is pending admin approval. You will be notified once verified.</p>
                    <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                      <strong>Proof Submitted:</strong> {new Date(selectedComplaint.progressUpdate.submittedAt).toLocaleString()}
                    </div>
                  </div>
                );
              }

              if (selectedComplaint.progressUpdate?.status === 'rejected' && selectedComplaint.status !== 'in_progress') {
                // If rejected, show why and allow matching
                return (
                  <div className="action-card">
                    <div className="status-message" style={{ marginBottom: '15px' }}>
                      <h3 style={{ color: "#dc3545" }}>❌ Verification Rejected</h3>
                      <p>{selectedComplaint.progressUpdate.adminNotes || "Location check failed or photo invalid."}</p>
                      <p>Please try again.</p>
                    </div>
                    <h3 className="action-title">🔧 Update Status</h3>
                    {/* ... rest of the form ... */}
                    <div className="form-group">
                      <label className="form-label">Update Status:</label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="filter-select"
                        style={{ width: '100%' }}
                      >
                        <option value="">Select status</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    {/* ... handling resolved ... */}
                    {statusUpdate === "resolved" && (
                      <div className="form-group">
                        <label className="form-label">Resolution Notes:</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="form-control"
                          rows="4"
                          placeholder="Describe how the issue was resolved..."
                        />
                      </div>
                    )}

                    <button
                      onClick={handleStatusUpdate}
                      className="btn-primary"
                      disabled={!statusUpdate}
                    >
                      Update Status
                    </button>
                  </div>
                );
              }

              return (
                <div className="action-card">
                  <h3 className="action-title">🔧 Update Status</h3>
                  <div className="form-group">
                    <label className="form-label">Update Status:</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="filter-select"
                      style={{ width: '100%' }}
                    >
                      <option value="">Select status</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {statusUpdate === "resolved" && (
                    <div className="form-group">
                      <label className="form-label">Resolution Notes:</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="form-control"
                        rows="4"
                        placeholder="Describe how the issue was resolved..."
                      />
                    </div>
                  )}

                  <button
                    onClick={handleStatusUpdate}
                    className="btn-primary"
                    disabled={!statusUpdate}
                  >
                    Update Status
                  </button>
                </div>
              );
            })()}

            {/* Quotation Form */}
            {(() => {
              const currentUser = JSON.parse(localStorage.getItem("user"));
              if (!currentUser || !currentUser.id) {
                return (
                  <div className="status-message">
                    <p style={{ color: "#dc3545" }}>User session expired. Please login again.</p>
                  </div>
                );
              }

              const technicianAssignment = selectedComplaint.assignedTechnicians?.find(
                assignment => {
                  if (!assignment || !assignment.technician) return false;
                  return assignment.technician._id === currentUser.id ||
                    assignment.technician._id?.toString() === currentUser.id.toString();
                }
              );

              if (!technicianAssignment) {
                return (
                  <div className="status-message">
                    <p style={{ color: "#dc3545" }}>You are not assigned to this complaint</p>
                  </div>
                );
              }

              if (technicianAssignment.status === "pending") {
                return (
                  <div className="action-card">
                    <h3 className="action-title">📝 Submit Your Quotation</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                      You have been assigned to this complaint. Please submit your quotation for consideration.
                    </p>
                    <div className="form-group">
                      <label className="form-label">Amount ($):</label>
                      <input
                        type="number"
                        value={quotation.amount}
                        onChange={(e) => setQuotation({ ...quotation, amount: e.target.value })}
                        className="form-control"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estimated Days:</label>
                      <input
                        type="number"
                        value={quotation.estimatedDays}
                        onChange={(e) => setQuotation({ ...quotation, estimatedDays: e.target.value })}
                        className="form-control"
                        placeholder="Enter estimated days"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description:</label>
                      <textarea
                        value={quotation.description}
                        onChange={(e) => setQuotation({ ...quotation, description: e.target.value })}
                        className="form-control"
                        rows="4"
                        placeholder="Describe the work to be done..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                      <button
                        onClick={() => setShowQuotationForm(false)}
                        className="btn-secondary"
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: '#f8f9fa',
                          color: '#6c757d',
                          border: '1px solid #dee2e6',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          marginBottom: 0
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleQuotationSubmit}
                        className="btn-primary"
                        style={{ width: 'auto', minWidth: '200px', marginTop: 0 }}
                        disabled={!quotation.amount || !quotation.estimatedDays || !quotation.description}
                      >
                        Submit Quotation
                      </button>
                    </div>
                  </div>
                );
              } else if (technicianAssignment.status === 'quoted') {
                return (
                  <div className="status-message">
                    <h3 style={{ color: "#6f42c1" }}>Quotation Submitted</h3>
                    <p>Your quotation is under review by the administrator.</p>
                  </div>
                );
              } else if (technicianAssignment.status === 'rejected') {
                return (
                  <div className="status-message">
                    <h3 style={{ color: "#dc3545" }}>Quotation Rejected</h3>
                    <p>Your quotation for this complaint was not selected.</p>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="dashboard-page">
      <div className="glass-overlay"></div>
      <TechnicianDashboardHeader complaints={allComplaints} />

      <div className="dashboard-container">
        <h2 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "30px", color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.3)", background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Technician Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">{assignedCount}</h3>
            <p className="stat-title">Active Jobs</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">{inProgressCount}</h3>
            <p className="stat-title">In Progress</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">{resolvedCount}</h3>
            <p className="stat-title">Completed</p>
          </div>
        </div>

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
        </div>

        {error && <div className="error-alert" style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(220, 53, 69, 0.2)' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.9)', borderRadius: '12px' }}>
            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>No complaints assigned to you.</p>
          </div>
        ) : (
          <div className="complaints-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {complaints.map(complaint => {
              const currentUser = JSON.parse(localStorage.getItem("user"));
              const assignment = complaint.assignedTechnicians?.find(
                a => a.technician._id === currentUser.id || a.technician === currentUser.id
              );

              const isRejected = assignment?.status === "rejected";

              return (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  onView={handleViewDetails}
                  userRole="technician"
                  customStatus={isRejected ? "rejected" : null}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
