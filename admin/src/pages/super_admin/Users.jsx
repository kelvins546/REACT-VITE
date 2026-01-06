import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Users.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";

const Users = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveReason, setArchiveReason] = useState("");
  const itemsPerPage = 10;

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info",
  });

  const [loader, setLoader] = useState({
    show: false,
    message: "Processing...",
  });

  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserHubs, setViewUserHubs] = useState([]);
  const [viewStats, setViewStats] = useState({ alerts: 0, registeredHubs: 0 });

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const sampleUsers = [
    {
      id: 1,
      initials: "JV",
      name: "Jonas Vingegaard",
      email: "TJV_@gmail.com",
      location: "Unit 101 - Manila",
      hubs: "2 Registered",
      status: "Active",
      avatar_url: null,
      color: "#0055ff",
      textColor: "#fff",
    },
    {
      id: 2,
      initials: "LC",
      name: "Leo Carlo",
      email: "icc.atay.leocarlo@immaculada.edu.ph",
      location: "Unit 204 - Cebu",
      hubs: "1 Registered",
      status: "Active",
      avatar_url: null,
      color: "#00aa88",
      textColor: "#fff",
    },
    {
      id: 3,
      initials: "KM",
      name: "Kelvin Manalad",
      email: "kelvin_manalad@gmail.com",
      location: "Unit 12B - Davao",
      hubs: "0 Registered",
      status: "Archived",
      avatar_url: null,
      color: "#ff4444",
      textColor: "#fff",
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsersList(sampleUsers);
      setLoading(false);
    }, 800);
  }, []);

  const handleViewDetails = (user) => {
    setViewUser(user);
    setViewUserHubs([
      { id: 1, name: "Hub A" },
      { id: 2, name: "Hub B" },
    ]);
    setViewStats({ alerts: 2, registeredHubs: 2 });
    setShowModal(true);
  };

  const handleArchiveClick = (user) => {
    setSelectedUser(user);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = () => {
    setLoader({ show: true, message: "Archiving User..." });

    setTimeout(() => {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Archived" } : u
        )
      );

      setLoader({ show: false, message: "Processing..." });
      setNotification({
        show: true,
        title: "User archived",
        message: "The user has been archived successfully.",
        variant: "warning",
        icon: "archive",
      });

      setShowArchiveModal(false);
      setSelectedUser(null);
    }, 1200);
  };



  const handleSendReset = () => {
    setLoader({ show: true, message: "Sending..." });

    setTimeout(() => {

      setLoader({ show: false, message: "Processing..." });
      setNotification({
        show: true,
        title: "Email Sent",
        message: "A reset password link has been sent to the user.",
        variant: "success",
        icon: "check_circle"
      });

      setShowResetModal(false);
      setShowModal(false);
      setSelectedUser(null);
    }, 1200);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    setLoader({
      show: true,
      message: "Exporting Report..."
    });

    setTimeout(() => {
      setLoader({
        show: false,
        message: "Processing..."
      });

      setNotification({
        show: true,
        title: "Processing",
        message: "Your report is being exported.",
        variant: "processing",
        icon: "progress_activity"
      });

      setShowExportModal(false);
    }, 2000);
  }

  return (
    <>
      <PopupNotification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        variant={notification.variant}
        icon={notification.icon}
        duration={3000}
        onClose={() =>
          setNotification((prev) => ({ ...prev, show: false }))
        }
      />
      <LoadingPopup
        show={loader.show}
        message={loader.message}
        Loader={PuffLoader}
        color="#0055ff"
      />
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
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
          <button className="btn btn-primary" onClick={() => setShowExportModal(true)}>
            <span className="material-icons" style={{ fontSize: "18px" }}>
              file_download
            </span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "50px",
            }}
          >
            <PuffLoader color="#0055ff" size={40} />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                {/* <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    style={{
                      accentColor: "var(--primary)",
                      width: "18px",
                      height: "18px",
                    }}
                  />
                </th>*/}

                <th>User Profile</th>
                <th>Unit / Location</th>
                <th>Registered Hubs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user.id || index}
                    style={{ opacity: user.status === "Archived" ? 0.5 : 1 }}
                  >
                    {/* <td>
                      <input
                        type="checkbox"
                        style={{
                          accentColor: "var(--primary)",
                          width: "18px",
                          height: "18px",
                        }}
                      />
                    </td> */}

                    <td>
                      <div className="user-cell">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="u-avatar"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="u-avatar"
                            style={{
                              background: user.color,
                              color: user.textColor,
                            }}
                          >
                            {user.initials}
                          </div>
                        )}

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
                            user.status === "Active"
                              ? "var(--primary)"
                              : "#666",
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
                          onClick={() => handleViewDetails(user)}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "18px" }}
                          >
                            visibility
                          </span>
                        </button>
                        {user.status !== "Archived" && (
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {!loading && (
          <div className="u-pagination">
            <div style={{ fontSize: "14px", color: "#666" }}>
              Showing{" "}
              {paginatedUsers.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
              -{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="u-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                {"<"}
              </button>
              <button className="u-page-btn active">{currentPage}</button>
              <button
                className="u-page-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>

      { }
      {showModal && (
        <div className="u-modal-overlay">
          <div
            className="u-modal-container"
            style={{
              maxWidth: "900px",
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="u-modal-header">
              <div className="u-modal-title">
                <span className="material-icons" style={{ color: "#00ff99" }}>
                  account_circle
                </span>
                User Details
              </div>
              <button className="u-close-btn" onClick={() => setShowModal(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div
              className="u-modal-body"
              style={{ display: "flex", gap: "24px", padding: "24px", flexWrap: "wrap" }}
            >

              <div
                className="profile-card"
                style={{ width: "320px", flexShrink: 0 }}
              >
                <div className="profile-header">
                  <div
                    className="avatar-lg"
                    style={{ background: "#00ff99", color: "#000" }}
                  >
                    JV
                  </div>

                  <div className="user-name">Jonas Vingegaard</div>
                  <div className="user-meta">Denmark • Resident</div>

                  <span className="status-badge">ARCHIVED ACCOUNT</span>
                </div>

                <div className="info-group">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-val">
                      ucc.atay.leocarlo@gmail.com
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-val">Not Set</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Joined</span>
                    <span className="info-val">1/1/2026</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">User ID</span>
                    <span
                      className="info-val"
                      style={{ fontFamily: "monospace", fontSize: "12px" }}
                    >
                      ef0bf0a-f3b4-4fad-b401-ebf4b3edd3c8
                    </span>
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn-full" onClick={() => setShowResetModal(true)}>
                    <span className="material-icons">lock_reset</span>
                    Send Password Reset
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div className="m-stat-card">
                    <div className="m-stat-label">REGISTERED HUBS</div>
                    <div className="m-stat-val">0</div>
                    <div className="m-stat-sub">Total Devices</div>
                  </div>

                  <div className="m-stat-card">
                    <div className="m-stat-label">SAFETY ALERTS</div>
                    <div className="m-stat-val" style={{ color: "red" }}>
                      0
                    </div>
                    <div className="m-stat-sub" style={{ color: "red" }}>
                      Critical Faults
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="section-title">
                    <span
                      className="material-icons"
                      style={{ color: "#0055ff" }}
                    >
                      router
                    </span>
                    Registered Hardware
                  </div>

                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    No hubs registered.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="send-reset-modal-overlay">
          <div className="send-reset-modal-container">
            <span className="material-icons send-reset-modal-icon">
              lock_reset
            </span>
            <h3 className="send-reset-modal-title">Send Password Reset</h3>
            <p className="send-reset-modal-desc">
              Are you sure you want to send a password reset link to this user?
            </p>
            <div className="send-reset-modal-actions">
              <button

                className="u-btn-cancel"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                className="u-btn-danger"
                onClick={handleSendReset}
              >
                Send Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showArchiveModal && selectedUser && (
        <div className="u-modal-overlay">
          <div className="u-modal-container archive-mode">
            <div className="u-modal-header" style={{ borderBottom: "none" }}>
              <div className="u-modal-title" style={{ color: "var(--danger)" }}>
                <span style={{ color: "#FFAA00" }} className="material-icons">warning</span>
                <span style={{ color: "#FFAA00" }}>Archive User</span>
              </div>
              <button
                className="u-close-btn"
                onClick={() => setShowArchiveModal(false)}
              >
                <span style={{ color: "#FFAA00" }} className="material-icons">close</span>
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
                <select
                  className="u-form-select"
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                >
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
                  </span>{" "}
                  Confirm Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showExportModal && (
        <div className="export-backdrop" onClick={() => setShowExportModal(false)}>
          <div
            style={{
              backgroundColor: "#0F0F0F",
              borderRadius: "12px",
              border: "1px solid #333333",
              padding: "20px",
              maxWidth: "330px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              animation: "slideUp 0.5s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span
                className="material-icons"
                style={{
                  fontSize: "35px",
                  marginTop: "10px",
                  color: "#0055FF",
                }}
              >
                download
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <span
                style={{ fontSize: "15.5px", fontWeight: "600", color: "#fff", marginTop: "10px" }}
              >
                Export CSV File
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Would you like to export user data report?
              </span>
            </div>

            <div className="export-footer">
              <button
                className="r-btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>

              <button className="r-btn-primary" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Users;
