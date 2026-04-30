import { useState, useEffect } from "react";
import TechnicianDashboardHeader from "../components/TechnicianDashboardHeader";
import { authAPI, complaintAPI } from "../utils/api";

export default function TechnicianProfile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ assigned: 0, resolved: 0, quotations: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfileAndStats();
  }, []);

  const loadProfileAndStats = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        authAPI.getProfile(),
        complaintAPI.getTechnicianStats()
      ]);

      setUser(profileData.user);
      setStats(statsData);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load profile");
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <TechnicianDashboardHeader />
        <div style={styles.container}>
          <div style={styles.loading}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TechnicianDashboardHeader />
      <div style={styles.container}>
        <h2 style={styles.title}>My Profile</h2>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "T"}
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
              <span style={styles.role}>{user?.role || "N/A"}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Member Since:</span>
              <span style={styles.value}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <h3 style={styles.statsTitle}>Technician Statistics</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.assigned}</div>
              <div style={styles.statLabel}>Complaints Assigned</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.resolved}</div>
              <div style={styles.statLabel}>Complaints Resolved</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.quotations}</div>
              <div style={styles.statLabel}>Quotations Sent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px"
  },
  title: {
    marginBottom: "30px",
    color: "#333",
    textAlign: "center"
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "16px",
    color: "#666"
  },
  error: {
    background: "#fee",
    color: "#c33",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    textAlign: "center"
  },
  profileCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "30px"
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "#5b5be0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  avatarText: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#fff"
  },
  profileInfo: {
    flex: 1
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eee"
  },
  label: {
    fontWeight: "600",
    color: "#666",
    fontSize: "14px"
  },
  value: {
    fontWeight: "500",
    color: "#333",
    fontSize: "16px"
  },
  role: {
    fontWeight: "600",
    color: "#5b5be0",
    fontSize: "16px",
    textTransform: "uppercase"
  },
  statsCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  statsTitle: {
    marginBottom: "20px",
    color: "#333",
    textAlign: "center"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px"
  },
  statItem: {
    textAlign: "center",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px"
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#5b5be0",
    marginBottom: "8px"
  },
  statLabel: {
    fontSize: "14px",
    color: "#666"
  }
};
