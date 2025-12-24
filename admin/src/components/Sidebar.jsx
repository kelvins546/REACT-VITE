// src/components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css"; // <--- Import the new CSS file here

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session if needed
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="brand">
        <img src="/Untitled design (1).png" className="brand-logo" alt="Logo" />
        <span className="brand-text">GRIDWATCH</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column" }}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <span className="material-icons">dashboard</span> Overview
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <span className="material-icons">people</span> Users
        </NavLink>

        <NavLink
          to="/rates"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <span className="material-icons">paid</span> Utility Rates
        </NavLink>

        <NavLink
          to="/complaints"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <span className="material-icons">report_problem</span> Complaints
        </NavLink>
      </nav>

      <div className="user-nav" onClick={handleLogout} title="Log Out">
        <div className="user-avatar">AD</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
            Admin User
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            System Administrator
          </div>
        </div>
        <span
          className="material-icons"
          style={{ color: "#666", fontSize: "20px" }}
        >
          logout
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
