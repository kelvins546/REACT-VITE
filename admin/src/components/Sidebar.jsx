// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Brand / Logo */}
      <div className="brand">
        {/* Ensure this image is in your public folder */}
        <img src="/Untitled design (1).png" className="brand-logo" alt="Logo" />
        <span className="brand-text">GRIDWATCH</span>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column" }}>
        {/* Dashboard - "end" prop ensures it only lights up on exact match */}
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

      {/* User Profile (Bottom) */}
      <div className="user-nav">
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
