import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { LoadingPopup } from "../components/loaders/LoadingPopUp";
import { PopupNotification } from "../components/notifications/PopUpNotification";
import { PuffLoader } from "react-spinners";
import { supabase } from "../supabaseClient";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [temporaryLoading, setTemporaryLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setshowForgotModal] = useState(false);

  const [notification, setNotification] = React.useState({
    show: false,
    title: "",
    message: "",
    variant: "",
    icon: "info"
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setTemporaryLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, status")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

      if (userData.status === "archived") {
        await supabase.auth.signOut();
        throw new Error("This account has been archived and cannot login.");
      }

      const allowedRoles = ["admin", "super admin", "support"];

      if (!userData || !allowedRoles.includes(userData.role)) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: You do not have admin privileges.");
      }

      setTemporaryLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      setNotification({
        show: true,
        title: "Login failed",
        message: error.message || "Please check your credentials.",
        variant: "error",
        icon: "error"
      });

      setTemporaryLoading(false);
    }

  };

  const handleSendLink = () => {
    setLoader({
      show: true,
      message: "Sending you a Link..."
    });

    setTimeout(() => {
      setLoader({
        show: false,
        message: "Processing..."
      });

      setNotification({
        show: true,
        title: "Link sent",
        message: "A password reset link has been successfully sent to your email.",
        variant: "success",
        icon: "check_circle"
      });

      setshowForgotModal(false);
    }, 2000);
  };

  return (
    <>
      <div className="login-page">
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
          show={temporaryLoading}
          message="Verifying Credentials..."
          Loader={PuffLoader}
          color="#FFD700"
        />
        <div className="auth-bg"></div>
        <div className="auth-container">
          <div className="brand-side">
            <div className="logo-circle">
              <img
                src="/logoNew.png"
                className="logo-img"
                alt="Logo"
              />
            </div>
            <div className="brand-title">GRIDWATCH</div>
            <div className="brand-desc">
              Smart energy monitoring and automated fault protection for your
              modern home.
            </div>
          </div>

          <div className="form-side">
            <div className="form-header">Welcome Back</div>
            <div className="form-sub">
              Enter your admin credentials to access the dashboard.
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <span className="input-label">Email Address</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">email</span>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@gridwatch.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Password</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="material-icons"
                    style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right", marginBottom: "10px" }}>
                <span onClick={() => setshowForgotModal(true)} className="forgot-link">Forgot Password?</span>
              </div>

              <button
                type="submit"
                className="btn-login"
                disabled={temporaryLoading}
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
      {showForgotModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "50",
          }}
        >
          <div
            style={{
              backgroundColor: "#0F0F0F",
              borderRadius: "12px",
              border: "1px solid #333333",
              padding: "20px",
              maxWidth: "330px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
              animation: "slideUp 0.5s",
            }}
          >
            <div>
              <span
                className="material-icons"
                style={{
                  fontSize: "35px",
                  marginTop: "10px",
                  color: "#00FF99",
                }}
              >
                lock_reset
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
                Reset Password
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Enter your email address and we will send you a link to reset your password.
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  gap: "5px",
                  marginTop: "5px"
                }}>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#ccc",
                    letterSpacing: "1px"
                  }}>Email Address</label>
                <div className="a-input-wrapper">
                  <label></label>
                  <input className="a-form-input">
                  </input>
                </div>
              </div>

            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div>
                <button
                  className="btn btn-primary-modal"
                  onClick={handleSendLink}
                >
                  Send Link
                </button>
              </div>
              <div>
                <span style={{ fontSize: "13px", marginTop: '10px' }} className="forgot-link" onClick={() => setshowForgotModal(false)}>Back to Login</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLogin;
