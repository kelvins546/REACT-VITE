import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { createClient } from "@supabase/supabase-js";
import "./Admins.css";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";

const SUPABASE_URL = "https://grgkznbbfedbipxuwkdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_C9Vr_lDZsic_RsvJ2aM9Bg_l9ag2A0L";

const Admins = () => {
  const navigate = useNavigate();
  const [adminsList, setAdminsList] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loader, setLoader] = useState({ show: false, message: "Processing..." });
  const [archiveReason, setArchiveReason] = useState("");

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info",
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [archiveAdmin, setArchiveAdmin] = useState(null);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^ ,;:<>()\\/]+@(gmail\.com|yahoo\.com)$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  const errors = {
    first_name:
      newAdmin.first_name === ""
        ? " "
        : !nameRegex.test(newAdmin.first_name)
          ? "Name must contain letters only"
          : "",
    last_name:
      newAdmin.last_name === ""
        ? ""
        : !nameRegex.test(newAdmin.last_name)
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

  const isFormValid = Boolean(
    newAdmin.first_name?.trim() &&
    newAdmin.email?.trim() &&
    newAdmin.password &&
    newAdmin.confirmPassword &&
    newAdmin.password === newAdmin.confirmPassword &&
    !errors.first_name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword
  );

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({ name: admin.name });
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);


  const buildFullName = (first, last) =>
    [first, last].filter(Boolean).join(" ").trim();

  const splitFullName = (name) => {
    const parts = name.trim().split(" ");
    return {
      first_name: parts.shift() || "",
      last_name: parts.join(" ") || "",
    };
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


  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("role", ["admin", "super admin"])
        .eq("status", "active")
        .order("joined_at", { ascending: false });

      if (error) throw error;

      const mappedAdmins = data.map((u) => {
        const fullName = buildFullName(u.first_name, u.last_name);

        return {
          id: u.id,
          name: fullName || "Unknown Admin",
          initials: getInitials(fullName || u.email),
          email: u.email || "",
          role: u.role,
          status: u.status,
          avatar_url: u.avatar_url,
          color: u.role === "super admin" ? "#ffd700" : "#0055ff",
        };
      });

      setAdminsList(mappedAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateAdmin = async () => {
    setLoader({ show: true, message: "Creating User..." });

    if (!newAdmin.email || !newAdmin.password || !newAdmin.first_name) {
      setNotification({
        show: true,
        title: "Missing information",
        message: "First name, email, and password are required.",
        variant: "warning",
        icon: "warning",
      });
      setLoader({ show: false, message: "Processing..." });
      return;
    }

    try {
      setLoading(true);

      const first_name = newAdmin.first_name.trim();
      const last_name = newAdmin.last_name?.trim() || "";

      const tempSupabase = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } =
        await tempSupabase.auth.signUp({
          email: newAdmin.email,
          password: newAdmin.password,
          options: {
            data: {
              role: "admin",
              first_name,
              last_name,
            },
          },
        });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: dbError } = await supabase
          .from("users")
          .upsert(
            {
              id: authData.user.id,
              email: newAdmin.email,
              role: "admin",
              status: "active",

              first_name,
              last_name,

              region: "",
              city: "",
              zip_code: "",
              street_address: "",

              phone_number: null,
              avatar_url: null,
              archived_at: null,
            },
            { onConflict: "id" }
          );

        if (dbError) throw dbError;


        if (dbError) throw dbError;
      }

      setNotification({
        show: true,
        title: "Admin created",
        message: `Successfully created admin: ${newAdmin.email}`,
        variant: "success",
        icon: "check_circle",
      });

      setShowCreateModal(false);
      setNewAdmin({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "admin",
      });

      fetchAdmins();
    } catch (error) {
      setNotification({
        show: true,
        title: "Creation failed",
        message: error.message,
        variant: "error",
        icon: "error",
      });
    } finally {
      setLoading(false);
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleUpdateAdmin = async () => {
    setLoader({ show: true, message: "Updating Admin..." });

    try {
      const { first_name, last_name } = splitFullName(editFormData.name);

      await supabase
        .from("users")
        .update({ first_name, last_name })
        .eq("id", selectedAdmin.id);

      setNotification({
        show: true,
        title: "Admin Updated",
        message: "Admin details updated successfully.",
        variant: "success",
        icon: "check_circle",
      });

      setShowEditModal(false);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      setNotification({
        show: true,
        title: "Error",
        message: "Failed to update admin.",
        variant: "error",
        icon: "alert",
      });
    } finally {
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleArchiveAdmin = async () => {
    setLoader({ show: true, message: "Archiving Admin..." });

    try {
      await supabase
        .from("users")
        .update({ status: "archived", archived_at: new Date().toISOString() })
        .eq("id", archiveAdmin.id);

      setLoader({ show: false, message: "Processing..." });
      setNotification({
        show: true,
        title: "Admin Archived",
        message: "The admin has been archived successfully.",
        variant: "warning",
        icon: "archive",
      });

      setShowArchiveModal(false);
      fetchAdmins();
    } catch (err) {
      setLoader({ show: false, message: "Processing..." });
      console.error(err);
      setNotification({
        show: true,
        title: "Error",
        message: "Failed to archive admin.",
        variant: "warning",
        icon: "alert",
      });
    }
  };

  const safeSearchTerm = (searchTerm || "").toLowerCase();

  const filteredAdmins = adminsList.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(safeSearchTerm) ||
      (u.email || "").toLowerCase().includes(safeSearchTerm)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  useEffect(() => {
    if (currentPage < 1) setCurrentPage(1);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const openArchiveModal = (admin) => {
    setArchiveAdmin(admin);
    setShowArchiveModal(true);
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
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    No admins found.
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((admin) => (
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
                        className={`stat-badge ${
                          admin.role === "super admin"
                            ? "stat-super-admin"
                            : "stat-admin"
                        }`}
                      >
                        {admin.role === "super admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`stat-badge ${
                          admin.status === "archived"
                            ? "stat-archived"
                            : "stat-active"
                        }`}
                      >
                        {admin.status === "archived" ? "Archived" : "Active"}
                      </span>
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
                              <span
                                className="material-icons"
                                style={{ fontSize: "18px" }}
                              >
                                edit
                              </span>
                            </button>
                          )}

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
                ))
              )}
            </tbody>

          </table>

        )}
        {!loading && (
          <div className="a-pagination">
            <div style={{ fontSize: "14px", color: "#666" }}>
              {filteredAdmins.length === 0 ? (
                "Showing 0–0 of 0"
              ) : (
                <>
                  Showing {(currentPage - 1) * itemsPerPage + 1}
                  {"–"}
                  {Math.min(currentPage * itemsPerPage, filteredAdmins.length)} of{" "}
                  {filteredAdmins.length}
                </>
              )}
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
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="a-form-group">
                    <label className="a-form-label">First Name</label>
                    <div className="a-input-wrapper">
                      <input
                        type="text"
                        className="a-form-input"
                        value={newAdmin.first_name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[0-9]/g, "");
                          setNewAdmin({ ...newAdmin, first_name: value });
                        }}
                      />
                    </div>
                    {errors.first_name && (
                      <span className="a-form-error">{errors.first_name}</span>
                    )}
                  </div>

                  <div className="a-form-group">
                    <label className="a-form-label">Last Name (Optional)</label>
                    <div className="a-input-wrapper">
                      <input
                        type="text"
                        className="a-form-input"
                        value={newAdmin.last_name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[0-9]/g, "");
                          setNewAdmin({ ...newAdmin, last_name: value });
                        }}
                      />
                    </div>
                    {errors.last_name && (
                      <span className="a-form-error">{errors.last_name}</span>
                    )}
                  </div>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                  className="btn btn-primary-modal"
                  onClick={handleCreateAdmin}
                  disabled={!isFormValid}
                  style={{
                    opacity: !isFormValid ? 0.5 : 1,
                    cursor: !isFormValid ? "not-allowed" : "pointer",
                  }}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                <div className="a-form-group">
                  <label className="a-form-label">Email (Read-only)</label>
                  <div className="a-input-wrapper" style={{ opacity: 0.6 }}>
                    <input
                      type="email"
                      className="a-form-input"
                      value={selectedAdmin.email}
                      disabled
                      style={{ cursor: "not-allowed" }}
                    />
                  </div>
                </div>
              </div>
              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary-modal" onClick={handleUpdateAdmin}>
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