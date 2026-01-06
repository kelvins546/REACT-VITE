import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { createClient } from "@supabase/supabase-js";
import "./Admins.css";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";

const SUPABASE_URL = "https://grgkznbbfedbipxuwkdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_C9Vr_lDZsic_RsvJ2aM9Bg_l9ag2A0L";

const Admins = () => {
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [loader, setLoader] = useState({
    show: false,
    message: "Processing..."
  });

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info"
  });


  const [currentUserRole, setCurrentUserRole] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        : !passwordRegex.test(newAdmin.password)
          ? " "
          : newAdmin.password !== newAdmin.confirmPassword
            ? "Passwords do not match"
            : "",
  };

  const isFormValid =
    !errors.name.trim() &&
    !errors.email.trim() &&
    !errors.password.trim() &&
    !errors.confirmPassword.trim() &&
    newAdmin.name &&
    newAdmin.email &&
    newAdmin.password &&
    newAdmin.confirmPassword;



  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "" });

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveAdmin, setArchiveAdmin] = useState(null);

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUserRole();
  }, []);

  const fetchCurrentUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data) setCurrentUserRole(data.role);
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("role", ["admin", "super admin"])
        .order("joined_at", { ascending: false });

      if (error) throw error;

      const mappedAdmins = data.map((u) => ({
        id: u.id,
        initials: getInitials(u.full_name),
        name: u.full_name,
        email: u.email,
        role: u.role,
        status: u.status || "Active",
        avatar_url: u.avatar_url,
        color: "#0055ff",
      }));

      setAdminsList(mappedAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoader({
      show: true,
      message: "Creating User..."
    });
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      setNotification({
        show: true,
        title: "Missing information",
        message: "Please fill in all fields.",
        variant: "warning",
        icon: "warning"
      });
      setLoader({
        show: false,
        message: "Processing..."
      });
      return;
    }

    if (SUPABASE_URL.includes("PASTE") || SUPABASE_ANON_KEY.includes("PASTE")) {
      setNotification({
        show: true,
        title: "Configuration error",
        message: "Supabase keys are missing or invalid.",
        variant: "error",
        icon: "error"
      });
      + setLoader({ show: false, message: "Processing..." });
      return;
    }


    try {
      setLoading(true);

      const tempSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      const { data: authData, error: authError } =
        await tempSupabase.auth.signUp({
          email: newAdmin.email,
          password: newAdmin.password,
          options: {
            data: {
              full_name: newAdmin.name,
              role: "admin",
            },
          },
        });

      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            email: newAdmin.email,
            full_name: newAdmin.name,
            role: "admin",
            status: "active",
          },
        ]);

        if (dbError && dbError.code !== "23505") throw dbError;
      }

      setNotification({
        show: true,
        title: "Admin created",
        message: `Successfully created admin: ${newAdmin.email}`,
        variant: "success",
        icon: "check_circle"
      });
      setShowCreateModal(false);
      setNewAdmin({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins();
    } catch (error) {
      setNotification({
        show: true,
        title: "Creation failed",
        message: error.message,
        variant: "error",
        icon: "error"
      });
    } finally {
      setLoading(false);
      setLoader({
        show: false,
        message: "Processing..."
      });
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({ name: admin.name });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    setLoader({
      show: true,
      message: "Updating User..."
    });

    if (!editFormData.name) {
      setNotification({
        show: true,
        title: "Invalid input",
        message: "Name cannot be empty.",
        variant: "warning",
        icon: "warning"
      });
      + setLoader({ show: false, message: "Processing..." });
      return;
    }


    try {
      setLoading(true);
      const { error } = await supabase
        .from("users")
        .update({ full_name: editFormData.name })
        .eq("id", selectedAdmin.id);

      if (error) throw error;

      setNotification({
        show: true,
        title: "Admin updated",
        message: "Admin details were updated successfully.",
        variant: "success",
        icon: "check_circle"
      });
      setShowEditModal(false);
      fetchAdmins();
    } catch (error) {
      setNotification({
        show: true,
        title: "Update failed",
        message: error.message,
        variant: "error",
        icon: "error"
      });
    } finally {
      setLoading(false);
      setLoader({
        show: false,
        message: "Processing..."
      });
    }
  };

  const openArchiveModal = (admin) => {
    setArchiveAdmin(admin);
    setShowArchiveModal(true);
  };

  const handleArchiveAdmin = async () => {
    try {
      setLoading(true);
      setLoader({
        show: true,
        message: "Archiving Admin..."
      });
      const { error } = await supabase
        .from("users")
        .update({ status: "archived" })
        .eq("id", archiveAdmin.id);

      if (error) throw error;

      setNotification({
        show: true,
        title: "Admin archived",
        message: "The admin has been archived successfully.",
        variant: "warning",
        icon: "archive"
      });

      setShowArchiveModal(false);
      fetchAdmins();
    } catch (error) {
      setNotification({
        show: true,
        title: "Archive failed",
        message: error.message,
        variant: "error",
        icon: "error"
      });

    } finally {
      setLoading(false);
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
      : "AD";

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
                        border: "1px solid transparent",
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
                      { }
                      {(admin.role !== "super admin" ||
                        currentUserRole === "super admin") && (
                          <button
                            className="icon-btn edit-user-btn"
                            title="Edit Admin"
                            onClick={() => openEditModal(admin)}
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "18px" }}
                            >
                              edit
                            </span>
                          </button>
                        )}

                      { }
                      {admin.role !== "super admin" &&
                        admin.status !== "archived" && (
                          <button
                            className="icon-btn archive-user-btn"
                            title="Archive Admin"
                            onClick={() => openArchiveModal(admin)}
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
                <input
                  type="text"
                  className="a-form-input"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>
              <div className="a-form-group" style={{ marginTop: "10px" }}>
                <label className="a-form-label">Email (Read-only)</label>
                <input
                  type="email"
                  className="a-form-input"
                  value={selectedAdmin.email}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
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
              <div className="u-form-group">
                <label className="u-form-label">Reason for Archiving</label>
                <select
                  className="u-form-select"
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                >
                  <option>Inactive</option>
                  <option>Employee has left the organization</option>
                  <option>Security Concerns</option>
                  <option>Duplicate Account</option>
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
