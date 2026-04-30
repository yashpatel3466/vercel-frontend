import "./ComplaintCard.css";

export default function ComplaintCard({ complaint, onView, userRole, isHighlighted, customStatus }) {
  const getStatusClass = (status) => {
    return `badge badge-${status}`;
  };

  const getPriorityClass = (priority) => {
    return `badge badge-${priority}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Determine which status to display
  const displayStatus = customStatus || complaint.status;

  return (
    <div
      className={`complaint-card ${isHighlighted ? 'highlight-card' : ''}`}
      onClick={onView}
      style={complaint.status === 'escalated' ? { border: '2px solid #dc3545', background: '#fff5f5' } : {}}
    >
      <div className="card-header">
        <h3 className="card-title">
          {complaint.title}
          {complaint.status === 'escalated' && <span style={{ marginLeft: '10px', fontSize: '0.8em' }}>⚠️</span>}
        </h3>
        <div className="card-badges">
          {isHighlighted && (
            <span className="badge badge-new">NEW</span>
          )}
          <span className={getStatusClass(displayStatus)}>
            {displayStatus.replace("_", " ")}
          </span>
          {complaint.priority !== 'pending' && (
            <span className={getPriorityClass(complaint.priority)}>
              {complaint.priority}
            </span>
          )}
        </div>
      </div>

      <p className="card-description">
        {complaint.description.length > 150
          ? `${complaint.description.substring(0, 150)}...`
          : complaint.description}
      </p>

      <div className="card-meta">
        <div className="meta-item">
          <strong>Category:</strong> {complaint.category}
        </div>
        <div className="meta-item">
          <strong>Location:</strong> {complaint.location?.address || 'No address provided'}
        </div>
        {complaint.reportedBy && (
          <div className="meta-item">
            <strong>Reported by:</strong> {complaint.reportedBy.name}
          </div>
        )}
        {complaint.assignedTo && (
          <div className="meta-item">
            <strong>Assigned to:</strong> {complaint.assignedTo.name}
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-date">
          Reported: {formatDate(complaint.createdAt)}
        </span>
        {complaint.slaDeadline && (
          <span className="card-date">
            SLA: {formatDate(complaint.slaDeadline)}
          </span>
        )}
        <div className="card-actions">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(complaint);
              }}
              className="btn-view"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

