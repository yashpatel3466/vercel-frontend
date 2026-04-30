import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";
import "./UserDashboard.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setUser(data.user);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load profile");
      console.error("Error loading profile:", err);
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="glass-overlay"></div>
        {renderHeader()}
        <div className="dashboard-container">
          <div className="state-container">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="glass-overlay"></div>
      {renderHeader()}
      <div className="dashboard-container">
        <h2 className="user-page-title">My Profile</h2>

        {error && <div className="error-container">{error}</div>}

        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>

          <div style={styles.profileInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{user?.name || "N/A"}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{user?.email || "N/A"}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Role:</span>
              <span style={styles.value}>{user?.role || "User"}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>User ID:</span>
              <span style={styles.value}>{user?.id || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  profileCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
    transition: "all 0.3s ease",
    maxWidth: "800px",
    margin: "0 auto",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
  },
  avatarText: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#fff"
  },
  profileInfo: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
    background: "rgba(248, 250, 252, 0.8)",
    borderRadius: "8px",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#64748b",
  },
  value: {
    fontSize: "1rem",
    color: "#334155",
    fontWeight: "500",
  }
};

