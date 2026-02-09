import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ArchivedUsers.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { supabase } from "../../supabaseClient";
import "../../components/dropdowns/searchableDropdown.css";

const ArchivedAdmins = () => {
    const navigate = useNavigate();
    const [restoreModal, setShowRestoreModal] = useState(false);
    const [restoreReason, setRestoreReason] = useState("Payment Received");
    const [restoreNotes, setRestoreNotes] = useState("");
    const [deleteModal, setShowDeleteModal] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isRestoreReasonDropdownOpen, setIsRestoreReasonDropdownOpen] = useState(false);

    const [showResetModal, setShowResetModal] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showModal, setShowModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [viewUserHubs, setViewUserHubs] = useState([]);
    const [viewStats, setViewStats] = useState({ alerts: 0, registeredHubs: 0 });

    const [archivedUsers, setArchivedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const buildFullName = (first, last) =>
        [first, last].filter(Boolean).join(" ").trim();

    const getInitials = (name) =>
        name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "??";

    const fetchArchivedUsers = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("status", "archived")
                .eq("role", "admin")
                .order("archived_at", { ascending: false });

            if (error) throw error;

            const mappedUsers = (data || []).map((u) => {
                const fullName =
                    buildFullName(u.first_name, u.last_name) || "Unknown Admin";

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
                };
            });

            setArchivedUsers(mappedUsers);
        } catch (err) {
            console.error("Error fetching archived admins:", err);
            setArchivedUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchivedUsers();
    }, []);

    useEffect(() => {
        if (!deleteModal) setConfirmDelete(false);
    }, [deleteModal]);

    const filteredUsers = archivedUsers.filter((user) =>
        `${user.name} ${user.email} ${user.unit}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleRestore = async () => {
        if (selectedUsers.length === 0) return;

        setLoader({ show: true, message: "Restoring Admin..." });

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
                title: "Admin restored",
                message: "The admin has been restored successfully.",
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
            setLoader({ show: false, message: "Processing..." });
        }
    };

    /* =========================
       DELETE ARCHIVED ADMIN(S)
       ========================= */
    const handleDelete = async () => {
        if (selectedUsers.length === 0) return;

        setLoader({ show: true, message: "Deleting Admin..." });

        try {
            const { error } = await supabase
                .from("users")
                .delete()
                .in("id", selectedUsers);

            if (error) throw error;

            setArchivedUsers((prev) =>
                prev.filter((user) => !selectedUsers.includes(user.id))
            );

            setNotification({
                show: true,
                title: "Admin deleted",
                message: `${selectedUsers.length} admin${selectedUsers.length > 1 ? "s" : ""} permanently deleted.`,
                variant: "success",
                icon: "check_circle",
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
                icon: "error",
            });
        } finally {
            setLoader({ show: false, message: "Processing..." });
        }
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
                    <div className="page-title">Archived Admins</div>
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
                        to="/users/admins"
                        className="btn btn-secondary"
                        style={{ textDecoration: "none" }}
                    >
                        <span className="material-icons" style={{ fontSize: "18px" }}>
                            arrow_back
                        </span>
                        Back to Active
                    </Link>
                    {/* <button
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
                    </button>*/}


                </div>
            </div>

            { }
            <div className="table-container">
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

                                <th>Archived Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            { }
                            {paginatedUsers.map((user) => (

                                <tr key={user.id}>
                                    {/*<td>
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

                                    <td style={{ color: "#888" }}>{user.archivedDate}</td>

                                    <td>
                                        <span className="stat-badge stat-archived">Archived</span>
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
                                            {/*<button
                                                className="icon-btn btn-delete"
                                                onClick={() => {
                                                    setSelectedUsers([user.id]);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <span className="material-icons">delete_forever</span>
                                            </button> */}

                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                )}

                { }
                {filteredUsers.length > 0 && (
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
                                <span className="material-icons restore">restore</span> <span style={{ color: "var(--primary)" }}>Restore Account</span>
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
                                ></textarea>
                            </div>
                            <div className="r-modal-actions">
                                <button
                                    className="r-btn-cancel"
                                    onClick={() => setShowRestoreModal(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary-modal" onClick={handleRestore}>
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

        </>
    );
};

export default ArchivedAdmins;
