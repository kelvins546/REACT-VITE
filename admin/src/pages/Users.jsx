import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Users.css";

const Users = () => {
  const [showModal, setShowModal] = useState(false);

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");

  const [usersList] = useState([
    {
      id: 1,
      initials: "NA",
      name: "Natasha Alonzo",
      email: "natasha@email.com",
      location: "Unit 402, Congress Ville",
      hubs: "2 Active",
      status: "Active",
      color: "linear-gradient(135deg, #0055ff, #00ff99)",
      textColor: "#000",
    },
    {
      id: 2,
      initials: "JD",
      name: "John Doe",
      email: "john.doe@email.com",
      location: "Unit 305, Tower A",
      hubs: "1 Active",
      status: "Active",
      color: "#2a2a2a",
      textColor: "#fff",
      borderColor: "#444",
    },
    {
      id: 3,
      initials: "MC",
      name: "Maria Cruz",
      email: "maria.c@yahoo.com",
      location: "Unit 101, Ground Floor",
      hubs: "0 Devices",
      status: "Inactive",
      color: "#333",
      textColor: "#888",
      borderColor: "#444",
    },
  ]);

  const handleArchiveClick = (user) => {
    setSelectedUser(user);
    setArchiveReason("");
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = () => {
    console.log(`Archiving ${selectedUser?.name}. Reason: ${archiveReason}`);

    setShowArchiveModal(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">User Management</div>
      </div>

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
            {usersList.map((user) => (
              <tr key={user.id}>
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
                        background: user.color,
                        color: user.textColor,
                        border: user.borderColor
                          ? `1px solid ${user.borderColor}`
                          : "none",
                      }}
                    >
                      {user.initials}
                    </div>
                    <div style={{ fontWeight: 600, color: "#fff" }}>
                      {user.name}
                      <br />
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          fontWeight: 400,
                        }}
                      >
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{user.location}</td>
                <td>{user.hubs}</td>
                <td>
                  <span
                    className="status-dot"
                    style={{
                      background:
                        user.status === "Active" ? "var(--primary)" : "#666",
                      boxShadow:
                        user.status === "Active"
                          ? "0 0 8px rgba(0, 255, 153, 0.4)"
                          : "none",
                    }}
                  ></span>{" "}
                  {user.status}
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

                    <button
                      className="icon-btn"
                      title="Archive User"
                      onClick={() => handleArchiveClick(user)}
                    >
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
            ))}
          </tbody>
        </table>

        <div className="u-pagination">
          <div style={{ fontSize: "14px", color: "#666" }}>
            Showing 1-3 of 24
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="u-page-btn">{"<"}</button>
            <button className="u-page-btn active">1</button>
            <button className="u-page-btn">2</button>
            <button className="u-page-btn">{">"}</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="u-modal-overlay">
          <div className="u-modal-container">
            <div className="u-modal-header">
              <div className="u-modal-title">
                <span
                  className="material-icons"
                  style={{ color: "var(--primary)" }}
                >
                  account_circle
                </span>
                User Details
              </div>
              <button
                className="u-close-btn"
                onClick={() => setShowModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="u-modal-body">
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

              <div>
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

      {showArchiveModal && selectedUser && (
        <div className="u-modal-overlay">
          <div className="u-modal-container archive-mode">
            <div className="u-modal-header" style={{ borderBottom: "none" }}>
              <div className="u-modal-title" style={{ color: "var(--danger)" }}>
                <span className="material-icons">warning</span>
                Archive User
              </div>
              <button
                className="u-close-btn"
                onClick={() => setShowArchiveModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="u-archive-body">
              <p
                style={{
                  color: "#ccc",
                  marginBottom: "25px",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to archive{" "}
                <strong>{selectedUser.name}</strong>? This action will restrict
                their access to the platform immediately.
              </p>

              <div className="u-form-group">
                <label className="u-form-label">Reason for Archiving</label>
                <select className="u-form-select">
                  <option>Non-payment of Dues</option>
                  <option>Violation of Terms</option>
                  <option>Moved Out / Contract Ended</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="u-form-group">
                <label className="u-form-label">
                  Additional Remarks (Optional)
                </label>
                <textarea
                  className="u-form-textarea"
                  placeholder="Enter details here..."
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                ></textarea>
              </div>

              <div className="u-modal-actions">
                <button
                  className="u-btn-cancel"
                  onClick={() => setShowArchiveModal(false)}
                >
                  Cancel
                </button>
                <button className="u-btn-danger" onClick={handleConfirmArchive}>
                  <span className="material-icons" style={{ fontSize: "18px" }}>
                    archive
                  </span>
                  Confirm Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
