import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { createClient } from "@supabase/supabase-js";
import "./Admins.css";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";

const SUPABASE_URL = "https://grgkznbbfedbipxuwkdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_C9Vr_lDZsic_RsvJ2aM9Bg_l9ag2A0L";

const Admins = () => {
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      setNotification({
        show: true,
        title: "Missing information",
        message: "Please fill in all fields.",
        variant: "warning",
        icon: "warning"
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
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({ name: admin.name });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editFormData.name) {
      setNotification({
        show: true,
        title: "Invalid input",
        message: "Name cannot be empty.",
        variant: "warning",
        icon: "warning"
      });
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
    }
  };

  const openArchiveModal = (admin) => {
    setArchiveAdmin(admin);
    setShowArchiveModal(true);
  };

  const handleArchiveAdmin = async () => {
    try {
      setLoading(true);
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
                      {/* CONDITION: 
                        Show Edit button only if:
                        1. The target is NOT a super admin
                        OR
                        2. The current logged-in user IS a super admin 
                      */}
                      {(admin.role !== "super admin" ||
                        currentUserRole === "super admin") && (
                          <button
                            className="icon-btn"
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
                            className="icon-btn"
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
                  <input
                    type="text"
                    className="a-form-input"
                    value={newAdmin.name}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, name: e.target.value })
                    }
                  />
                </div>
                <div className="a-form-group">
                  <label className="a-form-label">Email Address</label>
                  <input
                    type="email"
                    className="a-form-input"
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                  />
                </div>
                <div className="a-form-group">
                  <label className="a-form-label">Password</label>
                  <input
                    type="password"
                    className="a-form-input"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                  />
                </div>
                <div className="a-form-group">
                  <label className="a-form-label">Assign Role</label>
                  <select
                    className="a-form-select"
                    value={newAdmin.role}
                    disabled={true}
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
                <button className="a-btn-create" onClick={handleCreateAdmin}>
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
              <div className="a-form-group">
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
        <div className="a-modal-overlay">
          <div className="a-modal-container" style={{ maxWidth: "400px" }}>
            <div className="a-modal-header" style={{ borderBottom: "none" }}>
              <div className="a-modal-title" style={{ color: "var(--danger)" }}>
                Archive Admin
              </div>
              <button
                className="a-close-btn"
                onClick={() => setShowArchiveModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="a-modal-body">
              <p style={{ color: "#ccc", marginBottom: "20px" }}>
                Are you sure you want to archive{" "}
                <strong>{archiveAdmin.name}</strong>?
                <br />
                <br />
                They will lose access to the system immediately.
              </p>
              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowArchiveModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="a-btn-create"
                  style={{ background: "var(--danger)" }}
                  onClick={handleArchiveAdmin}
                >
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
