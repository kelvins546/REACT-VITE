import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";
import { PuffLoader } from "react-spinners";
import { supabase } from "../../supabaseClient";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [temporaryLoading, setTemporaryLoading] = useState(false);
  const [loginLoadingMessage, setLoginLoadingMessage] = useState("Verifying Credentials...");
  const [loader, setLoader] = useState({ show: false, message: "Processing..." });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setshowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpExpiresAt, setForgotOtpExpiresAt] = useState(0);
  const [forgotOtpResendAt, setForgotOtpResendAt] = useState(0);
  const [forgotOtpRemaining, setForgotOtpRemaining] = useState(0);
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  const [notification, setNotification] = React.useState({
    show: false,
    title: "",
    message: "",
    variant: "",
    icon: "info"
  });

  const emailRegex = /^[^ ,;:<>()\\/]+@[^ ,;:<>()\\/]+\.[^ ,;:<>()\\/]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
  const OTP_TTL_MS = 5 * 60 * 1000;
  const OTP_RESEND_COOLDOWN_MS = 3 * 60 * 1000;

  const formatMs = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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

  useEffect(() => {
    if (!showForgotModal) {
      setForgotOtpRemaining(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, forgotOtpResendAt - Date.now());
      setForgotOtpRemaining(remaining);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [showForgotModal, forgotOtpResendAt]);

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const chars = forgotOtp.split("");
    while (chars.length < 6) chars.push(" ");

    chars[index] = val;
    if (!val) chars[index] = " ";

    setForgotOtp(chars.join(""));

    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if ((!forgotOtp[index] || forgotOtp[index] === " ") && index > 0) {
        e.preventDefault();
        const chars = forgotOtp.split("");
        while (chars.length < 6) chars.push(" ");
        chars[index - 1] = " ";
        setForgotOtp(chars.join(""));
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
      setForgotOtp(chars.join(""));
      document.getElementById(`otp-${Math.min(pasted.length - 1, 5)}`)?.focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoadingMessage("Verifying Credentials...");
    setTemporaryLoading(true);

    let timeoutId = setTimeout(() => {
      setLoginLoadingMessage("Check your internet connection...");
    }, 5000);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);
      console.error("Login failed:", error);

      let errorMessage = error.message || "Please check your credentials.";
      if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Check your internet connection.";
      }

      setNotification({
        show: true,
        title: "Login failed",
        message: errorMessage,
        variant: "error",
        icon: "error"
      });

      setTemporaryLoading(false);
    }

  };

  const handleSendOtp = async () => {
    if (!emailRegex.test(forgotEmail)) {
      setNotification({
        show: true,
        title: "Invalid email",
        message: "Please enter a valid email address.",
        variant: "error",
        icon: "error"
      });
      return;
    }

    if (Date.now() < forgotOtpResendAt) {
      setForgotStep("otp");
      setNotification({
        show: true,
        title: "Cooldown active",
        message: `Please wait ${Math.ceil((forgotOtpResendAt - Date.now()) / 1000)}s before requesting a new code.`,
        variant: "info",
        icon: "timer"
      });
      return;
    }

    setLoader({ show: true, message: "Verifying account..." });
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", forgotEmail)
        .single();

      if (userError || !userData) {
        throw new Error("Account not found or access denied.");
      }

      if (userData.role !== "admin" && userData.role !== "super admin") {
        throw new Error("Access Denied: You do not have permission to reset password.");
      }

      setLoader({ show: true, message: "Sending OTP..." });
      const { error } = await supabase.auth.signInWithOtp({
        email: forgotEmail,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;

      setForgotOtpExpiresAt(Date.now() + OTP_TTL_MS);
      setForgotOtpResendAt(Date.now() + OTP_RESEND_COOLDOWN_MS);
      setForgotStep("otp");

      setNotification({
        show: true,
        title: "OTP sent",
        message: "Check your email for the verification code.",
        variant: "success",
        icon: "check_circle"
      });
    } catch (error) {
      setNotification({
        show: true,
        title: "Failed to send",
        message: error.message || "Could not send OTP. Please try again.",
        variant: "error",
        icon: "error"
      });
    } finally {
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = forgotOtp.replace(/\s/g, "");
    if (!cleanOtp || Date.now() > forgotOtpExpiresAt) {
      setNotification({
        show: true,
        title: "OTP expired",
        message: "Your OTP expired. Please resend a new one.",
        variant: "warning",
        icon: "warning"
      });
      return;
    }

    setLoader({ show: true, message: "Verifying OTP..." });
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: forgotEmail,
        token: cleanOtp,
        type: "email",
      });
      if (error) throw error;

      setForgotStep("reset");
    } catch (error) {
      setNotification({
        show: true,
        title: "Invalid OTP",
        message: error.message || "The code you entered is incorrect.",
        variant: "error",
        icon: "error"
      });
    } finally {
      setLoader({ show: false, message: "Processing..." });
    }
  };

  const handleResetPassword = async () => {
    if (!passwordRegex.test(forgotPassword)) {
      setNotification({
        show: true,
        title: "Weak password",
        message: "Use 8+ chars with uppercase, lowercase, and a special character.",
        variant: "warning",
        icon: "warning"
      });
      return;
    }

    if (forgotPassword !== forgotConfirm) {
      setNotification({
        show: true,
        title: "Password mismatch",
        message: "Passwords do not match.",
        variant: "error",
        icon: "error"
      });
      return;
    }

    setLoader({ show: true, message: "Updating password..." });
    try {
      const { error } = await supabase.auth.updateUser({
        password: forgotPassword,
      });
      if (error) throw error;

      await supabase.auth.signOut({ scope: "local" });

      setNotification({
        show: true,
        title: "Password updated",
        message: "Your password has been reset. Please log in.",
        variant: "success",
        icon: "check_circle"
      });

      setshowForgotModal(false);
      setForgotStep("email");
      setForgotEmail("");
      setForgotOtp("");
      setForgotPassword("");
      setForgotConfirm("");
    } catch (error) {
      setNotification({
        show: true,
        title: "Reset failed",
        message: error.message || "Could not reset password. Please try again.",
        variant: "error",
        icon: "error"
      });
    } finally {
      setLoader({ show: false, message: "Processing..." });
    }
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
          message={loginLoadingMessage}
          Loader={PuffLoader}
          color="#FFD700"
        />
        <LoadingPopup
          show={loader.show}
          message={loader.message}
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
              maxWidth: "420px",
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
              {forgotStep === "email" && (
                <>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    Enter your email address and we will send you an OTP.
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                      gap: "5px",
                      marginTop: "5px"
                    }}
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        color: "#ccc",
                        letterSpacing: "1px"
                      }}
                    >
                      Email Address
                    </label>
                    <div className="input-wrapper" style={{ width: "100%" }}>
                      <span className="material-icons input-icon">email</span>
                      <input
                        className="input-field"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@gridwatch.com"
                      />
                    </div>
                  </div>
                </>
              )}

              {forgotStep === "otp" && (
                <>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    Enter the 6-digit OTP sent to
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                      gap: "5px",
                      marginTop: "5px"
                    }}
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        color: "#ccc",
                        letterSpacing: "1px"
                      }}
                    >
                      OTP Code
                    </label>
                    <div className="input-wrapper" style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center',alignContent: 'center', width: '100%'}}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength="1"
                          className="input-field"
                          style={{
                            width: '45px',
                            height: '50px',
                            textAlign: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: 0,
                            color: '#fff'
                          }}
                          value={forgotOtp[index] === " " ? "" : (forgotOtp[index] || "")}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      fontSize: "12px",
                      color: "#888",
                      marginTop: "6px"
                    }}
                  >
                    <span>
                      {forgotOtpRemaining > 0
                        ? `Resend available in ${Math.ceil(forgotOtpRemaining / 1000)}s`
                        : "Didn't receive the code?"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={forgotOtpRemaining > 0}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FFD700",
                        fontWeight: "600",
                        cursor: forgotOtpRemaining > 0 ? "not-allowed" : "pointer",
                        opacity: forgotOtpRemaining > 0 ? 0.5 : 1
                      }}
                    >
                      Resend now
                    </button>
                  </div>
                </>
              )}

              {forgotStep === "reset" && (
                <>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>
                    Set a new password for your account.
                  </span>
                  <div style={{ textAlign: "left" }}>
                    <div className="input-group" style={{ marginTop: "8px" }}>
                      <span className="input-label">New Password</span>
                      <div className="input-wrapper">
                        <span className="material-icons input-icon">lock</span>
                        <input
                          className="input-field"
                          type={showForgotPassword ? "text" : "password"}
                          value={forgotPassword}
                          onChange={(e) => setForgotPassword(e.target.value)}
                          placeholder="Create a new password"
                        />
                        <span
                          className="material-icons"
                          style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }}
                          onClick={() => setShowForgotPassword(!showForgotPassword)}
                        >
                          {showForgotPassword ? "visibility" : "visibility_off"}
                        </span>
                      </div>
                    </div>
                    <div className="input-group">
                      <span className="input-label">Confirm Password</span>
                      <div className="input-wrapper">
                        <span className="material-icons input-icon">lock</span>
                        <input
                          className="input-field"
                          type={showForgotConfirm ? "text" : "password"}
                          value={forgotConfirm}
                          onChange={(e) => setForgotConfirm(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <span
                          className="material-icons"
                          style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }}
                          onClick={() => setShowForgotConfirm(!showForgotConfirm)}
                        >
                          {showForgotConfirm ? "visibility" : "visibility_off"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

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
                {forgotStep === "email" && (
                  <button
                    className="btn btn-primary-modal"
                    onClick={handleSendOtp}
                  >
                    Send OTP
                  </button>
                )}
                {forgotStep === "otp" && (
                  <button
                    className="btn btn-primary-modal"
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>
                )}
                {forgotStep === "reset" && (
                  <button
                    className="btn btn-primary-modal"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </button>
                )}
              </div>
              <div>
                <span
                  style={{ fontSize: "13px", marginTop: '10px' }}
                  className="forgot-link"
                  onClick={() => {
                    setshowForgotModal(false);
                    setForgotStep("email");
                    setForgotEmail("");
                    setForgotOtp("");
                    setForgotPassword("");
                    setForgotConfirm("");
                  }}
                >
                  Back to Login
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLogin;
