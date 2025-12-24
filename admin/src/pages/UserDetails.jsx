import React from "react";
import { Link } from "react-router-dom";

const UserDetails = () => {
  return (
    <div className="main-pane">
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#888",
          cursor: "pointer",
        }}
      >
        <span className="material-icons" style={{ fontSize: "16px" }}>
          arrow_back
        </span>
        <Link to="/users" style={{ color: "inherit", textDecoration: "none" }}>
          Back to User Management
        </Link>{" "}
        / User Details
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: "30px",
        }}
      >
        <div className="card">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              paddingBottom: "25px",
              borderBottom: "1px solid #333",
              marginBottom: "25px",
            }}
          >
            <div className="avatar-lg">NA</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
              Natasha Alonzo
            </div>
            <div style={{ color: "#888", marginBottom: "15px" }}>
              Unit 402 • Resident
            </div>
            <span className="status-pill st-active">Active Account</span>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#888" }}>Email</span>
              <span style={{ color: "#fff" }}>natasha@example.com</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#888" }}>Phone</span>
              <span style={{ color: "#fff" }}>+63 917 123 4567</span>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <button
              className="btn-std btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Send Message
            </button>
            <button
              className="btn-std"
              style={{
                width: "100%",
                justifyContent: "center",
                background: "rgba(255,68,68,0.1)",
                color: "var(--danger)",
                border: "1px solid rgba(255,68,68,0.3)",
              }}
            >
              Suspend User
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              Recent Activity
            </div>
            <table style={{ fontSize: "14px" }}>
              <tbody>
                <tr>
                  <td style={{ color: "var(--danger)" }}>
                    <span
                      className="material-icons"
                      style={{ verticalAlign: "middle", marginRight: "8px" }}
                    >
                      error
                    </span>
                    Critical Fault
                  </td>
                  <td style={{ textAlign: "right", color: "#888" }}>
                    Today, 10:42 AM
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "var(--primary)" }}>
                    <span
                      className="material-icons"
                      style={{ verticalAlign: "middle", marginRight: "8px" }}
                    >
                      login
                    </span>
                    User Logged In
                  </td>
                  <td style={{ textAlign: "right", color: "#888" }}>
                    Yesterday
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDetails;
