import React from 'react';
import { useNavigate } from "react-router-dom";
import "./AdminDashboardHeader.css";

export default function AdminDashboardHeader({ onTechniciansClick }) {
    const navigate = useNavigate();

    return (
        <header className="admin-dashboard-header">
            <div
                className="admin-header-left"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                    alt="logo"
                    className="admin-logo-img"
                />
                <span className="admin-logo-text">CivicFix</span>
            </div>

            <nav className="admin-header-nav">
                <button className="admin-header-link" onClick={onTechniciansClick}>
                    Technicians
                </button>
            </nav>
        </header>
    );
}
