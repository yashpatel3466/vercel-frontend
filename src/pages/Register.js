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
    <div style={styles.container}>
      <h2>Register</h2>

      <input className="form-input" placeholder="Name"
        value={name} onChange={e => setName(e.target.value)} />

      <input className="form-input" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)} />

      <input type="password" className="form-input" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)} />

      {/* 🔽 ROLE SELECT */}
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


      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button style={styles.button} onClick={handleRegister}>
        Register
      </button>

      <p style={{ marginTop: "15px" }}>
        Already have an account?{" "}
        <Link
  to="/login"
  style={{
    textDecoration: "none",
    fontWeight: "600",
    color: "#5b5be0"
  }}
>
  Login
</Link>

      </p>
    </div>
  );
}

const styles = {
  container: {
    width: "380px",
    margin: "90px auto",
    padding: "40px 32px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    textAlign: "center"
  },
  button: {
    marginTop: "15px",
    padding: "10px 25px",
    background: "#5b5be0",
    color: "white",
    border: "none",
    borderRadius: "6px"
  }
};
