import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO */}
      <section style={styles.hero}>
        <h1 className="hero-title">Welcome to CivicFix</h1>
        <p className="hero-subtitle">
          Report municipal issues quickly and transparently
        </p>

        <div style={{ marginTop: "25px" }}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        <h2>Why Choose CivicFix?</h2>

        <div style={styles.grid}>
          <div className="feature-card" style={styles.card}>
            📍 Location-Based Complaints
          </div>

          <div className="feature-card" style={styles.card}>
            👥 Community Verification
          </div>

          <div className="feature-card" style={styles.card}>
            ⏱ SLA-Based Auto Escalation
          </div>

          <div className="feature-card" style={styles.card}>
            📊 Department Performance
          </div>

          <div className="feature-card" style={styles.card}>
            🗺 Real-Time GIS Complaint Heatmap
          </div>

          <div className="feature-card" style={styles.card}>
            🔐 Transparent Tracking
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg,#5b5be0,#7a6ee6)",
    color: "white",
    textAlign: "center",
    padding: "90px 20px"
  },

  primaryBtn: {
    padding: "12px 30px",
    marginRight: "15px",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },

  secondaryBtn: {
    padding: "12px 30px",
    borderRadius: "30px",
    border: "2px solid white",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },

  features: {
    padding: "60px 40px",
    textAlign: "center"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "30px",
    marginTop: "40px"
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    fontWeight: "600",
    fontSize: "17px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    cursor: "pointer"
    // ❌ NO transform or animation here
  }
};
