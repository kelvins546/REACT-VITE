import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Users.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";

const Users = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showExportModal, setShowExportModal] = useState(false);

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

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info"
  });

  const [loader, setLoader] = useState({
    show: false,
    message: "Processing..."
  });

  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserHubs, setViewUserHubs] = useState([]);
  const [viewStats, setViewStats] = useState({ alerts: 0, registeredHubs: 0 });

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const checkHubStatus = (lastSeen) => {
    if (!lastSeen) return false;

    let timeStr = lastSeen.replace(" ", "T");
    if (!timeStr.endsWith("Z") && !timeStr.includes("+")) {
      timeStr += "Z";
    }

    const lastSeenMs = new Date(timeStr).getTime();
    const now = Date.now();
    const diffInSeconds = (now - lastSeenMs) / 1000;

    return diffInSeconds < 120 && diffInSeconds > -5;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("joined_at", { ascending: false });

      if (usersError) throw usersError;

      const visibleUsers = usersData.filter(
        (u) => u.role !== "super admin" && u.role !== "admin"
      );

      const userIds = visibleUsers.map((u) => u.id);
      let hubsData = [];
      if (userIds.length > 0) {
        const { data: fetchedHubs } = await supabase
          .from("hubs")
          .select("user_id, last_seen")
          .in("user_id", userIds);
        hubsData = fetchedHubs || [];
      }

      const mappedUsers = visibleUsers.map((u) => {
        const totalHubsCount = hubsData.filter(
          (h) => h.user_id === u.id
        ).length;

        return {
          id: u.id,
          initials: getInitials(u.full_name),
          name: u.full_name,
          email: u.email,
          location: u.unit_location || "No Location",
          hubs: `${totalHubsCount} Registered`,
          status: capitalize(u.status),
          role: u.role,
          joined_at: u.joined_at,
          phone: u.phone_number,
          avatar_url: u.avatar_url,
          color: getAvatarColor(u.full_name),
          textColor: "#fff",
          borderColor: "transparent",
        };
      });

      setUsersList(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (user) => {
    setViewUser(user);
    setShowModal(true);
    setViewUserHubs([]);

    try {
      const { data: logs } = await supabase
        .from("system_logs")
        .select("severity")
        .eq("user_id", user.id)
        .limit(50);

      const { data: hubs } = await supabase
        .from("hubs")
        .select("*")
        .eq("user_id", user.id);

      if (hubs) setViewUserHubs(hubs);

      const criticalErrors = logs
        ? logs.filter((l) => l.severity === "critical").length
        : 0;
      const totalHubs = hubs ? hubs.length : 0;

      setViewStats({
        alerts: criticalErrors,
        registeredHubs: totalHubs,
      });
    } catch (err) {
      console.error("Error fetching details", err);
    }
  };

  const handleArchiveClick = (user) => {
    setSelectedUser(user);
    setArchiveReason("");
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    setLoader({
      show: true,
      message: "Archiving User..."
    });
    if (!selectedUser) {
      setLoader({
        show: false,
        message: "Processing..."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ status: "archived" })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Archived" } : u
        )
      );
      setNotification({
        show: true,
        title: "User archived",
        message: "The user has been archived successfully.",
        variant: "warning",
        icon: "archive"
      });
      setShowArchiveModal(false);
      setSelectedUser(null);
      setLoader({
        show: false,
        message: "Processing..."
      });

    } catch (err) {
      setNotification({
        show: true,
        title: "Archived failed",
        message: err.message,
        variant: "error",
        icon: "error"
      });
      setLoader({
        show: false,
        message: "Processing..."
      });
    }
  };

  const getInitials = (name) =>
    name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
      : "??";
  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  const getAvatarColor = (name) => {
    const colors = ["#0055ff", "#00ff99", "#ffaa00", "#ff4444", "#9d00ff"];
    if (!name) return colors[0];
    return colors[name.length % colors.length];
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
      {showModal && viewUser && (
        <div className="u-modal-overlay">
          <div
            className="u-modal-container"
            style={{
              maxWidth: "850px",
              width: "90%",
              height: "auto",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
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

            <div
              className="u-modal-body"
              style={{ display: "flex", gap: "25px", padding: "25px" }}
            >
              { }
              <div
                className="profile-card"
                style={{ width: "320px", flexShrink: 0, height: "fit-content" }}
              >
                <div className="profile-header">
                  {viewUser.avatar_url ? (
                    <img
                      src={viewUser.avatar_url}
                      alt="Profile"
                      className="avatar-lg"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="avatar-lg"
                      style={{ background: viewUser.color }}
                    >
                      {viewUser.initials}
                    </div>
                  )}

                  <div className="user-name">{viewUser.name}</div>
                  <div className="user-meta">
                    {viewUser.location} • {capitalize(viewUser.role)}
                  </div>
                  <span
                    className={`status-badge ${viewUser.status === "Active" ? "st-active-badge" : ""
                      }`}
                  >
                    {viewUser.status} Account
                  </span>
                </div>

                <div className="info-group">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-val">{viewUser.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-val">
                      {viewUser.phone || "Not Set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Joined</span>
                    <span className="info-val">
                      {new Date(viewUser.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">User ID</span>
                    <span
                      className="info-val"
                      style={{
                        fontFamily: "monospace",
                        color: "#888",
                        fontSize: "11px",
                      }}
                    >
                      {viewUser.id}
                    </span>
                  </div>
                </div>

                <div className="btn-group">
                  <button
                    className="btn-full"
                    onClick={() => setShowResetModal(true)}
                  >
                    <span className="material-icons">lock_reset</span> Send
                    Password Reset
                  </button>
                </div>
              </div>

              { }
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                { }
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div className="m-stat-card" style={{ width: "100%" }}>
                    <div className="m-stat-label">Registered Hubs</div>
                    <div className="m-stat-val">{viewStats.registeredHubs}</div>
                    <div className="m-stat-sub" style={{ color: "#888" }}>
                      Total Devices
                    </div>
                  </div>

                  <div className="m-stat-card" style={{ width: "100%" }}>
                    <div className="m-stat-label">Safety Alerts</div>
                    <div
                      className="m-stat-val"
                      style={{ color: "var(--danger)" }}
                    >
                      {viewStats.alerts}
                    </div>
                    <div
                      className="m-stat-sub"
                      style={{ color: "var(--danger)" }}
                    >
                      Critical Faults
                    </div>
                  </div>
                </div>

                { }
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
                  {viewUserHubs.length === 0 ? (
                    <div
                      style={{
                        padding: "25px",
                        color: "#666",
                        fontStyle: "italic",
                        textAlign: "center",
                      }}
                    >
                      No hubs registered.
                    </div>
                  ) : (
                    viewUserHubs.map((hub) => {
                      const isOnline = checkHubStatus(hub.last_seen);

                      return (
                        <div className="hub-item" key={hub.id}>
                          <div className="hub-left">
                            <div
                              className="hub-icon"
                              style={{ background: isOnline ? "" : "#2a2a2a" }}
                            >
                              <span
                                className="material-icons"
                                style={{ color: isOnline ? "" : "#666" }}
                              >
                                {isOnline ? "router" : "wifi_off"}
                              </span>
                            </div>
                            <div className="hub-info">
                              <h4>{hub.name}</h4>
                              <p>Serial: {hub.serial_number}</p>
                            </div>
                          </div>
                          <span
                            className="hub-status"
                            style={{ color: isOnline ? "" : "#666" }}
                          >
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      );
                    })
                  )}
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
                onClick={() => {
                  setShowResetModal(false);
                  setNotification({
                    show: true,
                    title: "Email Sent",
                    message: "A reset password link has been sent to the user.",
                    variant: "success",
                    icon: "check_circle"
                  });
                }}
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
