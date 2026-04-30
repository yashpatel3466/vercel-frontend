import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { complaintAPI } from "../utils/api";
import "./UserDashboard.css";

export default function Scoreboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    verifiedComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await complaintAPI.getAll();
      const complaints = data.complaints || [];

      setStats({
        totalComplaints: complaints.length,
        resolvedComplaints: complaints.filter(c => c.status === "resolved").length,
        pendingComplaints: complaints.filter(c => c.status === "pending").length,
        verifiedComplaints: complaints.filter(c => c.verificationCount > 0).length
      });
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Header ---
  const renderHeader = () => (
    <div className="dashboard-header">
      <div className="logo-section">
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

  return (
    <div className="dashboard-page">
      <div className="glass-overlay"></div>
      {renderHeader()}
      <div className="dashboard-container">
        <h2 className="user-page-title">Scoreboard</h2>

        {error && <div className="error-container">{error}</div>}

        {loading ? (
          <div className="state-container">Loading statistics...</div>
        ) : (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalComplaints}</div>
              <div style={styles.statLabel}>Total Complaints</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.resolvedComplaints}</div>
              <div style={styles.statLabel}>Resolved</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.pendingComplaints}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.verifiedComplaints}</div>
              <div style={styles.statLabel}>Verified</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  statNumber: {
    fontSize: "3rem",
    fontWeight: "700",
    color: "#667eea",
    marginBottom: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  statLabel: {
    fontSize: "1.125rem",
    color: "#64748b",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  }
};

