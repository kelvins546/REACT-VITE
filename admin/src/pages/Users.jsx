// src/pages/Users.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Users.css";

const Users = () => {
  // State to handle Modal visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">User Management</div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span
            className="material-icons"
            style={{ color: "#666", fontSize: "20px" }}
          >
            search
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
          />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {/* UPDATED: Link to Archived Page */}
          <Link
            to="/users/archived"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              inventory_2
            </span>
            Archived
          </Link>

          <button className="btn btn-primary">
            <span className="material-icons" style={{ fontSize: "18px" }}>
              file_download
            </span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Main User Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>
                <input
                  type="checkbox"
                  style={{
                    accentColor: "var(--primary)",
                    width: "18px",
                    height: "18px",
                  }}
                />
              </th>
              <th>User Profile</th>
              <th>Unit / Location</th>
              <th>Active Hubs</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* User Row 1 (Natasha) */}
            <tr>
              <td>
                <input
                  type="checkbox"
                  style={{
                    accentColor: "var(--primary)",
                    width: "18px",
                    height: "18px",
                  }}
                />
              </td>
              <td>
                <div className="user-cell">
                  <div
                    className="u-avatar"
                    style={{
                      background: "linear-gradient(135deg, #0055ff, #00ff99)",
                      color: "#000",
                    }}
                  >
                    NA
                  </div>
                  <div style={{ fontWeight: 600, color: "#fff" }}>
                    Natasha Alonzo
                    <br />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      natasha@email.com
                    </span>
                  </div>
                </div>
              </td>
              <td>Unit 402, Congress Ville</td>
              <td>2 Active</td>
              <td>
                <span className="status-dot st-active"></span> Active
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className="icon-btn"
                    title="View Details"
                    onClick={() => setShowModal(true)}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      visibility
                    </span>
                  </button>
                  <button className="icon-btn" title="Archive User">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      archive
                    </span>
                  </button>
                </div>
              </td>
            </tr>

            {/* User Row 2 (John) */}
            <tr>
              <td>
                <input
                  type="checkbox"
                  style={{
                    accentColor: "var(--primary)",
                    width: "18px",
                    height: "18px",
                  }}
                />
              </td>
              <td>
                <div className="user-cell">
                  <div
                    className="u-avatar"
                    style={{
                      background: "#2a2a2a",
                      borderColor: "#444",
                      color: "#fff",
                    }}
                  >
                    JD
                  </div>
                  <div style={{ fontWeight: 600, color: "#fff" }}>
                    John Doe
                    <br />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      john.doe@email.com
                    </span>
                  </div>
                </div>
              </td>
              <td>Unit 305, Tower A</td>
              <td>1 Active</td>
              <td>
                <span className="status-dot st-active"></span> Active
              </td>
              <td>
                <div className="action-cell">
                  <button className="icon-btn" title="View Details">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      visibility
                    </span>
                  </button>
                  <button className="icon-btn" title="Archive User">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      archive
                    </span>
                  </button>
                </div>
              </td>
            </tr>

            {/* User Row 3 (Maria) */}
            <tr>
              <td>
                <input
                  type="checkbox"
                  style={{
                    accentColor: "var(--primary)",
                    width: "18px",
                    height: "18px",
                  }}
                />
              </td>
              <td>
                <div className="user-cell">
                  <div
                    className="u-avatar"
                    style={{
                      background: "#333",
                      color: "#888",
                      borderColor: "#444",
                    }}
                  >
                    MC
                  </div>
                  <div style={{ fontWeight: 600, color: "#fff" }}>
                    Maria Cruz
                    <br />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      maria.c@yahoo.com
                    </span>
                  </div>
                </div>
              </td>
              <td>Unit 101, Ground Floor</td>
              <td>0 Devices</td>
              <td>
                <span className="status-dot st-inactive"></span> Inactive
              </td>
              <td>
                <div className="action-cell">
                  <button className="icon-btn" title="View Details">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      visibility
                    </span>
                  </button>
                  <button className="icon-btn" title="Archive User">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      archive
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pagination">
          <div style={{ fontSize: "14px", color: "#666" }}>
            Showing 1-3 of 24
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="page-btn">{"<"}</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">{">"}</button>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title">
                <span
                  className="material-icons"
                  style={{ color: "var(--primary)" }}
                >
                  account_circle
                </span>
                User Details
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Left Column: Profile Card */}
              <div className="profile-card">
                <div className="profile-header">
                  <div className="avatar-lg">NA</div>
                  <div className="user-name">Natasha Alonzo</div>
                  <div className="user-meta">Unit 402 • Resident</div>
                  <span className="status-badge st-active-badge">
                    Active Account
                  </span>
                </div>

                <div className="info-group">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-val">natasha@example.com</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-val">+63 917 123 4567</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Joined</span>
                    <span className="info-val">Oct 12, 2024</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Last Login</span>
                    <span className="info-val">2 hours ago</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">User ID</span>
                    <span
                      className="info-val"
                      style={{ fontFamily: "monospace", color: "#888" }}
                    >
                      GW-8821-USR
                    </span>
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn-full">
                    <span className="material-icons">lock_reset</span> Send
                    Password Reset
                  </button>
                  <button className="btn-full">
                    <span className="material-icons">mail</span> Send Message
                  </button>
                </div>
              </div>

              {/* Right Column: Stats & Hardware */}
              <div>
                {/* Stats Grid */}
                <div className="modal-stats-grid">
                  <div className="m-stat-card">
                    <div className="m-stat-label">Total Spend (Dec)</div>
                    <div className="m-stat-val">₱ 1,450.75</div>
                    <div className="m-stat-sub">52% of Budget Used</div>
                  </div>
                  <div className="m-stat-card">
                    <div className="m-stat-label">Active Hubs</div>
                    <div className="m-stat-val">2</div>
                    <div className="m-stat-sub" style={{ color: "#888" }}>
                      Living Room, Bedroom
                    </div>
                  </div>
                  <div className="m-stat-card">
                    <div className="m-stat-label">Safety Alerts</div>
                    <div
                      className="m-stat-val"
                      style={{ color: "var(--danger)" }}
                    >
                      3
                    </div>
                    <div
                      className="m-stat-sub"
                      style={{ color: "var(--danger)" }}
                    >
                      Critical Faults this month
                    </div>
                  </div>
                </div>

                {/* Hardware List */}
                <div className="detail-card">
                  <div className="section-title">
                    <span
                      className="material-icons"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      router
                    </span>
                    Registered Hardware
                  </div>

                  <div className="hub-item">
                    <div className="hub-left">
                      <div className="hub-icon">
                        <span className="material-icons">router</span>
                      </div>
                      <div className="hub-info">
                        <h4>Living Room Hub</h4>
                        <p>Serial: GW-ESP32-PRO-X1 • IP: 192.168.1.15</p>
                      </div>
                    </div>
                    <span className="hub-status">Online</span>
                  </div>

                  <div className="hub-item">
                    <div className="hub-left">
                      <div
                        className="hub-icon"
                        style={{ background: "#2a2a2a", color: "#666" }}
                      >
                        <span className="material-icons">wifi_off</span>
                      </div>
                      <div className="hub-info">
                        <h4>Bedroom Hub</h4>
                        <p>Serial: GW-ESP32-LITE-B2 • Last seen 2h ago</p>
                      </div>
                    </div>
                    <span className="hub-status" style={{ color: "#666" }}>
                      Offline
                    </span>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="detail-card">
                  <div className="section-title">
                    <span
                      className="material-icons"
                      style={{ color: "var(--warning)" }}
                    >
                      history
                    </span>
                    Recent Activity Log
                  </div>
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Activity Description</th>
                        <th>Category</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="material-icons act-icon text-crit">
                            error
                          </span>
                          Critical Fault: Outlet 3 Short Circuit
                        </td>
                        <td>Safety</td>
                        <td>Today, 10:42 AM</td>
                      </tr>
                      <tr>
                        <td>
                          <span className="material-icons act-icon text-warn">
                            monetization_on
                          </span>
                          Budget Limit Exceeded (Smart TV)
                        </td>
                        <td>Automation</td>
                        <td>Yesterday, 8:15 PM</td>
                      </tr>
                      <tr>
                        <td>
                          <span
                            className="material-icons act-icon"
                            style={{ color: "var(--primary)" }}
                          >
                            login
                          </span>
                          User Logged In (Web Portal)
                        </td>
                        <td>Access</td>
                        <td>Yesterday, 8:00 AM</td>
                      </tr>
                      <tr>
                        <td>
                          <span
                            className="material-icons act-icon"
                            style={{ color: "var(--accent-blue)" }}
                          >
                            settings
                          </span>
                          Updated Electricity Rate (₱12.50)
                        </td>
                        <td>Configuration</td>
                        <td>Dec 12, 4:30 PM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
