// src/pages/Dashboard.jsx
import React from "react";
import "./Dashboard.css"; // Import the specific CSS

const Dashboard = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-desc">
            Monday, Dec 15 • System Status: Online
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Card 1: Total Users */}
        <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-accent"
              style={{ fontSize: "20px" }}
            >
              group
            </span>
            Total Users
          </div>
          <div className="sc-val">2,450</div>
          <div className="sc-sub text-primary">+12% vs last month</div>
        </div>

        {/* Card 2: Pending Complaints */}
        <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-warning"
              style={{ fontSize: "20px" }}
            >
              support_agent
            </span>
            Pending Complaints
          </div>
          <div className="sc-val">15</div>
          <div className="sc-sub">+4 New in last 3 hours</div>
        </div>

        {/* Card 3: Critical Faults */}
        <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-danger"
              style={{ fontSize: "20px" }}
            >
              warning
            </span>
            Critical Faults
          </div>
          <div className="sc-val text-danger">3</div>
          <div className="sc-sub">1 reported recently</div>
        </div>

        {/* Card 4: Total Load */}
        <div className="stat-card">
          <div className="sc-label">
            <span
              className="material-icons text-primary"
              style={{ fontSize: "20px" }}
            >
              bolt
            </span>
            Total Load
          </div>
          <div className="sc-val">45.2 kW</div>
          <div className="sc-sub">Peak today: 58.1 kW</div>
        </div>
      </div>

      {/* Table 1: Recent Activity */}
      <div className="table-container" style={{ marginBottom: "30px" }}>
        <div className="table-header">Recent Activity</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="user-cell">
                  <span
                    className="material-icons text-danger"
                    style={{ fontSize: "22px" }}
                  >
                    error
                  </span>
                  Critical Fault: Unit 402
                </div>
              </td>
              <td>10:42 AM</td>
              <td>
                <span
                  className="text-danger"
                  style={{ fontWeight: 700, fontSize: "12px" }}
                >
                  NEW
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <div className="user-cell">
                  <span
                    className="material-icons text-warning"
                    style={{ fontSize: "22px" }}
                  >
                    monetization_on
                  </span>
                  Budget Exceeded: Unit 305
                </div>
              </td>
              <td>08:15 AM</td>
              <td>
                <span style={{ color: "#888", fontSize: "12px" }}>LOGGED</span>
              </td>
            </tr>
            <tr>
              <td>
                <div className="user-cell">
                  <span
                    className="material-icons text-primary"
                    style={{ fontSize: "22px" }}
                  >
                    login
                  </span>
                  User Login: Maria Cruz
                </div>
              </td>
              <td>08:00 AM</td>
              <td>
                <span style={{ color: "#888", fontSize: "12px" }}>SUCCESS</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 2: Recent Complaints */}
      <div className="table-container">
        <div className="table-header">Recent Complaints</div>
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Issue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  fontFamily: "monospace",
                  color: "#888",
                  fontWeight: 600,
                }}
              >
                #TK-9921
              </td>
              <td style={{ fontWeight: 600, color: "#fff" }}>Hub Offline</td>
              <td>
                <span className="status-pill st-open">OPEN</span>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  fontFamily: "monospace",
                  color: "#888",
                  fontWeight: 600,
                }}
              >
                #TK-9920
              </td>
              <td style={{ fontWeight: 600, color: "#fff" }}>
                Rate Discrepancy
              </td>
              <td>
                <span className="status-pill st-review">IN REVIEW</span>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  fontFamily: "monospace",
                  color: "#888",
                  fontWeight: 600,
                }}
              >
                #TK-9918
              </td>
              <td style={{ fontWeight: 600, color: "#fff" }}>Wifi Update</td>
              <td>
                <span className="status-pill st-solved">RESOLVED</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Dashboard;
