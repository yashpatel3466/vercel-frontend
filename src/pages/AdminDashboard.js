import { useState, useEffect } from "react";
import ComplaintCard from "../components/ComplaintCard";
import ConfirmationModal from "../components/ConfirmationModal";
import AdminDashboardHeader from "../components/AdminDashboardHeader";
import { complaintAPI } from "../utils/api";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignTechnician, setAssignTechnician] = useState("");
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  const [showTechModal, setShowTechModal] = useState(false);

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDangerous: false
  });

  const closeConfirmation = () => {
    setConfirmation({ ...confirmation, isOpen: false });
  };

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: ""
  });
  const [lastViewedId, setLastViewedId] = useState(localStorage.getItem("lastViewedComplaintId") || "");

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
    if (image.startsWith('data:')) {
      return image; // Base64 image
    }
    if (image.includes('drive.google.com')) {
      return getGoogleDriveEmbedUrl(image); // Google Drive image
    }
    return image; // Regular URL
  };



  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complaintsData, statsData, techsData] = await Promise.all([
        complaintAPI.getAll(filters),
        complaintAPI.getStatistics(),
        complaintAPI.getTechnicians()
      ]);

      setComplaints(complaintsData.complaints || []);
      setStatistics(statsData);
      setTechnicians(techsData.technicians || []);
      setError("");
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId) => {
    if (!assignTechnician) {
      toast.error("Please select a technician");
      return;
    }

    try {
      await complaintAPI.assign(complaintId, assignTechnician);
      toast.success("Complaint assigned successfully!");
      setAssignTechnician("");
      setSelectedComplaint(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to assign complaint");
    }
  };

  const handleAssignMultiple = async (complaintId) => {
    if (selectedTechnicians.length === 0) {
      toast.error("Please select at least one technician");
      return;
    }

    try {
      await complaintAPI.assignMultiple(complaintId, selectedTechnicians);
      toast.success("Complaint assigned to multiple technicians!");
      setSelectedTechnicians([]);
      setSelectedComplaint(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to assign complaint");
    }
  };

  const handleAcceptQuotation = (complaintId, quotationId) => {
    setConfirmation({
      isOpen: true,
      title: "Accept Quotation",
      message: "Are you sure you want to accept this quotation? This will assign the complaint to the technician.",
      isDangerous: false,
      onConfirm: async () => {
        try {
          await complaintAPI.acceptQuotation(complaintId, quotationId);
          toast.success("Quotation accepted & technician assigned!");
          setSelectedComplaint(null);
          loadData();
          closeConfirmation();
        } catch (err) {
          toast.error(err.message || "Failed to accept quotation");
          closeConfirmation();
        }
      }
    });
  };

  const handleSelectTechnician = (complaintId, technicianId) => {
    // Check if this technician has submitted a quotation
    const quotation = selectedComplaint.quotations?.find(
      q => q.technician._id === technicianId || q.technician === technicianId
    );

    if (!quotation) {
      toast.error("Cannot select: Technician has not submitted a quotation yet.");
      return;
    }

    // If quotation exists, proceed to accept it
    handleAcceptQuotation(complaintId, quotation._id);
  };

  const handleTechnicianSelection = (techId) => {
    if (selectedTechnicians.includes(techId)) {
      setSelectedTechnicians(selectedTechnicians.filter(id => id !== techId));
    } else {
      setSelectedTechnicians([...selectedTechnicians, techId]);
    }
  };

  const handleVerifyProgress = async (complaintId, approved, notes = "") => {
    try {
      await complaintAPI.verifyProgressUpdate(complaintId, { approved, notes });
      toast.success(approved ? "Progress approved!" : "Progress rejected");
      loadData();
      if (selectedComplaint) {
        // Refresh selected complaint
        const data = await complaintAPI.getById(complaintId);
        setSelectedComplaint(data.complaint);
      }
    } catch (err) {
      toast.error(err.message || "Failed to verify progress");
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await complaintAPI.updateStatus(complaintId, { status: newStatus });
      toast.success("Status updated successfully!");
      loadData();
      if (selectedComplaint) {
        const updated = await complaintAPI.getById(complaintId);
        setSelectedComplaint(updated.complaint);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleViewDetails = async (complaint) => {
    try {
      console.log("handleViewDetails called with:", complaint);

      // Handle potential event object if passed incorrectly
      if (complaint && complaint.stopPropagation) {
        console.warn("Event object passed instead of complaint!");
        return;
      }

      if (!complaint || !complaint._id) {
        console.error("Invalid complaint object passed to handleViewDetails", complaint);
        toast.error("Error: Invalid complaint data");
        return;
      }

      // Mark as viewed if it was the highlighted one
      if (complaint._id !== lastViewedId) {
        setLastViewedId(complaint._id);
        localStorage.setItem("lastViewedComplaintId", complaint._id);
      }

      const data = await complaintAPI.getById(complaint._id);
      setSelectedComplaint(data.complaint);
    } catch (err) {
      console.error("handleViewDetails error:", err);
      toast.error(err.message || "Failed to load complaint details");
    }
  };

  // Determine the newest complaint ID safely
  const latestComplaintId = complaints.length > 0
    ? [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]._id
    : null;

  /* -------------------- DETAILS VIEW -------------------- */
  if (selectedComplaint) {
    return (
      <div className="dashboard-page">
        <div className="glass-overlay"></div>
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={closeConfirmation}
          isDangerous={confirmation.isDangerous}
        />
        <div className="dashboard-container">
          <button
            onClick={() => setSelectedComplaint(null)}
            className="btn-back"
          >
            ← Back to List
          </button>

          <div className="detail-view-container">
            <div className="detail-header">
              <h2 className="detail-title">{selectedComplaint.title}</h2>

              {selectedComplaint.status === 'escalated' && (
                <div style={{
                  background: '#ffebee',
                  color: '#c62828',
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #ef9a9a'
                }}>
                  <span>⚠️</span>
                  <span>ESCALATED TO HIGHER AUTHORITY: Resolution deadline exceeded for {selectedComplaint.priority} priority.</span>
                </div>
              )}

              <div className="detail-badges">
                <span className={`badge badge-${selectedComplaint.status}`}>
                  {selectedComplaint.status}
                </span>
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
                  {selectedComplaint.images.map((image, index) => {
                    return (
                      <div key={index} className="photo-item">
                        <img
                          src={getImageSrc(image)}
                          alt={`Evidence ${index + 1}`}
                          className="photo-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="photo-info">
                          {image.startsWith('data:') ? 'Base64' : image.includes('drive.google.com') ? 'Google Drive' : 'URL'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="detail-grid">
              <div className="detail-row"><strong>Location:</strong> {selectedComplaint.location?.address}</div>
              <div className="detail-row"><strong>Coordinates:</strong> {selectedComplaint.location?.latitude}, {selectedComplaint.location?.longitude}</div>
              <div className="detail-row"><strong>Reported by:</strong> {selectedComplaint.reportedBy?.name}</div>
              <div className="detail-row"><strong>Reported on:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</div>

              {selectedComplaint.assignedTo && (
                <div className="detail-row"><strong>Assigned to:</strong> {selectedComplaint.assignedTo.name}</div>
              )}
            </div>

            {/* Show assigned technicians */}
            {selectedComplaint.assignedTechnicians && selectedComplaint.assignedTechnicians.length > 0 && (
              <div className="list-section">
                <strong>Assigned Technicians:</strong>
                <div className="list-container">
                  {selectedComplaint.assignedTechnicians.map((assignment, index) => (
                    <div key={index} className="list-item">
                      <span>{assignment.technician.name}</span>
                      <span className={`badge badge-${assignment.status}`}>
                        {assignment.status}
                      </span>
                      {/* Show "Select This Technician" button for all pending assignments */}
                      {assignment.status === "pending" && (
                        <button
                          onClick={() => handleSelectTechnician(selectedComplaint._id, assignment.technician._id)}
                          className="btn-action"
                        >
                          Select This Technician
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show quotations */}
            {selectedComplaint.quotations && selectedComplaint.quotations.length > 0 && (
              <div className="list-section">
                <strong>Received Quotations:</strong>
                <div className="list-container">
                  {selectedComplaint.quotations.map((quotation, index) => {
                    // Only show quotation if it's from the assigned technician or if no technician is assigned yet
                    const shouldShowQuotation = !selectedComplaint.assignedTo ||
                      (selectedComplaint.assignedTo && selectedComplaint.assignedTo._id === quotation.technician._id);

                    if (!shouldShowQuotation) return null;

                    return (
                      <div key={index} className="quotation-item">
                        <div className="quotation-header">
                          <strong>{quotation.technician.name}</strong>
                          <span className={`badge badge-${quotation.status}`}>
                            {quotation.status}
                          </span>
                        </div>
                        <div><strong>Amount:</strong> ${quotation.amount}</div>
                        <div><strong>Estimated Days:</strong> {quotation.estimatedDays}</div>
                        <div style={{ marginTop: '0.5rem' }}><strong>Description:</strong> {quotation.description}</div>
                        {quotation.status === "pending" && !selectedComplaint.assignedTo && (
                          <button
                            onClick={() => handleAcceptQuotation(selectedComplaint._id, quotation._id)}
                            className="btn-primary"
                            style={{ marginTop: '1rem', width: 'auto' }}
                          >
                            Accept Quotation & Assign
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedComplaint.resolutionNotes && (
              <div className="detail-row" style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                <strong>Resolution Notes:</strong> {selectedComplaint.resolutionNotes}
              </div>
            )}

            {/* Progress Verification Section */}
            {selectedComplaint.progressUpdate && selectedComplaint.progressUpdate.status !== 'none' && (
              <div className="action-card" style={{ border: '2px solid #fd7e14' }}>
                <h3 className="section-title">🚧 Work Progress Verification</h3>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {/* Original Photo */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Original Complaint Photo:</h4>
                    {selectedComplaint.images && selectedComplaint.images[0] ? (
                      <img src={getImageSrc(selectedComplaint.images[0])} alt="Original" style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
                    ) : <p>No original photo.</p>}
                  </div>

                  {/* Technician Photo */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#fd7e14', marginBottom: '5px' }}>Technician's Progress Photo:</h4>
                    <img src={getImageSrc(selectedComplaint.progressUpdate.image)} alt="Progress" style={{ width: '100%', borderRadius: '8px', border: '2px solid #fd7e14', maxHeight: '200px', objectFit: 'cover' }} />
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-row">
                    <strong>Technician:</strong> {selectedComplaint.progressUpdate.technician?.name || "Unknown"}
                  </div>
                  <div className="detail-row">
                    <strong>Location:</strong>
                    <div style={{ marginLeft: '5px' }}>
                      {selectedComplaint.location.address}
                      <span style={{
                        color: selectedComplaint.progressUpdate.distanceMeters <= 500 ? 'green' : 'red',
                        fontWeight: 'bold',
                        fontSize: '0.85em',
                        marginLeft: '5px'
                      }}>
                        ({Math.round(selectedComplaint.progressUpdate.distanceMeters)}m from site)
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <strong>Submitted:</strong> {new Date(selectedComplaint.progressUpdate.submittedAt).toLocaleString()}
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong> <span className={`badge badge-${selectedComplaint.progressUpdate.status}`}>{selectedComplaint.progressUpdate.status}</span>
                  </div>
                  {selectedComplaint.progressUpdate.resolutionNotes && (
                    <div className="detail-row" style={{ marginTop: '10px', gridColumn: '1 / -1' }}>
                      <strong>Resolution Notes:</strong> {selectedComplaint.progressUpdate.resolutionNotes}
                    </div>
                  )}
                </div>

                {selectedComplaint.progressUpdate.status === 'pending' && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <p style={{ marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>Review Action:</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleVerifyProgress(selectedComplaint._id, true)}
                        className="btn-primary"
                        style={{ background: '#28a745', flex: 1 }}
                      >
                        ✅ Accept & Verify
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Enter rejection reason:");
                          if (reason) handleVerifyProgress(selectedComplaint._id, false, reason);
                        }}
                        className="btn-primary"
                        style={{ background: '#dc3545', flex: 1 }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>

            )}

            {/* Priority Setting Section - HIDDEN IF SET */}
            {selectedComplaint.priority === 'pending' && (
              <div className="action-card" style={{ border: '2px solid #fd7e14' }}>
                <h3 className="section-title">⚠️ Set Priority Required</h3>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select
                    value={selectedComplaint.priority}
                    onChange={async (e) => {
                      try {
                        const newPriority = e.target.value;
                        if (!newPriority || newPriority === 'pending') return;

                        // Use ConfirmationModal instead of window.confirm
                        setConfirmation({
                          isOpen: true,
                          title: "Set Priority",
                          message: `Set priority to ${newPriority.toUpperCase()}?`,
                          onConfirm: async () => {
                            await complaintAPI.updateStatus(selectedComplaint._id, { priority: newPriority });
                            toast.success(`Priority set to ${newPriority}`);

                            // fast refresh
                            const updated = { ...selectedComplaint, priority: newPriority };
                            setSelectedComplaint(updated);
                            setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
                            closeConfirmation();
                          },
                          onCancel: closeConfirmation,
                          isDangerous: newPriority === 'high'
                        });
                      } catch (err) {
                        toast.error("Failed to update priority");
                      }
                    }}
                    className="filter-select"
                    style={{ flex: 1, maxWidth: '200px' }}
                  >
                    <option value="pending" disabled>Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>

                  {selectedComplaint.priority === 'pending' && (
                    <span style={{ color: '#fd7e14', fontSize: '0.9rem' }}>
                      * You must set a priority before assigning technicians.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Assignment Section - HIDDEN if priority is pending */}
            {selectedComplaint.priority !== 'pending' && (
              <div className="action-section">
                {/* Only show technician selection if complaint has no assigned technicians */}
                {(!selectedComplaint.assignedTechnicians || selectedComplaint.assignedTechnicians.length === 0) && (
                  <div className="action-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Assign to Multiple Technicians</h3>
                    <div className="technician-checkboxes">
                      {technicians.map((tech) => (
                        <label key={tech._id} className="checkbox-label">
                          <input
                            type="checkbox"
                            value={tech._id}
                            checked={selectedTechnicians.includes(tech._id)}
                            onChange={() => handleTechnicianSelection(tech._id)}
                          />
                          {tech.name}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAssignMultiple(selectedComplaint._id)}
                      className="btn-primary"
                      disabled={selectedTechnicians.length === 0}
                    >
                      Assign to Selected ({selectedTechnicians.length})
                    </button>
                  </div>
                )}

                {/* Only show single technician assignment if no technicians assigned yet */}
                {(!selectedComplaint.assignedTechnicians || selectedComplaint.assignedTechnicians.length === 0) && (
                  <div className="action-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Assign to Single Technician</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <select
                        value={assignTechnician}
                        onChange={(e) => setAssignTechnician(e.target.value)}
                        className="filter-select"
                        style={{ flex: 1 }}
                      >
                        <option value="">Select technician</option>
                        {technicians.map((tech) => (
                          <option key={tech._id} value={tech._id}>
                            {tech.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handleAssign(selectedComplaint._id)}
                      className="btn-primary"
                      disabled={!assignTechnician}
                    >
                      Assign
                    </button>
                  </div>
                )}

                {/* Only show status update after a technician is assigned (final assignment) */}
                {selectedComplaint.assignedTo && (
                  <div className="action-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Update Status</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <select
                        onChange={(e) =>
                          handleStatusUpdate(selectedComplaint._id, e.target.value)
                        }
                        className="filter-select"
                        style={{ width: '100%' }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select status</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    );
  }



  const handleShowTechnicians = async () => {
    try {
      const data = await complaintAPI.getTechnicians();
      // Ensure we have an array
      const techs = Array.isArray(data) ? data : (data.technicians || data.data || []);
      setTechnicians(techs);
      setShowTechModal(true);
    } catch (err) {
      toast.error("Failed to load technicians");
      console.error(err);
    }
  };

  /* -------------------- LIST VIEW -------------------- */
  return (
    <div className="dashboard-page">
      <AdminDashboardHeader onTechniciansClick={handleShowTechnicians} />
      <div className="glass-overlay"></div>
      {/* Technician List Modal */}
      {showTechModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '2rem', borderRadius: '12px',
            width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowTechModal(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Registered Technicians</h2>

            <div className="technicians-list-modal">
              {technicians.length === 0 ? (
                <p>No technicians found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {technicians.map(tech => (
                    <div key={tech._id} style={{
                      padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{tech.name}</div>
                        <div style={{ color: '#718096', fontSize: '0.9rem' }}>{tech.email}</div>
                      </div>
                      <span className="badge badge-info">{tech.specialization || 'General'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={closeConfirmation}
        isDangerous={confirmation.isDangerous}
      />
      <div className="dashboard-container">
        <h1 className="page-title">Admin Dashboard</h1>

        {statistics && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '2.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="stat-card">
              <h3 className="stat-number">{statistics.totalComplaints}</h3>
              <p className="stat-title">Total Complaints</p>
            </div>

            <div className="stat-card">
              <h3 className="stat-number">{statistics.pendingComplaints}</h3>
              <p className="stat-title">Pending</p>
            </div>

            <div className="stat-card">
              <h3 className="stat-number">{statistics.inProgressComplaints}</h3>
              <p className="stat-title">In Progress</p>
            </div>

            <div className="stat-card">
              <h3 className="stat-number">{statistics.resolvedComplaints}</h3>
              <p className="stat-title">Resolved</p>
            </div>

            <div className={`stat-card ${statistics.escalatedComplaints > 0 ? 'overdue' : ''}`}>
              <h3 className="stat-number" style={statistics.escalatedComplaints > 0 ? { background: 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
                {statistics.escalatedComplaints || 0}
              </h3>
              <p className="stat-title" style={statistics.escalatedComplaints > 0 ? { color: '#dc3545' } : {}}>Escalated</p>
            </div>
          </div>
        )}

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
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <div className="loading-container">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-container">No complaints found</div>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                onView={handleViewDetails}
                userRole="admin"
                isHighlighted={complaint._id === latestComplaintId && complaint._id !== lastViewedId && complaint.status === 'pending'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
