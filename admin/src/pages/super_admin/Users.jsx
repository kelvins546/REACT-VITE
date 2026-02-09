import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Users.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import CalendarDropdown from "../../components/dropdowns/CalendarDropdown";
import "../../components/dropdowns/searchableDropdown.css";

const buildFullName = (first, last) =>
  [first, last].filter(Boolean).join(" ").trim();

const Users = () => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");

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

  useEffect(() => {
    const checkSuperAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || data?.role !== "super admin") {
          navigate("/");
        }
      } catch (err) {
        console.error("Error checking role:", err);
        navigate("/");
      }
    };

    checkSuperAdminAccess();
  }, [navigate]);

  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserHubs, setViewUserHubs] = useState([]);
  const [viewStats, setViewStats] = useState({ alerts: 0, registeredHubs: 0 });

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [archiveReason, setArchiveReason] = useState("Non-payment of Dues");
  const [isArchiveReasonDropdownOpen, setIsArchiveReasonDropdownOpen] = useState(false);

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

  const handleExport = () => {
    setLoader({
      show: true,
      message: "Exporting Report..."
    });

    setTimeout(() => {
      try {
        let usersToExport = filteredUsers;

        if (exportFromDate || exportToDate) {
          usersToExport = filteredUsers.filter((user) => {
            const joinedDate = new Date(user.joined_at);

            if (exportFromDate) {
              const fromDate = new Date(exportFromDate);
              if (joinedDate < fromDate) return false;
            }

            if (exportToDate) {
              const toDate = new Date(exportToDate);
              toDate.setHours(23, 59, 59, 999);
              if (joinedDate > toDate) return false;
            }

            return true;
          });
        }

        const headers = ["Name", "Email", "Phone", "Street Address", "City", "Region", "Zip Code", "Status", "Registered Hubs", "Joined Date"];

        const rows = usersToExport.map((user) => [
          user.name,
          user.email,
          user.phone_number,
          user.street_address,
          user.city,
          user.region,
          user.zip_code,
          user.status,
          user.hubs.replace(" Registered", ""),
          new Date(user.joined_at).toLocaleDateString(),
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row
              .map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `users_report_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setLoader({
          show: false,
          message: "Processing..."
        });

        setNotification({
          show: true,
          title: "Export Successful",
          message: `Successfully exported ${usersToExport.length} user records.`,
          variant: "success",
          icon: "check_circle"
        });

        setShowExportModal(false);
        setExportFromDate("");
        setExportToDate("");
      } catch (error) {
        setLoader({
          show: false,
          message: "Processing..."
        });

        setNotification({
          show: true,
          title: "Export Failed",
          message: error.message || "Failed to export CSV file.",
          variant: "error",
          icon: "error"
        });
      }
    }, 1500);
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: usersData, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "active")
        .order("joined_at", { ascending: false });

      if (error) throw error;

      const visibleUsers = usersData.filter(
        (u) => u.role !== "super admin" && u.role !== "admin"
      );

      const userIds = visibleUsers.map((u) => u.id);
      let hubsData = [];

      if (userIds.length > 0) {
        const { data } = await supabase
          .from("hubs")
          .select("user_id, last_seen")
          .in("user_id", userIds);

        hubsData = data || [];
      }

      const mappedUsers = visibleUsers.map((u) => {
        const fullName =
          buildFullName(u.first_name, u.last_name) || "Unknown User";

        const totalHubsCount = hubsData.filter(
          (h) => h.user_id === u.id
        ).length;

        return {
          id: u.id,
          initials: getInitials(fullName || u.email),
          name: fullName,
          email: u.email || "No Email",
          location: u.street_address || "Not Set",
          region: u.region || "Not Set",
          city: u.city || "Not Set",
          zip_code: u.zip_code || "Not Set",
          street_address: u.street_address || "Not Set",
          phone_number: u.phone_number || "Not Set",
          hubs: `${totalHubsCount} Registered`,
          status: capitalize(u.status || "inactive"),
          role: u.role,
          joined_at: u.joined_at,
          phone: u.phone_number || "Not Set",
          avatar_url: u.avatar_url,
          color: getAvatarColor(fullName),
          textColor: "#fff",
          borderColor: "transparent",
        };
      });

      setUsersList(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
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
    setArchiveReason("Non-payment of Dues");
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    setLoader({
      show: true,
      message: "Archiving User...",
    });

    if (!selectedUser) {
      setLoader({
        show: false,
        message: "Processing...",
      });
      return;
    }

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("users")
        .update({
          status: "archived",
          archived_at: now,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, status: "Archived", archived_at: now }
            : u
        )
      );

      setNotification({
        show: true,
        title: "User archived",
        message: "The user has been archived successfully.",
        variant: "warning",
        icon: "archive",
      });

      setShowArchiveModal(false);
      setSelectedUser(null);
    } catch (err) {
      setNotification({
        show: true,
        title: "Archive failed",
        message: err.message,
        variant: "error",
        icon: "error",
      });
    } finally {
      setLoader({
        show: false,
        message: "Processing...",
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

  const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const getAvatarColor = (name) => {
    const colors = ["#0055ff", "#00ff99", "#ffaa00", "#ff4444", "#9d00ff"];
    return colors[(name || "").length % colors.length];
  };

  const filteredUsers = usersList.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage < 1) setCurrentPage(1);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


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
        color="#ffd700"
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
        <div className="table-container-scrollable">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "50px",
              }}
            >
              <PuffLoader color="#ffd700" size={40} />
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
                  <th>City</th>
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
                      <td>{user.city}</td>
                      <td>{user.hubs}</td>
                      <td>
                        <span
                          className={`stat-badge ${user.status === "Active"
                            ? "stat-active"
                            : "stat-archived"
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button
                            className="icon-btn btn-view"
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
                              className="icon-btn archive-user-btn"
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
        </div>

        {!loading && (
          <div className="a-pagination">
            <div style={{ fontSize: "14px", color: "#666" }}>
              Showing{" "}
              {(currentPage - 1) * itemsPerPage + 1}
              {"–"}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              {" "}of {filteredUsers.length}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="u-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                style={{
                  opacity: currentPage === 1 ? 0.4 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`u-page-btn ${page === currentPage ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="u-page-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                style={{
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
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
              style={{ display: "flex", gap: "24px", padding: "24px", flexWrap: "wrap", scrollbarWidth: "none" }}
            >
              { }
              <div
                className="profile-card"
                style={{ width: "380px", flexShrink: 0 }}
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
                    • {capitalize(viewUser.role)}
                  </div>

                  <span className="stat-badge stat-active">ACTIVE ACCOUNT</span>
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
                    <span className="info-label">Street Address</span>
                    <span className="info-val">
                      {viewUser.location || "Not Set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">City</span>
                    <span className="info-val">
                      {viewUser.city || "Not Set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Region</span>
                    <span className="info-val">
                      {viewUser.region || "Not Set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Zip Code</span>
                    <span className="info-val">
                      {viewUser.zip_code || "Not Set"}
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
                      style={{ fontFamily: "monospace", fontSize: "12px" }}
                    >
                      {viewUser.id}
                    </span>
                  </div>
                </div>
              </div>

              { }
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
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
                <div className="a-input-wrapper" style={{ position: "relative", borderColor: "#333", background: "#1a1a1a", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "center" }}>
                  <button
                    type="button"
                    className="a-form-input"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingRight: 0,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                    onClick={() => setIsArchiveReasonDropdownOpen(!isArchiveReasonDropdownOpen)}
                  >
                    <span style={{ color: "#fff", fontSize: "14px" }}>
                      {archiveReason || "Non-payment of Dues"}
                    </span>
                    <span className="material-icons" style={{ fontSize: "18px", color: "#666", transform: isArchiveReasonDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }}>
                      keyboard_arrow_down
                    </span>
                  </button>

                  {isArchiveReasonDropdownOpen && (
                    <div className="dropdown-menu" style={{ width: "100%", zIndex: 100 }}>
                      <ul className="options-list">
                        {["Non-payment of Dues", "Violation of Terms", "Moved Out / Contract Ended", "Other"].map((reason) => (
                          <li
                            key={reason}
                            className={`provider-option ${archiveReason === reason ? "selected" : ""}`}
                            onClick={() => { setArchiveReason(reason); setIsArchiveReasonDropdownOpen(false); }}
                          >
                            <div className="provider-info"><div className="provider-name">{reason}</div></div>
                            {archiveReason === reason && <span className="checkmark material-symbols-outlined">check</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="u-form-group">
                <label className="u-form-label">
                  Additional Remarks (Optional)
                </label>
                <textarea
                  className="u-form-textarea"
                  placeholder="Enter details here..."
                /* value={archiveReason} */
                /*onChange={(e) => setArchiveReason(e.target.value)}*/
                ></textarea>
              </div>
              <div className="u-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowArchiveModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-danger" onClick={handleConfirmArchive}>
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
              maxWidth: "380px",
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
                  color: "#00A651",
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
                Select a date range to filter users by joined date (optional)
              </span>
            </div>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>From Date</label>
                  <CalendarDropdown
                    value={exportFromDate}
                    onChange={setExportFromDate}
                    placeholder="MM/DD/YY"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>To Date</label>
                  <CalendarDropdown
                    value={exportToDate}
                    onChange={setExportToDate}
                    placeholder="MM/DD/YY"
                  />
                </div>
              </div>
            </div>

            <div className="export-footer" style={{ marginTop: "20px" }}>
              <button
                className="r-btn-secondary"
                onClick={() => {
                  setShowExportModal(false);
                  setExportFromDate("");
                  setExportToDate("");
                }}
              >
                Cancel
              </button>

              <button style={{ width: "100%", justifyContent: "center" }} className="btn-primary" onClick={handleExport}>
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