import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import TechnicianLogin from "./pages/TechnicianLogin";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import UserProfile from "./pages/UserProfile";
import TechnicianProfile from "./pages/TechnicianProfile";
import ReportIssue from "./pages/ReportIssue";
import Scoreboard from "./pages/Scoreboard";

/* 🔹 Handles page animation */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/technician/login" element={<TechnicianLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/report" element={<ReportIssue />} />
        <Route path="/user/scoreboard" element={<Scoreboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/technician/profile" element={<TechnicianProfile />} />
      </Routes>
    </div>
  );
}

/* 🔹 Layout wrapper to conditionally show Header/Footer */
function AppLayout() {
  const location = useLocation();

  // Hide Header and Footer on dashboard pages
  const isDashboardPage = location.pathname.startsWith("/user/") ||
    location.pathname.startsWith("/admin/dashboard") ||
    location.pathname.startsWith("/technician/dashboard") ||
    location.pathname.startsWith("/technician/profile");

  return (
    <div style={layout.container}>
      {!isDashboardPage && <Header />}

      <main style={layout.content}>
        <AnimatedRoutes />
      </main>

      {!isDashboardPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

/* ✅ FLEX LAYOUT (STICKY FOOTER FIX) */
const layout = {
  container: {
    minHeight: "100vh",      // full screen height
    display: "flex",
    flexDirection: "column"
  },
  content: {
    flex: 1                 // pushes footer to bottom
  }
};
