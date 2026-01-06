import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ArchivedUsers.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";

const ArchivedUsers = () => {
  const [restoreModal, setShowRestoreModal] = useState(false);
  const [restoreReason, setRestoreReason] = useState("");
  const [deleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);


  const [archivedUsers, setArchivedUsers] = useState([
    {
      id: 1,
      name: "Marco Polo",
      email: "marco.p@email.com",
      unit: "Unit 105, Tower B",
      archivedDate: "Oct 10, 2025",
    },
    {
      id: 2,
      name: "Sarah Lee",
      email: "s.lee@yahoo.com",
      unit: "Unit 502, North Wing",
      archivedDate: "Sep 22, 2025",
    },
    {
      id: 3,
      name: "Kevin Durant",
      email: "kd.35@nba.com",
      unit: "Unit 909, Penthouse",
      archivedDate: "Aug 05, 2025",
    },
  ]);

  const filteredUsers = archivedUsers.filter((user) =>
    `${user.name} ${user.email} ${user.unit}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );


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
    if (!deleteModal) setConfirmDelete(false);
  }, [deleteModal]);

  const handleRestore = () => {
    setLoader({
      show: true,
      message: "Restoring User..."
    });

    setTimeout(() => {
      setLoader({
        show: false,
        message: "Processing..."
      });

      setNotification({
        show: true,
        title: "User restored",
        message: "The user has been restored successfully.",
        variant: "success",
        icon: "check_circle"
      });

      setShowRestoreModal(false);
      setSelectedUser(null);
    }, 2000); 
  };

  const handleDelete = () => {
    setLoader({
      show: true,
      message: "Deleting User..."
    });

    setTimeout(() => {
      setLoader({
        show: false,
        message: "Processing..."
      });

      setNotification({
        show: true,
        title: "User deleted",
        message: "The user has been deleted successfully.",
        variant: "success",
        icon: "check_circle"
      });

      setShowDeleteModal(false);
      setSelectedUser(null);
    }, 2000);
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
        color="#0055ff"
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
          <button
            className="btn btn-primary"
            disabled={selectedUsers.length === 0}
            onClick={() => setShowDeleteModal(true)}
            style={{
              opacity: selectedUsers.length === 0 ? 0.45 : 1,
              cursor: selectedUsers.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <span className="material-icons">delete_sweep</span>
            Clear All
          </button>

        </div>
      </div>

      { }
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>
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

              </th>
              <th>User Profile</th>
              <th>Unit / Location</th>
              <th>Archived Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { }
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
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
                </td>

                <td>
                  <div className="user-cell">
                    <div className="u-avatar">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {user.name}
                      <br />
                      <span style={{ fontSize: "13px", color: "#666" }}>
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>

                <td style={{ color: "#888" }}>{user.unit}</td>
                <td style={{ color: "#888" }}>{user.archivedDate}</td>

                <td>
                  <span className="status-dot st-archived"></span>
                  <span style={{ color: "#ccc" }}>Archived</span>
                </td>

                <td>
                  <div className="action-cell">
                    <button
                      className="icon-btn btn-restore"
                      onClick={() => {
                        setSelectedUsers([user.id]);
                        setShowRestoreModal(true);
                      }}
                    >
                      <span className="material-icons">restore_from_trash</span>
                    </button>

                    <button
                      className="icon-btn btn-delete"
                      onClick={() => {
                        setSelectedUsers([user.id]);
                        setShowDeleteModal(true);
                      }}
                    >
                      <span className="material-icons">delete_forever</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </table>

        { }
        <div className="a-pagination">
          <div style={{ fontSize: "14px", color: "#666" }}>
            Showing {filteredUsers.length} of {archivedUsers.length}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="u-page-btn">{"<"}</button>
            <button className="u-page-btn active">1</button>
            <button className="u-page-btn">2</button>
            <button className="u-page-btn">{">"}</button>
          </div>
        </div>
      </div>
      {restoreModal && (
        <div className="r-modal-overlay">
          <div className="r-modal-container restore-mode">
            <div className="r-modal-header" style={{ borderBottom: "none" }}>
              <div className="r-modal-title" style={{ color: "var(--success)" }}>
                <span className="material-icons">restore</span> Restore Account
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
                <strong>Sample User</strong>? This action will restore their
                access to the platform immediately.
              </p>
              <div className="r-form-group">
                <label className="r-form-label">Reason for Restoration</label>
                <select
                  className="r-form-select"
                  value={restoreReason}
                  onChange={(e) => setRestoreReason(e.target.value)}
                >
                  <option>Payment Received</option>
                  <option>Terms Violation Resolved</option>
                  <option>Contract Renewed</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="r-form-group">
                <label className="r-form-label">
                  Additional Remarks (Optional)
                </label>
                <textarea
                  className="r-form-textarea"
                  placeholder="Enter details here..."
                  value={restoreReason}
                  onChange={(e) => setRestoreNotes(e.target.value)}
                ></textarea>
              </div>
              <div className="r-modal-actions">
                <button
                  className="r-btn-cancel"
                  onClick={() => setShowRestoreModal(false)}
                >
                  Cancel
                </button>
                <button className="r-btn-success" onClick={handleRestore}>
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
                    style={{ marginRight: "10px" }}
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
                  className="r-btn-danger"
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

    </>
  );
};

export default ArchivedUsers;
