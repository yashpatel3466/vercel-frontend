import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role: "admin"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Invalid credentials");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/admin/dashboard");
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        className="form-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="form-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary btn-login" onClick={handleLogin}>
        Login
      </button>

      <div className="role-text">
        <Link to="/login" className="role-link">User Login</Link> |{" "}
        <Link to="/technician/login" className="role-link">Technician Login</Link>
      </div>
    </div>
  );
}
const styles = {
  container: {
    width: "380px",
    margin: "100px auto",
    padding: "40px 32px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 12px 35px rgba(0,0,0,0.15)",
    textAlign: "center"
  },

  button: {
    marginTop: "20px",
    padding: "12px 30px",
    background: "#5b5be0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600"
  },

  text: {
    marginTop: "18px",
    fontSize: "14px"
  },

  roleText: {
    marginTop: "12px",
    fontSize: "14px"
  },

  link: {
    textDecoration: "none",
    color: "#5b5be0",
    fontWeight: "600"
  },

  roleLink: {
    textDecoration: "none",
    color: "#5b5be0",
    fontWeight: "500"
  }
};
