import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      {/* LOGO + CIVICFIX → HOME */}
      <Link to="/" className="header-left">
        <img
          src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
          alt="logo"
          className="logo-img"
        />
        <span className="logo-text">CivicFix</span>
      </Link>

      {/* NAVIGATION */}
      <div className="header-right">
        <Link to="/login" className="header-link">Login</Link>
        <Link to="/register" className="header-link">Register</Link>
        <Link to="/admin/login" className="header-link">Admin</Link>
      </div>
    </header>
  );
}
