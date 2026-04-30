import { useNavigate } from "react-router-dom";
import "./UserDashboardHeader.css";

export default function UserDashboardHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="user-dashboard-header">
      <div className="user-header-left">
        <img
          src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
          alt="logo"
          className="user-logo-img"
        />
        <span className="user-logo-text">CivicFix</span>
      </div>

      <nav className="user-header-nav">
        <button className="user-header-link" onClick={() => navigate("/user/dashboard")}>
          My Complaints
        </button>

        <button className="user-header-link" onClick={() => navigate("/user/scoreboard")}>
          Scoreboard
        </button>

        <button className="user-header-link" onClick={() => navigate("/user/profile")}>
          Profile
        </button>

        <button className="user-header-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}
