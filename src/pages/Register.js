import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,10}$/;


export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!emailRegex.test(email)) {
  setError("Please enter a valid email address");
  return;
}

if (!passwordRegex.test(password)) {
  setError(
    "Password must be 4–10 characters and include uppercase, lowercase, number & special character"
  );
  return;
}

if (!role) {
  setError("Please select a role");
  return;
}


    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setSuccess("Registration successful!");

    setTimeout(() => {
      if (role === "user") {
        navigate("/login");
      } else {
        navigate("/technician/login");
      }
    }, 1200);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      <input className="form-input" placeholder="Name"
        value={name} onChange={e => setName(e.target.value)} />

      <input className="form-input" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)} />

      <input type="password" className="form-input" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)} />

      {/* ROLE SELECT */}
      <select
        className="form-input"
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="" disabled>
          Select Role
        </option>
        <option value="user">User</option>
        <option value="technician">Technician</option>
      </select>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <button className="btn btn-primary btn-login" onClick={handleRegister}>
        Register
      </button>

      <p className="login-text">
        Already have an account?{" "}
        <Link to="/login" className="login-link">Login</Link>
      </p>

      <p className="role-text">
        <Link to="/admin/login" className="role-link">Admin Login</Link> |{" "}
        <Link to="/technician/login" className="role-link">Technician Login</Link>
      </p>
    </div>
  );
}
