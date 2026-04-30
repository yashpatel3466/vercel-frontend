import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TechnicianDashboardHeader.css";

export default function TechnicianDashboardHeader({ complaints = [] }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!complaints.length) return;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;

    const newNotifications = [];
    let unread = 0;
    const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]");

    complaints.forEach(complaint => {
      const assignment = complaint.assignedTechnicians?.find(
        a => {
          if (!a.technician) return false;
          const techId = a.technician._id || a.technician;
          return techId.toString() === currentUser.id.toString();
        }
      );

      if (assignment) {
        // Assignment Notification
        if (assignment.status === "selected" || assignment.status === "assigned") {
          const notifId = `${complaint._id}-assigned`;
          const isRead = readIds.includes(notifId);
          if (!isRead) unread++;

          newNotifications.push({
            id: notifId,
            type: "assigned",
            message: `Project Assigned: ${complaint.title}`,
            isRead
          });
        }
        // Quotation Rejection Notification
        else if (assignment.status === "rejected") {
          const notifId = `${complaint._id}-rejected`;
          const isRead = readIds.includes(notifId);
          if (!isRead) unread++;

          newNotifications.push({
            id: notifId,
            type: "rejected",
            message: `Quotation Rejected: ${complaint.title}`,
            isRead
          });
        }

        // Progress/Resolution Rejection Notification
        if (complaint.progressUpdate?.status === "rejected") {
          const notifId = `${complaint._id}-progress-rejected`;
          const isRead = readIds.includes(notifId);

          if (!isRead) unread++;
          newNotifications.push({
            id: notifId,
            type: "rejected",
            message: `Update Rejected: ${complaint.title}`,
            isRead
          });
        }
      }
    });

    setNotifications(newNotifications);
    setUnreadCount(unread);
  }, [complaints]);

  const handleNotificationClick = () => {
    if (!showDropdown) {
      // Mark all as read when opening
      const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]");
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);

      if (unreadIds.length > 0) {
        const updatedReadIds = [...new Set([...readIds, ...unreadIds])];
        localStorage.setItem("readNotifications", JSON.stringify(updatedReadIds));
        setUnreadCount(0);

        // Update local state to reflect read status
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    }
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="technician-dashboard-header">
      <div
        className="technician-header-left"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
          alt="logo"
          className="technician-logo-img"
        />
        <span className="technician-logo-text">CivicFix</span>
      </div>

      <nav className="technician-header-nav">
        {/* Notification Bell */}
        <div className="notification-container" ref={dropdownRef}>
          <button className="notification-btn" onClick={handleNotificationClick}>
            <span role="img" aria-label="notifications" style={{ fontSize: '1.2rem' }}>🔔</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">Notifications</div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.type}`}>
                      <div className="notif-icon">
                        {notif.type === 'assigned' ? '✅' : '❌'}
                      </div>
                      <div className="notif-content">
                        {notif.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="technician-header-link" onClick={() => navigate("/technician/profile")}>
          Profile
        </button>

        <button className="technician-header-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}
