import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { PuffLoader } from "react-spinners";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import "./AdminLogin.css";

const AdminRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState({
    show: false,
    message: "Processing...",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteChecked, setInviteChecked] = useState(false);
  const [inviteValid, setInviteValid] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "info",
  });

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^ ,;:<>()\\/]+@(gmail\.com|yahoo\.com)$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  useEffect(() => {
    const email = searchParams.get("email") || "";
    const first_name = searchParams.get("first_name") || "";
    const last_name = searchParams.get("last_name") || "";
    const role = searchParams.get("role") || "admin";
    const invite = searchParams.get("invite") || "";
    const expiresRaw = searchParams.get("expires") || "";
    const expiresAt = Number(expiresRaw);
    const allowedRoles = ["admin", "super admin", "support"];

    const isValidInvite =
      Boolean(email && emailRegex.test(email)) &&
      allowedRoles.includes(role) &&
      (invite === "1" || invite === "true") &&
      Number.isFinite(expiresAt) &&
      Date.now() <= expiresAt;

    setFormData((prev) => ({ ...prev, email, first_name, last_name, role }));
    setInviteValid(isValidInvite);
    setInviteChecked(true);

    if (!isValidInvite) {
      setNotification({
        show: true,
        title: "Invalid invitation",
        message:
          "This invite link is invalid or expired. Please request a new one.",
        variant: "error",
      });

      const timer = setTimeout(() => {
        navigate("/login");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        return;
      }
      const { session } = data;
      if (session) {
        navigate("/", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const errors = {
    first_name:
      formData.first_name === ""
        ? " "
        : !nameRegex.test(formData.first_name)
          ? "Name must contain letters only"
          : "",
    last_name:
      formData.last_name === ""
        ? ""
        : !nameRegex.test(formData.last_name)
          ? "Name must contain letters only"
          : "",
    email:
      formData.email === ""
        ? " "
        : !emailRegex.test(formData.email)
          ? "Invalid email format"
          : "",
    password:
      formData.password === ""
        ? " "
        : !passwordRegex.test(formData.password)
          ? "Must be 8+ chars, 1 uppercase, 1 lowercase & 1 special character"
          : "",
    confirmPassword:
      formData.confirmPassword === ""
        ? " "
        : formData.password !== formData.confirmPassword
          ? "Passwords do not match"
          : "",
  };

  const isFormValid = Boolean(
    inviteValid &&
    formData.first_name?.trim() &&
    formData.email?.trim() &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    !errors.first_name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inviteValid) {
      setNotification({
        show: true,
        title: "Invalid invitation",
        message: "This invite link is invalid or expired.",
        variant: "error",
      });
      return;
    }

    if (!isFormValid) {
      setNotification({
        show: true,
        title: "Error",
        message: "Please fix the highlighted fields before continuing.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    setLoader({ show: true, message: "Creating User..." });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: dbError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: formData.email,
            role: formData.role,
            first_name: formData.first_name,
            last_name: formData.last_name,
            status: "active",
            joined_at: new Date().toISOString(),
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

      if (data.session) {
        await supabase.auth.signOut();
      }

      setNotification({
        show: true,
        title: "Success",
        message: "Account created successfully! Redirecting to login...",
        variant: "success",
      });

      setLoader({ show: true, message: "Redirecting to login..." });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setNotification({
        show: true,
        title: "Registration Failed",
        message: err.message,
        variant: "error",
      });
      setLoading(false);
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const isFormDisabled = loading || !inviteValid;

  return (
    <div className="login-page">
      <PopupNotification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <LoadingPopup
        show={loader.show}
        message={loader.message}
        Loader={PuffLoader}
        color="#ffd700"
      />
      <div className="auth-bg"></div>
      <div className="auth-container">
        <div className="brand-side">
          <div className="logo-circle">
            <img src="/logoNew.png" className="logo-img" alt="Logo" />
          </div>
          <div className="brand-title">GRIDWATCH</div>
          <div className="brand-desc">
            Smart energy monitoring and automated fault protection for your
            modern home.
          </div>
        </div>

        <div className="form-side">
          <div className="form-header">Complete Registration</div>
          <div className="form-sub">
            Set up your password to access the admin portal.
          </div>

          {inviteChecked && !inviteValid && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "12px",
                marginBottom: "16px",
              }}
            >
              This invitation link is invalid or expired.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-label">Email Address</span>
              <div className="input-wrapper" style={{ opacity: 0.7 }}>
                <span className="material-icons input-icon">email</span>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  disabled
                />
              </div>
              {errors.email && (
                <span style={{ color: "#ef4444", fontSize: "11px" }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div
              className="input-group"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <span className="input-label">First Name</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">person</span>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                    disabled={isFormDisabled}
                  />
                </div>
                {errors.first_name && (
                  <span style={{ color: "#ef4444", fontSize: "11px" }}>
                    {errors.first_name}
                  </span>
                )}
              </div>

              <div>
                <span className="input-label">Last Name</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">badge</span>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    disabled={isFormDisabled}
                  />
                </div>
                {errors.last_name && (
                  <span style={{ color: "#ef4444", fontSize: "11px" }}>
                    {errors.last_name}
                  </span>
                )}
              </div>
            </div>

            <div className="input-group">
              <span className="input-label">Password</span>
              <div className="input-wrapper">
                <span className="material-icons input-icon">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Create a password"
                  required
                  disabled={isFormDisabled}
                />
                <span
                  className="material-icons eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </div>
              {errors.password && (
                <span style={{ color: "#ef4444", fontSize: "11px" }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div className="input-group">
              <span className="input-label">Confirm Password</span>
              <div className="input-wrapper">
                <span className="material-icons input-icon">lock</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                  required
                  disabled={isFormDisabled}
                />
                <span
                  className="material-icons eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </div>
              {errors.confirmPassword && (
                <span style={{ color: "#ef4444", fontSize: "11px" }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={isFormDisabled || !isFormValid}
            >
              Create Account register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
