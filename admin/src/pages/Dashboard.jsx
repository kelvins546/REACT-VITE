// src/pages/Dashboard.jsx
import React from "react";
import "./Dashboard.css"; 

const Dashboard = () => {
  return (
    <>
   
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-desc">
            Monday, Dec 15 • System Status: Online
          </div>
        </div>
      </div>

     
      <div className="stats-grid">
       
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
