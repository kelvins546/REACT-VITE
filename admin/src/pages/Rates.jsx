// src/pages/Rates.jsx
import React, { useState } from "react";
import "./Rates.css";

const Rates = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Utility Rates</div>
          <div style={{ color: "#888", fontSize: "14px", marginTop: "6px" }}>
            Configure pricing models.
          </div>
        </div>
        <button className="btn btn-secondary" style={{ width: "auto" }}>
          <span className="material-icons" style={{ fontSize: "18px" }}>
            download
          </span>
          Export Report
        </button>
      </div>

      {/* Main Grid: Rate Card & Trend Chart */}
      <div className="rates-grid">
        {/* Left: Rate Card */}
        <div className="rate-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                textAlign: "left",
                fontWeight: 700,
                color: "#fff",
                fontSize: "16px",
              }}
            >
              Current Rate
            </div>
            <span
              className="material-icons"
              style={{ color: "var(--accent-blue)", fontSize: "20px" }}
            >
              info
            </span>
          </div>

          <select className="custom-select" defaultValue="Meralco">
            <option>Meralco</option>
            <option>VECO</option>
            <option>Davao Light</option>
          </select>

          <div style={{ margin: "25px 0" }}>
            <div className="rate-main">₱ 12.50</div>
            <div style={{ color: "#888", fontSize: "14px" }}>per kWh</div>
          </div>

          <div className="rate-details">
            <div>
              <div className="rd-label">Effective Date</div>
              <div className="rd-val">Oct 23, 2025</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="rd-label">Movement</div>
              <div className="rd-val red">+0.60</div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Update Rate
          </button>
        </div>

        {/* Right: Trend Card */}
        <div className="trend-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "16px" }}>
              Rate Trend
            </div>
            <div className="trend-toggle">
              <div className="tt-opt">Monthly</div>
              <div className="tt-opt active">Yearly</div>
            </div>
          </div>
          <div className="trend-stats-text">
            <div>
              HIGH <span className="ts-val">₱12.50</span>
            </div>
            <div>
              LOW <span className="ts-val-low">₱8.50</span>
            </div>
          </div>

          <div className="chart-box">
            {/* 2015 */}
            <div className="bar-group">
              <div className="bar-val">₱8.50</div>
              <div className="bar" style={{ height: "30%" }}></div>
              <div className="bar-label">2015</div>
            </div>
            {/* 2016 */}
            <div className="bar-group">
              <div className="bar-val">₱8.90</div>
              <div className="bar" style={{ height: "35%" }}></div>
              <div className="bar-label">2016</div>
            </div>
            {/* 2017 */}
            <div className="bar-group">
              <div className="bar-val">₱9.20</div>
              <div className="bar" style={{ height: "38%" }}></div>
              <div className="bar-label">2017</div>
            </div>
            {/* 2018 */}
            <div className="bar-group">
              <div className="bar-val">₱9.50</div>
              <div className="bar" style={{ height: "40%" }}></div>
              <div className="bar-label">2018</div>
            </div>
            {/* 2019 */}
            <div className="bar-group">
              <div className="bar-val">₱9.80</div>
              <div className="bar" style={{ height: "45%" }}></div>
              <div className="bar-label">2019</div>
            </div>
            {/* 2020 */}
            <div className="bar-group">
              <div className="bar-val">₱10.20</div>
              <div className="bar" style={{ height: "50%" }}></div>
              <div className="bar-label">2020</div>
            </div>
            {/* 2021 */}
            <div className="bar-group">
              <div className="bar-val">₱10.50</div>
              <div className="bar" style={{ height: "55%" }}></div>
              <div className="bar-label">2021</div>
            </div>
            {/* 2022 */}
            <div className="bar-group">
              <div className="bar-val">₱11.10</div>
              <div className="bar" style={{ height: "65%" }}></div>
              <div className="bar-label">2022</div>
            </div>
            {/* 2023 */}
            <div className="bar-group">
              <div className="bar-val">₱11.80</div>
              <div className="bar" style={{ height: "80%" }}></div>
              <div className="bar-label">2023</div>
            </div>
            {/* 2024 (High) */}
            <div className="bar-group">
              <div className="bar-val high">₱12.10</div>
              <div className="bar active" style={{ height: "88%" }}></div>
              <div className="bar-label">2024</div>
            </div>
            {/* 2025 (Current) */}
            <div className="bar-group">
              <div className="bar-val curr">₱12.50</div>
              <div className="bar current" style={{ height: "98%" }}></div>
              <div className="bar-label">2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date Modified</th>
              <th>Provider</th>
              <th>Rate Change</th>
              <th>Reason / Notes</th>
              <th>Status</th>
              <th>Updated By</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Oct 23, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱11.90</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-up">₱12.50</span>
              </td>
              <td>Generation Charge Adj.</td>
              <td>
                <span className="status-badge sb-active">Active</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>
            {/* Row 2 */}
            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Sep 15, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱12.40</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-down">₱11.90</span>
              </td>
              <td>System Optimization</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>
            {/* Row 3 */}
            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Aug 01, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱12.10</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-up">₱12.40</span>
              </td>
              <td>Inflation Adjustment</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>
            {/* Row 4 */}
            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Jul 12, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱12.80</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-down">₱12.10</span>
              </td>
              <td>Substation Efficiency</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>
            {/* Row 5 */}
            <tr>
              <td style={{ color: "#ddd", fontWeight: 400 }}>Jun 05, 2025</td>
              <td>Meralco</td>
              <td>
                <span className="rate-pill">₱11.50</span>
                <span
                  style={{ color: "#666", fontSize: "12px", margin: "0 4px" }}
                >
                  →
                </span>
                <span className="rate-pill rate-up">₱12.80</span>
              </td>
              <td>Summer Peak Pricing</td>
              <td>
                <span className="status-badge sb-archived">Previous</span>
              </td>
              <td>
                <div className="admin-meta">
                  <div
                    className="user-avatar"
                    style={{ width: "28px", height: "28px", fontSize: "10px" }}
                  >
                    AD
                  </div>
                  Admin
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-title">Update Electricity Rate</div>

            <div className="form-group">
              <label className="form-label">Provider Name</label>
              <input
                type="text"
                className="form-input"
                defaultValue="Meralco (Metro Manila)"
                readOnly
                style={{
                  background: "#1a1a1a",
                  color: "#888",
                  borderColor: "#333",
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Rate (₱ per kWh)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 12.60"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Generation Charge Adjustment"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                style={{ width: "100%" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" style={{ width: "100%" }}>
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Rates;
