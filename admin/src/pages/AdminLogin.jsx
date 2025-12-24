// src/pages/AdminLogin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    navigate("/");
  };

  return (
    <div className="login-page">
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
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <span className="input-label">Password</span>
              <div className="input-wrapper">
                <span className="material-icons input-icon">lock</span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
                <span
                  className="material-icons"
                  style={{ fontSize: "18px", color: "#666", cursor: "pointer" }}
                >
                  visibility_off
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <span className="forgot-link">Forgot Password?</span>
            </div>

            <button type="submit" className="btn-login">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
