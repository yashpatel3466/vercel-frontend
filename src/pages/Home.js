import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to CivicFix</h1>
        <p className="hero-subtitle">
          Report municipal issues quickly and transparently
        </p>

        <div className="hero-buttons">
          <button
            className="btn btn-primary btn-hero"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="btn btn-secondary btn-hero"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2>Why Choose CivicFix?</h2>

        <div className="features-grid">
          <div className="feature-card">
            📍 Location-Based Complaints
          </div>

          <div className="feature-card">
            👥 Community Verification
          </div>

          <div className="feature-card">
            ⏱ SLA-Based Auto Escalation
          </div>

          <div className="feature-card">
            📊 Department Performance
          </div>

          <div className="feature-card">
            🗺 Real-Time GIS Complaint Heatmap
          </div>

          <div className="feature-card">
            🔐 Transparent Tracking
          </div>
        </div>
      </section>
    </div>
  );
}
