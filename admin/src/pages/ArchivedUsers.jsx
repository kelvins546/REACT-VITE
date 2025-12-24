// src/pages/ArchivedUsers.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./ArchivedUsers.css";

const ArchivedUsers = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Archived Users</div>
          <div className="page-desc">
            Manage deactivated or removed accounts.
          </div>
        </div>
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
            placeholder="Search archived users..."
          />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Link back to Active Users */}
          <Link
            to="/users"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              arrow_back
            </span>
            Back to Active
          </Link>
          <button className="btn btn-primary">
            <span className="material-icons" style={{ fontSize: "18px" }}>
              delete_sweep
            </span>
            Clear All
          </button>
        </div>
      </div>

      {/* Table Container */}
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
              <th>Archived Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
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
                      color: "#888",
                    }}
                  >
                    MP
                  </div>
                  <div style={{ fontWeight: 600, color: "#ccc" }}>
                    Marco Polo
                    <br />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      marco.p@email.com
                    </span>
                  </div>
                </div>
              </td>
              <td style={{ color: "#888" }}>Unit 105, Tower B</td>
              <td style={{ color: "#888" }}>Oct 10, 2025</td>
              <td>
                <span className="status-dot st-archived"></span>
                <span style={{ color: "#ccc" }}>Archived</span>
              </td>
              <td>
                <div className="action-cell">
                  <button className="icon-btn btn-restore" title="Restore User">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      restore_from_trash
                    </span>
                  </button>
                  <button
                    className="icon-btn btn-delete"
                    title="Delete Permanently"
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      delete_forever
                    </span>
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 2 */}
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
                      color: "#888",
                    }}
                  >
                    SL
                  </div>
                  <div style={{ fontWeight: 600, color: "#ccc" }}>
                    Sarah Lee
                    <br />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      s.lee@yahoo.com
                    </span>
                  </div>
                </div>
              </td>
              <td style={{ color: "#888" }}>Unit 502, North Wing</td>
              <td style={{ color: "#888" }}>Sep 22, 2025</td>
              <td>
                <span className="status-dot st-archived"></span>
                <span style={{ color: "#ccc" }}>Archived</span>
              </td>
              <td>
                <div className="action-cell">
                  <button className="icon-btn btn-restore" title="Restore User">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      restore_from_trash
                    </span>
                  </button>
                  <button
                    className="icon-btn btn-delete"
                    title="Delete Permanently"
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      delete_forever
                    </span>
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 3 */}
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
                      color: "#888",
                    }}
                  >
                    KD
                  </div>
                  <div style={{ fontWeight: 600, color: "#ccc" }}>
                    Kevin Durant
                    <br />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      kd.35@nba.com
                    </span>
                  </div>
                </div>
              </td>
              <td style={{ color: "#888" }}>Unit 909, Penthouse</td>
              <td style={{ color: "#888" }}>Aug 05, 2025</td>
              <td>
                <span className="status-dot st-archived"></span>
                <span style={{ color: "#ccc" }}>Archived</span>
              </td>
              <td>
                <div className="action-cell">
                  <button className="icon-btn btn-restore" title="Restore User">
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      restore_from_trash
                    </span>
                  </button>
                  <button
                    className="icon-btn btn-delete"
                    title="Delete Permanently"
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      delete_forever
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* UPDATED PAGINATION */}
        <div className="a-pagination">
          <div style={{ fontSize: "14px", color: "#666" }}>
            Showing 1-3 of 3
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="a-page-btn active">1</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArchivedUsers;
