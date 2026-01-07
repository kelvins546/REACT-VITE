import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Admins.css";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";

const Admins = () => {
  const sampleAdmins = [
    {
      id: 1,
      initials: "LC",
      name: "Leo Carlo",
      email: "admin3@gmail.com",
      role: "admin",
      status: "active",
      color: "#1f6fff",
    },
    {
      id: 2,
      initials: "KA",
      name: "Kelvin Arnold",
      email: "admin2@gmail.com",
      role: "admin",
      status: "active",
      color: "#1f6fff",
    },
    {
      id: 3,
      initials: "SA",
      name: "Super Admin",
      email: "superadmin@gmail.com",
      role: "super admin",
      status: "active",
      color: "#1f6fff",
    },
  ];

  const currentUserRole = "super admin";

  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Inactive');
  const reasons = ['Inactive','Employee has left the organization', 'Security Concerns', 'Duplicate Account', 'Other'];


  const [loader, setLoader] = useState({
    show: false,
    message: "Processing...",
  });

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [archiveAdmin, setArchiveAdmin] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  const [editFormData, setEditFormData] = useState({ name: "" });

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^ ,;:<>()\\/]+@(gmail\.com|yahoo\.com)$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  const errors = {
    name:
      newAdmin.name === ""
        ? " "
        : !nameRegex.test(newAdmin.name)
          ? "Name must contain letters only"
          : "",
    email:
      newAdmin.email === ""
        ? " "
        : !emailRegex.test(newAdmin.email)
          ? "Invalid email format"
          : "",
    password:
      newAdmin.password === ""
        ? " "
        : !passwordRegex.test(newAdmin.password)
          ? "Must be 8+ chars, 1 uppercase, 1 lowercase & 1 special character"
          : "",
    confirmPassword:
      newAdmin.confirmPassword === ""
        ? " "
        : newAdmin.password !== newAdmin.confirmPassword
          ? "Passwords do not match"
          : "",
  };

  const isFormValid =
    newAdmin.name.trim() &&
    newAdmin.email.trim() &&
    newAdmin.password.trim() &&
    newAdmin.confirmPassword.trim() &&
    !errors.name.trim() &&
    !errors.email.trim() &&
    !errors.password.trim() &&
    !errors.confirmPassword.trim();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAdminsList(sampleAdmins);
      setLoading(false);
    }, 800);
  }, []);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const handleCreateAdmin = () => {
    setLoader({ show: true, message: "Creating Admin..." });

    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        initials: getInitials(newAdmin.name),
        name: newAdmin.name,
        email: newAdmin.email,
        role: "admin",
        status: "active",
        color: "#1f6fff",
      };

      setAdminsList((prev) => [newUser, ...prev]);
      setLoader({ show: false, message: "Processing..." });

      setNotification({
        show: true,
        title: "Admin Created",
        message: "Admin account created successfully.",
        variant: "success",
        icon: "check_circle",
      });

      setShowCreateModal(false);
      setNewAdmin({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
      });
    }, 1200);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({ name: admin.name });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = () => {
    setLoader({ show: true, message: "Updating Admin..." });

    setTimeout(() => {
      setAdminsList((prev) =>
        prev.map((admin) =>
          admin.id === selectedAdmin.id
            ? { ...admin, name: editFormData.name }
            : admin
        )
      );

      setLoader({ show: false, message: "Processing..." });
      setNotification({
        show: true,
        title: "Admin Updated",
        message: "Admin details updated successfully.",
        variant: "success",
        icon: "check_circle",
      });

      setShowEditModal(false);
    }, 1000);
  };

  const openArchiveModal = (admin) => {
    setArchiveAdmin(admin);
    setShowArchiveModal(true);
  };

  const handleArchiveAdmin = () => {
    setLoader({ show: true, message: "Archiving Admin..." });

    setTimeout(() => {
      setAdminsList((prev) =>
        prev.map((admin) =>
          admin.id === archiveAdmin.id
            ? { ...admin, status: "archived" }
            : admin
        )
      );

      setLoader({ show: false, message: "Processing..." });
      setNotification({
        show: true,
        title: "Admin Archived",
        message: "The admin has been archived successfully.",
        variant: "warning",
        icon: "archive",
      });

      setShowArchiveModal(false);
    }, 1200);
  };

  const filteredAdmins = adminsList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div>
          <div className="page-title">Admin Management</div>
          <div style={{ color: "#888", fontSize: "14px", marginTop: "5px" }}>
            Manage system access and team roles.
          </div>
        </div>
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
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/users/admins/archived"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              inventory_2
            </span>
            Archived
          </Link>

          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              add
            </span>
            Add New Admin
          </button>
        </div>

      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
            <PuffLoader color="#0055ff" size={40} />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  style={{ opacity: admin.status === "archived" ? 0.5 : 1 }}
                >
                  <td>
                    <div className="user-cell">
                      <div
                        className="u-avatar"
                        style={{ background: admin.color }}
                      >
                        {admin.initials}
                      </div>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {admin.name}
                        {admin.role === "super admin" && (
                          <span
                            className="material-icons"
                            style={{
                              fontSize: "12px",
                              color: "#ffd700",
                              marginLeft: "6px",
                            }}
                            title="Super Admin"
                          >
                            verified
                          </span>
                        )}
                        <br />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            fontWeight: 400,
                          }}
                        >
                          {admin.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className="status-pill"
                      style={{
                        background:
                          admin.role === "super admin"
                            ? "rgba(255, 215, 0, 0.15)"
                            : "rgba(0, 85, 255, 0.15)",
                        color:
                          admin.role === "super admin" ? "#ffd700" : "#0055ff",
                      }}
                    >
                      {admin.role.toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <span
                      className="status-dot"
                      style={{
                        background:
                          admin.status === "archived"
                            ? "#666"
                            : "var(--primary)",
                      }}
                    ></span>{" "}
                    {admin.status === "archived" ? "Archived" : "Active"}
                  </td>

                  <td>
                    <div className="action-cell">
                      {(admin.role !== "super admin" ||
                        currentUserRole === "super admin") && (
                          <button
                            className="icon-btn edit-user-btn"
                            title="Edit Admin"
                            onClick={() => openEditModal(admin)}
                          >
                            <span className="material-icons">edit</span>
                          </button>
                        )}

                      {admin.role !== "super admin" &&
                        admin.status !== "archived" && (
                          <button
                            className="icon-btn archive-user-btn"
                            title="Archive Admin"
                            onClick={() => openArchiveModal(admin)}
                          >
                            <span className="material-icons">archive</span>
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


      { }
      {showCreateModal && (
        <div className="a-modal-overlay">
          <div className="a-modal-container">
            <div className="a-modal-header">
              <div className="a-modal-title">Create New Admin</div>
              <button
                className="a-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="a-modal-body">
              <div className="a-form-grid">

                <div className="a-form-group">
                  <label className="a-form-label">Full Name</label>
                  <div className="a-input-wrapper">
                    <input
                      type="text"
                      className="a-form-input"
                      value={newAdmin.name}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[0-9]/g, "");
                        setNewAdmin({ ...newAdmin, name: value });
                      }}
                    />
                  </div>
                  {errors.name && (
                    <span className="a-form-error">{errors.name}</span>
                  )}
                </div>

                <div className="a-form-group">
                  <label className="a-form-label">Email Address</label>
                  <div className="a-input-wrapper">
                    <input
                      type="email"
                      className="a-form-input"
                      value={newAdmin.email}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, email: e.target.value })
                      }
                    />
                  </div>
                  {errors.email && (
                    <span className="a-form-error">{errors.email}</span>
                  )}
                </div>

                <div className="a-form-group">
                  <label className="a-form-label">Password</label>
                  <div className="a-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="a-form-input"
                      value={newAdmin.password}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, password: e.target.value })
                      }
                    />
                    <span
                      className="material-icons a-eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </div>
                  {errors.password && (
                    <span className="a-form-error">{errors.password}</span>
                  )}
                </div>

                <div className="a-form-group">
                  <label className="a-form-label">Confirm Password</label>
                  <div className="a-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="a-form-input"
                      value={newAdmin.confirmPassword}
                      onChange={(e) =>
                        setNewAdmin({
                          ...newAdmin,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <span
                      className="material-icons a-eye-icon"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <span className="a-form-error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className="a-form-group">
                  <label className="a-form-label">Assign Role</label>
                  <select
                    className="a-form-select"
                    value={newAdmin.role}
                    disabled
                  >
                    <option value="admin">System Admin (Full Access)</option>
                  </select>
                </div>

              </div>

              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="a-btn-create"
                  onClick={handleCreateAdmin}
                  disabled={!isFormValid}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>


      )}

      { }
      {showEditModal && selectedAdmin && (
        <div className="a-modal-overlay">
          <div className="a-modal-container" style={{ maxWidth: "400px" }}>
            <div className="a-modal-header">
              <div className="a-modal-title">Edit Admin</div>
              <button
                className="a-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="a-modal-body">
              <div className="a-form-group">
                <label className="a-form-label">Full Name</label>
                <div className="a-input-wrapper">
                  <input
                    type="text"
                    className="a-form-input"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="a-form-group" style={{ marginTop: "10px" }}>
                <label className="a-form-label">Email (Read-only)</label>
                <div className="a-input-wrapper">
                  <input
                    type="email"
                    className="a-form-input"
                    value={selectedAdmin.email}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                </div>
              </div>
              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button className="a-btn-create" onClick={handleUpdateAdmin}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      { }
      {showArchiveModal && archiveAdmin && (
        <div className="u-modal-overlay">
          <div className="u-modal-container archive-mode">
            <div className="u-modal-header" style={{ borderBottom: "none" }}>
              <div className="u-modal-title" style={{ color: "var(--warning)" }}>
                <span className="material-icons">warning</span> Archive Admin
              </div>
              <button
                className="u-close-btn"
                onClick={() => setShowArchiveModal(false)}
              >
                <span className="material-icons">close</span>
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
                <strong>{archiveAdmin.name}</strong>? This action will restrict
                their access to the platform immediately.
              </p>
              <div className="complaint-dropdown">
                <button
                  className={`dropdown-button ${reasonsOpen ? 'open' : ''}`}
                  onClick={() => setReasonsOpen(!reasonsOpen)}
                >
                  <span>{selectedReason}</span>
                  <span className="material-symbols-outlined"
                    style={{
                      transform: reasonsOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "0.3s"
                    }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>
                {reasonsOpen && (
                  <ul className="complaints-dropdown-menu options-list">
                    {reasons.map((cat) => (
                      <li
                        key={cat}
                        className={`dropdown-option ${selectedReason === cat ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedReason(cat);
                          setReasonsOpen(false);
                        }}
                      >
                        <span>{cat}</span>
                        {selectedReason === cat && <span className="checkmark material-symbols-outlined">
                          check
                        </span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="u-form-group" style={{ paddingTop: '7px' }}>
                <label className="u-form-label">
                  Additional Remarks (Optional)
                </label>
                <textarea
                  className="u-form-textarea"
                  placeholder="Enter details here..."
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                ></textarea>
              </div>
              <div className="u-modal-actions">
                <button
                  className="u-btn-cancel"
                  onClick={() => setShowArchiveModal(false)}
                >
                  Cancel
                </button>
                <button className="u-btn-danger" onClick={handleArchiveAdmin}>
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
    </>
  );
};

export default Admins;
