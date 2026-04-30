import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,10}$/;


export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

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



    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: "user"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/user/dashboard");
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Login</h2>

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

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <button style={styles.button} onClick={handleLogin}>
        Login
      </button>

      <p style={styles.text}>
        Don’t have an account?{" "}
        <Link to="/register" style={styles.link}>
          Register
        </Link>
      </p>

      <p style={styles.roleText}>
        <Link to="/admin/login" style={styles.roleLink}>
          Admin Login
        </Link>{" "}
        |{" "}
        <Link to="/technician/login" style={styles.roleLink}>
          Technician Login
        </Link>
      </p>
    </div>
  );
}

/* ✅ STYLES (FIXES YOUR ERROR) */
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
