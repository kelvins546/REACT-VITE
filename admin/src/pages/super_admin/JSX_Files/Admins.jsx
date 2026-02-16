import React, { useState, useEffect, useLayoutEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { createClient } from "@supabase/supabase-js";
import emailjs from "@emailjs/browser";
import "../CSS_Files/Admins.css";
import "../../../components/dropdowns/searchableDropdown.css";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../../components/loaders/LoadingPopUp";

const SUPABASE_URL = "https://grgkznbbfedbipxuwkdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_C9Vr_lDZsic_RsvJ2aM9Bg_l9ag2A0L";

const Admins = () => {
  const navigate = useNavigate();
  const [adminsList, setAdminsList] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const outletContext = useOutletContext();
  const { setLoading, setLoadingMessage } = outletContext || {
    setLoading: () => {},
    setLoadingMessage: () => {},
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [loader, setLoader] = useState({
    show: false,
    message: "Processing...",
  });
  const [archiveReason, setArchiveReason] = useState("Inactive");
  const [archiveNotes, setArchiveNotes] = useState("");
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [createMode, setCreateMode] = useState("create"); // create | invite
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpResendAvailableAt, setOtpResendAvailableAt] = useState(0);
  const [otpResendRemaining, setOtpResendRemaining] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const [archiveAdmin, setArchiveAdmin] = useState(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isArchiveReasonDropdownOpen, setIsArchiveReasonDropdownOpen] =
    useState(false);
  const [showInviteConfirmation, setShowInviteConfirmation] = useState(false);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^ ,;:<>()\\/]+@(gmail\.com|yahoo\.com)$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
  const OTP_TTL_MS = 5 * 60 * 1000;
  const OTP_RESEND_COOLDOWN_MS = 3 * 60 * 1000;
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
  const EMAILJS_INVITE_TEMPLATE_ID =
    import.meta.env.VITE_EMAILJS_INVITE_TEMPLATE_ID || "";
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

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

  const isCreateFormValid = Boolean(
    newAdmin.first_name?.trim() &&
    newAdmin.email?.trim() &&
    newAdmin.password &&
    newAdmin.confirmPassword &&
    newAdmin.password === newAdmin.confirmPassword &&
    !errors.first_name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword,
  );
  const isInviteFormValid = Boolean(newAdmin.email?.trim() && !errors.email);

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const chars = otpInput.split("");
    while (chars.length < 6) chars.push(" ");

    chars[index] = val;
    if (!val) chars[index] = " ";

    setOtpInput(chars.join(""));

    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if ((!otpInput[index] || otpInput[index] === " ") && index > 0) {
        e.preventDefault();
        const chars = otpInput.split("");
        while (chars.length < 6) chars.push(" ");
        chars[index - 1] = " ";
        setOtpInput(chars.join(""));
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (/^\d+$/.test(data)) {
      const pasted = data.slice(0, 6).split("");
      const chars = Array(6).fill(" ");
      for (let i = 0; i < pasted.length; i++) chars[i] = pasted[i];
      setOtpInput(chars.join(""));
      document.getElementById(`otp-${Math.min(pasted.length - 1, 5)}`)?.focus();
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    const { first_name, last_name } = splitFullName(admin.name || "");
    setEditFormData({ first_name, last_name });
    setShowEditModal(true);
  };

  useLayoutEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!showOtpModal) {
      setOtpResendRemaining(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, otpResendAvailableAt - Date.now());
      setOtpResendRemaining(remaining);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [showOtpModal, otpResendAvailableAt]);

  const buildFullName = (first, last) =>
    [first, last].filter(Boolean).join(" ").trim();

  const formatMs = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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
    setLoading(true);
    setLoadingMessage(
      navigator.onLine ? "Loading..." : "Check your internet connection...",
    );
    let timeoutId = setTimeout(() => {
      setLoadingMessage("Check your internet connection...");
    }, 5000);

    try {
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
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleCreateAdmin = async () => {
    setLoader({ show: true, message: "Creating User..." });
    setIsCreatingAdmin(true);

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

      const tempSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      const { data: authData, error: authError } =
        await tempSupabase.auth.signUp({
          email: newAdmin.email,
          password: newAdmin.password,
          options: {
            data: {
              role: newAdmin.role,
              first_name,
              last_name,
            },
          },
        });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: dbError } = await supabase.from("users").upsert(
          {
            id: authData.user.id,
            email: newAdmin.email,
            role: newAdmin.role,
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
          { onConflict: "id" },
        );

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
        confirmPassword: "",
        role: "admin",
      });
      setShowOtpModal(false);
      setOtpInput("");
      setOtpCode("");
      setOtpExpiresAt(0);
      setOtpResendAvailableAt(0);

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
      setIsCreatingAdmin(false);
    }
  };

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtpEmail = async (code) => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error("Email service is not configured.");
    }

    const fullName = buildFullName(newAdmin.first_name, newAdmin.last_name);
    const digits = code.split("");

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: newAdmin.email,
        to_name: fullName || newAdmin.email,
        otp_code: code,
        d1: digits[0],
        d2: digits[1],
        d3: digits[2],
        d4: digits[3],
        d5: digits[4],
        d6: digits[5],
      },
      EMAILJS_PUBLIC_KEY,
    );
  };

  const sendInviteEmail = async () => {
    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_INVITE_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY
    ) {
      throw new Error(
        "Invite email service is not configured. Set VITE_EMAILJS_INVITE_TEMPLATE_ID.",
      );
    }

    const fullName = buildFullName(newAdmin.first_name, newAdmin.last_name);

    // Generate the invitation link with query parameters
    const params = new URLSearchParams({
      email: newAdmin.email,
      first_name: newAdmin.first_name,
      last_name: newAdmin.last_name || "",
      role: newAdmin.role,
      invite: "1",
      expires: `${Date.now() + 24 * 60 * 60 * 1000}`,
    });

    const inviteLink = `${window.location.origin}/register?${params.toString()}`;

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_INVITE_TEMPLATE_ID,
      {
        to_email: newAdmin.email,
        to_name: fullName || newAdmin.email,
        invite_link: inviteLink,
        role: newAdmin.role,
      },
      EMAILJS_PUBLIC_KEY,
    );
  };

  const handleStartCreate = async () => {
    if (!isCreateFormValid) {
      setNotification({
        show: true,
        title: "Invalid form",
        message: "Please complete all required fields before continuing.",
        variant: "warning",
        icon: "warning",
      });
      return;
    }

    setLoader({ show: true, message: "Checking email..." });
    const exists = await checkEmailExists(newAdmin.email);
    setLoader({ show: false, message: "Processing..." });

    if (exists) {
      setNotification({
        show: true,
        title: "Email Taken",
        message: "This email is already registered.",
        variant: "error",
        icon: "error",
      });
      return;
    }

    setShowCreateConfirmation(true);
  };

  const confirmStartCreate = async () => {
    setShowCreateConfirmation(false);
    setLoader({ show: true, message: "Sending OTP..." });
    try {
      setIsSendingOtp(true);
      const code = generateOtp();
      setOtpCode(code);
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setOtpResendAvailableAt(Date.now() + OTP_RESEND_COOLDOWN_MS);
      await sendOtpEmail(code);
      setShowOtpModal(true);
      setNotification({
        show: true,
        title: "Verification sent",
        message: `An OTP was sent to ${newAdmin.email}.`,
        variant: "success",
        icon: "check_circle",
      });
    } catch (error) {
      setNotification({
        show: true,
        title: "Email failed",
        message:
          error?.message ||
          "Could not send the verification code. Please try again.",
        variant: "error",
        icon: "error",
      });
    } finally {
      setIsSendingOtp(false);
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleResendOtp = async () => {
    if (Date.now() < otpResendAvailableAt || isSendingOtp) return;

    setLoader({ show: true, message: "Resending OTP..." });
    try {
      setIsSendingOtp(true);
      const code = generateOtp();
      setOtpCode(code);
      setOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setOtpResendAvailableAt(Date.now() + OTP_RESEND_COOLDOWN_MS);
      setOtpInput("");
      await sendOtpEmail(code);
      setNotification({
        show: true,
        title: "OTP sent",
        message: `A new OTP was sent to ${newAdmin.email}.`,
        variant: "success",
        icon: "check_circle",
      });
    } catch (error) {
      setNotification({
        show: true,
        title: "Resend failed",
        message:
          error?.message ||
          "Could not resend the verification code. Please try again.",
        variant: "error",
        icon: "error",
      });
    } finally {
      setIsSendingOtp(false);
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleSendInvite = async () => {
    if (!isInviteFormValid) {
      setNotification({
        show: true,
        title: "Invalid form",
        message: "Please complete the required fields before sending.",
        variant: "warning",
        icon: "warning",
      });
      return;
    }

    setLoader({ show: true, message: "Checking email..." });
    const exists = await checkEmailExists(newAdmin.email);
    setLoader({ show: false, message: "Processing..." });

    if (exists) {
      setNotification({
        show: true,
        title: "Email Taken",
        message: "This email is already registered.",
        variant: "error",
        icon: "error",
      });
      return;
    }

    setShowInviteConfirmation(true);
  };

  const confirmSendInvite = async () => {
    setShowInviteConfirmation(false);
    setLoader({ show: true, message: "Sending Invite..." });
    try {
      setIsSendingInvite(true);
      await sendInviteEmail();
      setNotification({
        show: true,
        title: "Invite sent",
        message: `Invitation sent to ${newAdmin.email}.`,
        variant: "success",
        icon: "check_circle",
      });
      setShowCreateModal(false);
      setNewAdmin({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
      });
    } catch (error) {
      setNotification({
        show: true,
        title: "Invite failed",
        message:
          error?.message || "Could not send the invitation. Please try again.",
        variant: "error",
        icon: "error",
      });
    } finally {
      setIsSendingInvite(false);
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleVerifyOtp = () => {
    if (!otpCode || Date.now() > otpExpiresAt) {
      setNotification({
        show: true,
        title: "Code expired",
        message: "The OTP expired. Please resend a new code.",
        variant: "warning",
        icon: "warning",
      });
      return;
    }

    if (otpInput.replace(/\s/g, "") !== otpCode) {
      setNotification({
        show: true,
        title: "Invalid code",
        message: "The OTP you entered is incorrect.",
        variant: "error",
        icon: "error",
      });
      return;
    }

    handleCreateAdmin();
  };

  const handleUpdateAdmin = async () => {
    setLoader({ show: true, message: "Updating Admin..." });

    try {
      const first_name = editFormData.first_name.trim();
      const last_name = editFormData.last_name.trim();

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
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          archived_reason: archiveNotes ? `${archiveReason} - ${archiveNotes}` : archiveReason,
          restore_reason: null,
        })
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
      (u.email || "").toLowerCase().includes(safeSearchTerm),
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
    currentPage * itemsPerPage,
  );

  const openArchiveModal = (admin) => {
    setArchiveAdmin(admin);
    setArchiveNotes("");
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
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <LoadingPopup
        show={loader.show}
        message={loader.message}
        Loader={PuffLoader}
        color="#ffd700"
      />
      <div className="page-header">
        <div>
          <div className="page-title">Admin Management</div>
          <div className="page-desc">
            Manage system administrators and their access levels.
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
        <div className="table-container-scrollable">
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
        </div>
        {filteredAdmins.length > 0 && (
          <div className="a-pagination">
            <div style={{ fontSize: "14px", color: "#666" }}>
              {filteredAdmins.length === 0 ? (
                "Showing 0–0 of 0"
              ) : (
                <>
                  Showing {(currentPage - 1) * itemsPerPage + 1}
                  {"–"}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAdmins.length,
                  )}{" "}
                  of {filteredAdmins.length}
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`u-page-btn ${page === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}

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

      {}
      {showCreateModal && (
        <div className="a-modal-overlay">
          <div className="a-modal-container">
            <div className="a-modal-header">
              <div className="u-modal-title">
                <span class="material-symbols-outlined">person_add</span>
                <span>Create New Admin</span>
              </div>
              <button
                className="a-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="a-modal-body">
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "4px",
                  borderRadius: "10px",
                  display: "flex",
                  marginBottom: "24px",
                  border: "1px solid #333",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCreateMode("create")}
                  style={{
                    flex: 1,
                    background:
                      createMode === "create" ? "#333" : "transparent",
                    color: createMode === "create" ? "#fff" : "#888",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: "18px" }}>
                    person_add
                  </span>
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode("invite")}
                  style={{
                    flex: 1,
                    background:
                      createMode === "invite" ? "#333" : "transparent",
                    color: createMode === "invite" ? "#fff" : "#888",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: "18px" }}>
                    mail
                  </span>
                  Invite via Gmail
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {createMode === "create" && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div className="a-form-group">
                      <label className="a-form-label">First Name</label>
                      <div className="a-input-wrapper">
                        <span
                          className="material-icons input-icon"
                          style={{
                            color: "#666",
                            fontSize: "18px",
                            marginLeft: "12px",
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                          }}
                        >
                          badge
                        </span>
                        <input
                          type="text"
                          className="a-form-input"
                          style={{ paddingLeft: "40px" }}
                          value={newAdmin.first_name}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[0-9]/g, "");
                            setNewAdmin({ ...newAdmin, first_name: value });
                          }}
                          placeholder="e.g. John"
                        />
                      </div>
                      {errors.first_name && (
                        <span className="a-form-error">
                          {errors.first_name}
                        </span>
                      )}
                    </div>

                    <div className="a-form-group">
                      <label className="a-form-label">
                        Last Name (Optional)
                      </label>
                      <div className="a-input-wrapper">
                        <span
                          className="material-icons input-icon"
                          style={{
                            color: "#666",
                            fontSize: "18px",
                            marginLeft: "12px",
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                          }}
                        >
                          badge
                        </span>
                        <input
                          type="text"
                          className="a-form-input"
                          style={{ paddingLeft: "40px" }}
                          value={newAdmin.last_name}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[0-9]/g, "");
                            setNewAdmin({ ...newAdmin, last_name: value });
                          }}
                          placeholder="e.g. Doe"
                        />
                      </div>
                      {errors.last_name && (
                        <span className="a-form-error">{errors.last_name}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="a-form-group">
                  <label className="a-form-label">Email Address</label>
                  <div className="a-input-wrapper">
                    <span
                      className="material-icons input-icon"
                      style={{
                        color: "#666",
                        fontSize: "18px",
                        marginLeft: "12px",
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                      }}
                    >
                      email
                    </span>
                    <input
                      type="email"
                      className="a-form-input"
                      style={{ paddingLeft: "40px" }}
                      value={newAdmin.email}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                    />
                  </div>
                  {errors.email && (
                    <span className="a-form-error">{errors.email}</span>
                  )}
                </div>

                {createMode === "create" && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div className="a-form-group">
                      <label className="a-form-label">Password</label>
                      <div className="a-input-wrapper">
                        <span
                          className="material-icons input-icon"
                          style={{
                            color: "#666",
                            fontSize: "18px",
                            marginLeft: "12px",
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                          }}
                        >
                          lock
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="a-form-input"
                          style={{ paddingLeft: "40px" }}
                          value={newAdmin.password}
                          onChange={(e) =>
                            setNewAdmin({
                              ...newAdmin,
                              password: e.target.value,
                            })
                          }
                          placeholder="••••••••"
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
                        <span
                          className="material-icons input-icon"
                          style={{
                            color: "#666",
                            fontSize: "18px",
                            marginLeft: "12px",
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                          }}
                        >
                          lock_reset
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="a-form-input"
                          style={{ paddingLeft: "40px" }}
                          value={newAdmin.confirmPassword}
                          onChange={(e) =>
                            setNewAdmin({
                              ...newAdmin,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                        />
                        <span
                          className="material-icons a-eye-icon"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword
                            ? "visibility"
                            : "visibility_off"}
                        </span>
                      </div>
                      {errors.confirmPassword && (
                        <span className="a-form-error">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="a-form-group">
                  <label className="a-form-label">Assign Role</label>
                  <div
                    className="a-input-wrapper"
                    style={{ position: "relative", borderColor: "#333" }}
                  >
                    <span
                      className="material-icons input-icon"
                      style={{
                        color: "#666",
                        fontSize: "18px",
                        marginLeft: "12px",
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2,
                        pointerEvents: "none",
                      }}
                    >
                      admin_panel_settings
                    </span>
                    <button
                      type="button"
                      className="a-form-input"
                      style={{
                        paddingLeft: "40px",
                        paddingRight: 0,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    >
                      <span style={{ color: "#fff", fontSize: "14px" }}>
                        {newAdmin.role === "super admin"
                          ? "Super Admin"
                          : "System Admin"}
                      </span>
                      <span
                        className="material-icons"
                        style={{
                          fontSize: "18px",
                          color: "#666",
                          transform: isRoleDropdownOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "0.3s",
                        }}
                      >
                        keyboard_arrow_down
                      </span>
                    </button>

                    {isRoleDropdownOpen && (
                      <div
                        className="dropdown-menu"
                        style={{ width: "100%", zIndex: 100 }}
                      >
                        <ul className="options-list">
                          <li
                            className={`provider-option ${newAdmin.role === "admin" ? "selected" : ""}`}
                            onClick={() => {
                              setNewAdmin({ ...newAdmin, role: "admin" });
                              setIsRoleDropdownOpen(false);
                            }}
                          >
                            <div className="provider-info">
                              <div className="provider-name">System Admin</div>
                            </div>
                            {newAdmin.role === "admin" && (
                              <span className="checkmark material-symbols-outlined">
                                check
                              </span>
                            )}
                          </li>
                          <li
                            className={`provider-option ${newAdmin.role === "super admin" ? "selected" : ""}`}
                            onClick={() => {
                              setNewAdmin({ ...newAdmin, role: "super admin" });
                              setIsRoleDropdownOpen(false);
                            }}
                          >
                            <div className="provider-info">
                              <div className="provider-name">Super Admin</div>
                            </div>
                            {newAdmin.role === "super admin" && (
                              <span className="checkmark material-symbols-outlined">
                                check
                              </span>
                            )}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="a-modal-actions" style={{ marginTop: "30px" }}>
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                {createMode === "create" ? (
                  <button
                    className="btn btn-primary-modal"
                    onClick={handleStartCreate}
                    disabled={!isCreateFormValid || isSendingOtp}
                    style={{
                      opacity: !isCreateFormValid || isSendingOtp ? 0.5 : 1,
                      cursor:
                        !isCreateFormValid || isSendingOtp
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {isSendingOtp ? "Sending OTP..." : "Create Account"}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary-modal"
                    onClick={handleSendInvite}
                    disabled={!isInviteFormValid || isSendingInvite}
                    style={{
                      opacity: !isInviteFormValid || isSendingInvite ? 0.5 : 1,
                      cursor:
                        !isInviteFormValid || isSendingInvite
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {isSendingInvite ? "Sending Invite..." : "Send Invite"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="a-modal-overlay">
          <div className="a-modal-container" style={{ maxWidth: "420px" }}>
            <div className="a-modal-header">
              <div className="u-modal-title">
                <span className="material-icons">mark_email_read</span>
                <span>Verify Email</span>
              </div>
              <button
                className="a-close-btn"
                onClick={() => setShowOtpModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="a-modal-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ color: "#bbb", fontSize: "13px" }}>
                  Enter the 6-digit code sent to{" "}
                  <strong>{newAdmin.email}</strong>.
                </div>

                <div className="a-form-group">
                  <label className="a-form-label">OTP Code</label>
                  <div
                    className="a-input-wrapper"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        className="a-form-input"
                        style={{
                          width: "45px",
                          height: "50px",
                          textAlign: "center",
                          fontSize: "20px",
                          fontWeight: "bold",
                          background: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "8px",
                          padding: 0,
                          color: "#fff",
                        }}
                        value={
                          otpInput[index] === " " ? "" : otpInput[index] || ""
                        }
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onPaste={handleOtpPaste}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary-modal"
                  onClick={handleVerifyOtp}
                  disabled={isCreatingAdmin}
                  style={{
                    opacity: isCreatingAdmin ? 0.6 : 1,
                    cursor: isCreatingAdmin ? "not-allowed" : "pointer",
                  }}
                >
                  {isCreatingAdmin ? "Creating..." : "Verify & Create"}
                </button>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #2b2b2b",
                padding: "14px 22px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "13px",
                color: "#aaa",
                gap: "6px",
              }}
            >
              {otpResendRemaining > 0 ? (
                <span>
                  Resend available in{" "}
                  <span
                    style={{
                      color: "#fff",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatMs(otpResendRemaining)}
                  </span>
                </span>
              ) : (
                <>
                  <span>Didn't get the code?</span>
                  <button
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#0055ff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      padding: 0,
                      textDecoration: "underline",
                      opacity: isSendingOtp ? 0.7 : 1,
                    }}
                  >
                    {isSendingOtp ? "Sending..." : "Resend OTP"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      {showEditModal && selectedAdmin && (
        <div className="a-modal-overlay">
          <div className="a-modal-container">
            <div className="a-modal-header">
              <div className="u-modal-title">
                <span class="material-symbols-outlined">edit</span>
                <span>Edit Admin</span>
              </div>
              <button
                className="a-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="a-modal-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="a-form-group">
                    <label className="a-form-label">First Name</label>
                    <div className="a-input-wrapper">
                      <input
                        type="text"
                        className="a-form-input"
                        value={editFormData.first_name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[0-9]/g, "");
                          setEditFormData({
                            ...editFormData,
                            first_name: value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="a-form-group">
                    <label className="a-form-label">Last Name (Optional)</label>
                    <div className="a-input-wrapper">
                      <input
                        type="text"
                        className="a-form-input"
                        value={editFormData.last_name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[0-9]/g, "");
                          setEditFormData({
                            ...editFormData,
                            last_name: value,
                          });
                        }}
                      />
                    </div>
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
                <button
                  className="btn btn-primary-modal"
                  onClick={handleUpdateAdmin}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {showArchiveModal && archiveAdmin && (
        <div className="u-modal-overlay">
          <div className="u-modal-container archive-mode">
            <div className="u-modal-header" style={{ borderBottom: "none" }}>
              <div
                className="u-modal-title"
                style={{ color: "var(--warning)" }}
              >
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
                <div
                  className="a-input-wrapper"
                  style={{ position: "relative", borderColor: "#333" }}
                >
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
                    }}
                    onClick={() =>
                      setIsArchiveReasonDropdownOpen(
                        !isArchiveReasonDropdownOpen,
                      )
                    }
                  >
                    <span style={{ color: "#fff", fontSize: "14px" }}>
                      {archiveReason || "Inactive"}
                    </span>
                    <span
                      className="material-icons"
                      style={{
                        fontSize: "18px",
                        color: "#666",
                        transform: isArchiveReasonDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "0.3s",
                      }}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>

                  {isArchiveReasonDropdownOpen && (
                    <div
                      className="dropdown-menu"
                      style={{ width: "100%", zIndex: 100 }}
                    >
                      <ul className="options-list">
                        {[
                          "Inactive",
                          "Employee has left the organization",
                          "Security Concerns",
                          "Duplicate Account",
                          "Other",
                        ].map((reason) => (
                          <li
                            key={reason}
                            className={`provider-option ${archiveReason === reason ? "selected" : ""}`}
                            onClick={() => {
                              setArchiveReason(reason);
                              setIsArchiveReasonDropdownOpen(false);
                            }}
                          >
                            <div className="provider-info">
                              <div className="provider-name">{reason}</div>
                            </div>
                            {archiveReason === reason && (
                              <span className="checkmark material-symbols-outlined">
                                check
                              </span>
                            )}
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
                  value={archiveNotes}
                  onChange={(e) => setArchiveNotes(e.target.value)}
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

      {showInviteConfirmation && (
        <div className="a-modal-overlay">
          <div className="a-modal-container" style={{ maxWidth: "400px" }}>
            <div className="a-modal-header">
              <div className="u-modal-title">
                <span className="material-icons" style={{ color: "#0055ff" }}>
                  help
                </span>
                <span>Confirm Invitation</span>
              </div>
              <button
                className="a-close-btn"
                onClick={() => setShowInviteConfirmation(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="a-modal-body">
              <p
                style={{
                  color: "#ccc",
                  fontSize: "14px",
                  marginBottom: "20px",
                  lineHeight: "1.5",
                }}
              >
                Are you sure that this email you want to invite is correct?
              </p>
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #333",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "4px",
                  }}
                >
                  Email Address
                </div>
                <div style={{ color: "#fff", fontWeight: "600" }}>
                  {newAdmin.email}
                </div>
              </div>
              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowInviteConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary-modal"
                  onClick={confirmSendInvite}
                >
                  Yes, Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateConfirmation && (
        <div className="a-modal-overlay">
          <div className="a-modal-container" style={{ maxWidth: "400px" }}>
            <div className="a-modal-header">
              <div className="u-modal-title">
                <span className="material-icons" style={{ color: "#0055ff" }}>
                  help
                </span>
                <span>Confirm Details</span>
              </div>
              <button
                className="a-close-btn"
                onClick={() => setShowCreateConfirmation(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="a-modal-body">
              <p
                style={{
                  color: "#ccc",
                  fontSize: "14px",
                  marginBottom: "20px",
                  lineHeight: "1.5",
                }}
              >
                Are you sure that these details are correct?
              </p>
              <div
                style={{
                  background: "#1a1a1a",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #333",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginBottom: "2px",
                    }}
                  >
                    Name
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {newAdmin.first_name} {newAdmin.last_name}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginBottom: "2px",
                    }}
                  >
                    Email
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {newAdmin.email}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginBottom: "2px",
                    }}
                  >
                    Role
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      className={`stat-badge ${
                        newAdmin.role === "super admin"
                          ? "stat-super-admin"
                          : "stat-admin"
                      }`}
                      style={{
                        padding: "4px 8px",
                        fontSize: "10px",
                        width: "auto",
                        minWidth: "auto",
                      }}
                    >
                      {newAdmin.role === "super admin"
                        ? "Super Admin"
                        : "Admin"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="a-modal-actions">
                <button
                  className="a-btn-cancel"
                  onClick={() => setShowCreateConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary-modal"
                  onClick={confirmStartCreate}
                >
                  Yes, Proceed
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
