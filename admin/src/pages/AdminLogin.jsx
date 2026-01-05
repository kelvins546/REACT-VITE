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
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

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

  return (
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
        color="#0055ff"
      />
      <div className="auth-bg"></div>
      <div className="auth-container">
        <div className="brand-side">
          <div className="logo-circle">
            <img
              src="/Untitled design (1).png"
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
                  style={{ fontSize: "18px", color: "#666", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <span className="forgot-link">Forgot Password?</span>
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
  );
};

export default AdminLogin;
