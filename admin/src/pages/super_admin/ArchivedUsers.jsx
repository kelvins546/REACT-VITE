import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ArchivedUsers.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { supabase } from "../../supabaseClient";
import "../../components/dropdowns/searchableDropdown.css";


const ArchivedUsers = () => {
  const navigate = useNavigate();
  const [restoreModal, setShowRestoreModal] = useState(false);
  const [restoreReason, setRestoreReason] = useState("Payment Received");
  const [restoreNotes, setRestoreNotes] = useState("");
  const [deleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isRestoreReasonDropdownOpen, setIsRestoreReasonDropdownOpen] = useState(false);
  const [isArchiveReasonDropdownOpen, setIsArchiveReasonDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    }, 1200);
  };

  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserHubs, setViewUserHubs] = useState([]);
  const [viewStats, setViewStats] = useState({ alerts: 0, registeredHubs: 0 });

  const handleViewDetails = async (user) => {
    setViewUser(user);
    setShowModal(true);
    setViewUserHubs([]);
    setViewStats({ alerts: 0, registeredHubs: 0 });

    try {
      const { data: logs } = await supabase
        .from("system_logs")
        .select("severity")
        .eq("user_id", user.id);

      const { data: hubs } = await supabase
        .from("hubs")
        .select("*")
        .eq("user_id", user.id);

      const critical = logs
        ? logs.filter((l) => l.severity === "critical").length
        : 0;

      setViewUserHubs(hubs || []);
      setViewStats({
        alerts: critical,
        registeredHubs: hubs ? hubs.length : 0,
      });
    } catch (err) {
      console.error("Error loading archived user details", err);
    }
  };


  const buildFullName = (first, last) =>
    [first, last].filter(Boolean).join(" ").trim();


  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredUsers = archivedUsers.filter((user) => {
    const matchesSearch = `${user.name} ${user.email} ${user.unit}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCity = selectedCity === "All Cities" || user.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const uniqueCities = ["All Cities", ...new Set(archivedUsers.map((u) => u.city).filter(Boolean))];

  const fetchArchivedUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "resident")
        .eq("status", "archived")
        .order("archived_at", { ascending: false });

      if (error) throw error;

      const mappedUsers = (data || []).map((u) => {
        const fullName =
          buildFullName(u.first_name, u.last_name) || "Unknown User";

        return {
          id: u.id,
          name: fullName,
          email: u.email || "No Email",
          unit: u.unit_location || "No Unit",
          status: "Archived",
          role: u.role,
          joined_at: u.joined_at,

          archivedDate: u.archived_at
            ? new Date(u.archived_at).toLocaleDateString()
            : "N/A",

          phone: u.phone_number || "Not Set",
          avatar_url: u.avatar_url,
          initials: getInitials(fullName || u.email),
          color: "#666",
          location: u.street_address || "Not Set",
          city: u.city || "Not Set",
          region: u.region || "Not Set",
          zip_code: u.zip_code || "Not Set",
        };
      });

      setArchivedUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching archived users:", err);
    } finally {
      setLoading(false);
    }
  };


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

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  useEffect(() => {
    if (!deleteModal) setConfirmDelete(false);
  }, [deleteModal]);

  const handleRestore = async () => {
    if (selectedUsers.length === 0) return;

    setLoader({
      show: true,
      message: "Restoring User...",
    });

    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "active",
          archived_at: null,
        })
        .in("id", selectedUsers);

      if (error) throw error;

      setArchivedUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user.id))
      );

      setNotification({
        show: true,
        title: "User restored",
        message: "The user has been restored successfully.",
        variant: "success",
        icon: "check_circle",
      });

      setShowRestoreModal(false);
      setSelectedUsers([]);
      setRestoreReason("Payment Received");
      setRestoreNotes("");
    } catch (err) {
      setNotification({
        show: true,
        title: "Restore failed",
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


  const handleDelete = async () => {
    if (selectedUsers.length === 0) return;

    setLoader({
      show: true,
      message: "Deleting User..."
    });

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .in("id", selectedUsers);

      if (error) throw error;

      setArchivedUsers(prevUsers =>
        prevUsers.filter(user => !selectedUsers.includes(user.id))
      );

      setNotification({
        show: true,
        title: "User deleted",
        message: `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""} permanently deleted.`,
        variant: "success",
        icon: "check_circle"
      });

      setShowDeleteModal(false);
      setSelectedUsers([]);
      setConfirmDelete(false);
    } catch (err) {
      setNotification({
        show: true,
        title: "Deletion failed",
        message: err.message,
        variant: "error",
        icon: "error"
      });
    } finally {
      setLoader({
        show: false,
        message: "Processing..."
      });
    }
  };

  const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  const getInitials = (name) =>
    name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
      : "??";

  const checkHubStatus = (lastSeen) => {
    if (!lastSeen) return false;

    let timeStr = lastSeen.replace(" ", "T");
    if (!timeStr.endsWith("Z") && !timeStr.includes("+")) {
      timeStr += "Z";
    }

    const lastSeenMs = new Date(timeStr).getTime();
    const now = Date.now();
    const diff = (now - lastSeenMs) / 1000;

    return diff < 120 && diff > -5;
  };

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
      { }
      <div className="page-header">
        <div>
          <div className="page-title">Archived Users</div>
          <div className="page-desc">
            Manage deactivated or removed accounts.
          </div>
        </div>
      </div>

      { }
      <div className="toolbar">
        <div style={{ display: "flex", gap: "12px" }}>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: "relative", minWidth: "180px" }}>
            <button
              className="a-form-input"
              style={{
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: "47px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "0 12px",
                backgroundColor: "#111",
              }}
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            >
              <span style={{ color: "#fff", fontSize: "14px" }}>{selectedCity}</span>
              <span className="material-icons" style={{ fontSize: "18px", color: "#666", transform: isCityDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }}>
                keyboard_arrow_down
              </span>
            </button>
            {isCityDropdownOpen && (
              <div className="dropdown-menu" style={{ width: "100%", zIndex: 100, top: "110%" }}>
                <ul className="options-list">
                  {uniqueCities.map((city) => (
                    <li
                      key={city}
                      className={`provider-option ${selectedCity === city ? "selected" : ""}`}
                      onClick={() => { setSelectedCity(city); setIsCityDropdownOpen(false); }}
                    >
                      <div className="provider-info"><div className="provider-name">{city}</div></div>
                      {selectedCity === city && <span className="checkmark material-symbols-outlined">check</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          { }
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
          {/*<button
            className="btn btn-danger2"
            disabled={selectedUsers.length === 0}
            onClick={() => setShowDeleteModal(true)}
            style={{
              opacity: selectedUsers.length === 0 ? 0.45 : 1,
              cursor: selectedUsers.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <span className="material-icons">delete_sweep</span>
            Clear All
          </button> */}
        </div>
      </div>

      { }
      <div className="table-container" >
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
                  {/*<th style={{ width: "50px" }}>
                    <input
                      style={{
                        accentColor: "var(--primary)",
                        width: "18px",
                        height: "18px",
                      }}
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedUsers.length === filteredUsers.length
                      }
                      onChange={(e) =>
                        setSelectedUsers(
                          e.target.checked ? filteredUsers.map((u) => u.id) : []
                        )
                      }
                    />

                  </th> */}

                  <th>User Profile</th>
                  <th>City</th>
                  <th>Archived Date</th>
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
                  paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      {/* <td>
                        <input
                          style={{
                            accentColor: "var(--primary)",
                            width: "18px",
                            height: "18px",
                          }}
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) =>
                            setSelectedUsers((prev) =>
                              e.target.checked
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id)
                            )
                          }
                        />
                      </td>*/}


                      <td>
                        <div className="user-cell">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt="Profile"
                              className="avatar-md avatar-archived"
                            />
                          ) : (
                            <div className="avatar-md avatar-archived-fallback">
                              {user.initials}
                            </div>
                          )}

                          <div style={{ fontWeight: 600 }}>
                            {user.name}
                            <br />
                            <span style={{ fontSize: "13px", color: "#777" }}>
                              {user.email}
                            </span>
                          </div>
                        </div>

                      </td>

                      <td style={{ color: "#888" }}>{user.city}</td>
                      <td style={{ color: "#888" }}>{user.archivedDate}</td>

                      <td>
                        <span className="stat-badge stat-archived">Archived</span>
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

                          <button
                            className="icon-btn btn-restore"
                            onClick={() => {
                              setSelectedUsers([user.id]);
                              setShowRestoreModal(true);
                            }}
                          >
                            <span className="material-icons">restore_from_trash</span>
                          </button>
                          {/*<button
                            className="icon-btn btn-delete"
                            onClick={() => {
                              setSelectedUsers([user.id]);
                              setShowDeleteModal(true);
                            }}
                          >
                            <span className="material-icons">delete_forever</span>
                          </button>*/}

                        </div>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredUsers.length > 0 && (
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
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                style={{
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                {">"}
              </button>
            </div>
          </div>
        )}

      </div>

      {restoreModal && (
        <div className="r-modal-overlay">
          <div className="r-modal-container restore-mode">
            <div className="r-modal-header" style={{ borderBottom: "none" }}>
              <div className="r-modal-title" style={{ color: "var(--success)" }}>
                <span className="material-icons restore">restore</span> <span className="restore">Restore Account</span>
              </div>
              <button
                className="r-close-btn"
                onClick={() => setShowRestoreModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="r-restore-body">
              <p
                style={{
                  color: "#ccc",
                  marginBottom: "25px",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to restore{" "}
                <strong>
                  {selectedUsers.length > 1
                    ? `${selectedUsers.length} users`
                    : `${selectedUsers.name}`}
                </strong>
                ? This action will restore their
                access to the platform immediately.
              </p>
              <div className="r-form-group">
                <label className="r-form-label">Reason for Restoration</label>
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
                    onClick={() => setIsRestoreReasonDropdownOpen(!isRestoreReasonDropdownOpen)}
                  >
                    <span style={{ color: "#fff", fontSize: "14px" }}>
                      {restoreReason || "Payment Received"}
                    </span>
                    <span className="material-icons" style={{ fontSize: "18px", color: "#666", transform: isRestoreReasonDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }}>
                      keyboard_arrow_down
                    </span>
                  </button>

                  {isRestoreReasonDropdownOpen && (
                    <div className="dropdown-menu" style={{ width: "100%", zIndex: 100 }}>
                      <ul className="options-list">
                        {["Payment Received", "Terms Violation Resolved", "Contract Renewed", "Other"].map((reason) => (
                          <li
                            key={reason}
                            className={`provider-option ${restoreReason === reason ? "selected" : ""}`}
                            onClick={() => { setRestoreReason(reason); setIsRestoreReasonDropdownOpen(false); }}
                          >
                            <div className="provider-info"><div className="provider-name">{reason}</div></div>
                            {restoreReason === reason && <span className="checkmark material-symbols-outlined">check</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="r-form-group">
                <label className="r-form-label">
                  Additional Remarks (Optional)
                </label>
                <textarea
                  className="r-form-textarea"
                  placeholder="Enter details here..."
                  value={restoreNotes}
                  onChange={(e) => setRestoreNotes(e.target.value)}
                />

              </div>
              <div className="r-modal-actions">
                <button
                  className="r-btn-cancel"
                  onClick={() => setShowRestoreModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary btn-primary-modal" onClick={handleRestore}>
                  <span className="material-icons" style={{ fontSize: "18px" }}>
                    restore
                  </span>{" "}
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteModal && (
        <div className="r-modal-overlay">
          <div className="r-modal-container delete-mode">
            <div className="r-modal-header" style={{ borderBottom: "none" }}>
              <div className="r-modal-title" style={{ color: "var(--danger)" }}>
                <span className="material-icons">report_gmailerrorred</span>
                Permanent Deletion
              </div>

              <button
                className="r-close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="r-restore-body">
              <div
                style={{
                  background: "rgba(244,67,54,0.08)",
                  border: "1px solid rgba(244,67,54,0.4)",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  color: "#f44336",
                  fontWeight: 600,
                }}
              >
                <span className="material-icons" style={{ verticalAlign: "middle" }}>
                  warning
                </span>{" "}
                This action is irreversible
              </div>

              <p style={{ color: "#ccc", lineHeight: 1.6 }}>
                You are about to permanently delete{" "}
                <strong>{selectedUsers.length}</strong> archived user
                {selectedUsers.length > 1 ? "s" : ""}.
                All associated records will be removed permanently.
              </p>

              <div className="r-form-group" style={{ marginTop: "20px" }}>
                <label className="r-form-label">
                  <input
                    type="checkbox"
                    style={{
                      accentColor: "var(--primary)",
                      width: "18px",
                      height: "18px",
                      marginRight: '10px',
                      transform: 'translateY(24%)',
                    }}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                  />
                  I understand that this action cannot be undone
                </label>
              </div>

              <div className="r-modal-actions">
                <button
                  className="r-btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger2"
                  onClick={handleDelete}
                  disabled={!confirmDelete}
                  style={{
                    opacity: !confirmDelete ? 0.5 : 1,
                    cursor: !confirmDelete ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="material-icons">delete_forever</span>
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
                <span className="material-icons">
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
              style={{ display: "flex", gap: "24px", padding: "24px", flexWrap: "wrap", scrollbarWidth: "none", }}
            >

              <div
                className="profile-card"
                style={{ width: "380px", flexShrink: 0 }}
              >
                <div className="profile-header">
                  {viewUser.avatar_url ? (
                    <img
                      src={viewUser.avatar_url}
                      alt="Profile"
                      className="avatar-lg avatar-archived"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="avatar-lg avatar-archived-fallback"
                      style={{ background: viewUser.color }}
                    >
                      {viewUser.initials}
                    </div>
                  )}

                  <div className="user-name">{viewUser.name}</div>
                  <div className="user-meta">
                    • {capitalize(viewUser.role)}
                  </div>

                  <span className="status-badge status-archived">
                    ARCHIVED ACCOUNT
                  </span>
                </div>



                <div className="info-group">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-val">{viewUser.email}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Phone</span>
                    <span className="info-val">{viewUser.phone}</span>
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
                      {viewUser.joined_at
                        ? new Date(viewUser.joined_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Archived</span>
                    <span className="info-val">
                      {viewUser.archivedDate
                        ? new Date(viewUser.archivedDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">User ID</span>
                    <span className="info-val" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {viewUser.id}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div className="m-stat-card">
                    <div className="m-stat-label">Registered Hubs</div>
                    <div className="m-stat-val">0</div>
                    <div className="m-stat-sub">Total Devices</div>
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
                        padding: "24px",
                        textAlign: "center",
                        color: "#666",
                        fontStyle: "italic",
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
                            <div className="hub-icon">
                              <span className="material-icons">
                                {isOnline ? "router" : "wifi_off"}
                              </span>
                            </div>
                            <div className="hub-info">
                              <h4>{hub.name}</h4>
                              <p>Serial: {hub.serial_number}</p>
                            </div>
                          </div>
                          <span className="hub-status">
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
                onClick={handleSendReset}
              >
                Send Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ArchivedUsers;
