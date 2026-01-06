import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import { LoadingPopup } from "./loaders/LoadingPopUp";
import { PuffLoader } from "react-spinners";
import { useOutletContext } from "react-router-dom";

const Sidebar = ({ minimizeSidebar = 1, setminizeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { role } = useOutletContext();
  const isSuperAdmin = role === "super admin";

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [skipInitialAnimation, setSkipInitialAnimation] = useState(true);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    name: "Loading...",
    role: "System Admin",
    initials: "AD",
  });

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setSkipInitialAnimation(false);
    if (location.pathname.includes("/users")) {
      setIsUsersOpen(true);
    }

    fetchCurrentAdmin();
  }, [location.pathname]);

  const fetchCurrentAdmin = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setAdminProfile({
            name: data.full_name || "Admin",
            role: capitalize(data.role) || "System Admin",
            initials: getInitials(data.full_name),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
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

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setShowLogoutModal(false);

      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error logging out:", error);
      setLoggingOut(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const isUserSectionActive = location.pathname.includes("/users");

  return (
    <div className={`sidebar ${minimizeSidebar === 2 ? "active" : ""}`}>
      { }
      <LoadingPopup
        show={loggingOut}
        message="Logging out..."
        Loader={PuffLoader}
        color="#ff4444"
      />

      {minimizeSidebar === 1 && (
        <>
          <div className="brand">
            <img
              src="/Untitled design (1).png"
              className="brand-logo"
              alt="Logo"
            />
            <AnimatePresence initial={!skipInitialAnimation}>
              {isVisible && (
                <motion.span
                  key="brand-text"
                  className="brand-text"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  GRIDWATCH
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <nav style={{ display: "flex", flexDirection: "column" }}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">dashboard</span>
              <AnimatePresence initial={!skipInitialAnimation}>
                {isVisible && (
                  <motion.span
                    key="label-overview"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    Overview
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>

            { }
            {isSuperAdmin && (
              <div className="nav-group">
                <div
                  className={`nav-link ${isUserSectionActive ? "group-active" : ""}`}
                  onClick={() => setIsUsersOpen(!isUsersOpen)}
                  style={{ cursor: "pointer", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span className="material-icons">manage_accounts</span>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <AnimatePresence initial={!skipInitialAnimation}>
                        {isVisible && (
                          <>
                            <motion.span
                              key="label-user"
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              transition={{ duration: 0.3 }}
                            >
                              User
                            </motion.span>
                            <motion.span
                              key="label-management"
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              transition={{ duration: 0.3 }}
                            >
                              Management
                            </motion.span>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {isVisible && (
                    <span
                      className="material-icons"
                      style={{
                        fontSize: "16px",
                        transform: isUsersOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "0.3s",
                      }}
                    >
                      expand_more
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {isUsersOpen && isVisible && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden", marginLeft: "10px" }}
                    >
                      <NavLink
                        to="/users"
                        end
                        className={({ isActive }) =>
                          isActive ? "nav-link sub-link active" : "nav-link sub-link"
                        }
                        style={{ paddingLeft: "45px", height: "45px" }}
                      >
                        <span className="material-icons" style={{ fontSize: "18px" }}>
                          people
                        </span>
                        <span>Residents</span>
                      </NavLink>

                      <NavLink
                        to="/users/admins"
                        className={({ isActive }) =>
                          isActive ? "nav-link sub-link active" : "nav-link sub-link"
                        }
                        style={{ paddingLeft: "45px", height: "45px" }}
                      >
                        <span className="material-icons" style={{ fontSize: "18px" }}>
                          admin_panel_settings
                        </span>
                        <span>System Admins</span>
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <NavLink
              to={role === 'super admin' ? '/rates' : '/admin/rates'}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">paid</span>
              <div style={{ display: "flex", gap: "5px" }}>
                <AnimatePresence initial={!skipInitialAnimation}>
                  {isVisible && (
                    <>
                      <motion.span
                        key="label-utility"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        Utility
                      </motion.span>
                      <motion.span
                        key="label-rates"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        Rates
                      </motion.span>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </NavLink>

            <NavLink
              to={role === 'super admin' ? '/complaints' : '/admin/complaints'}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">report_problem</span>
              <AnimatePresence initial={!skipInitialAnimation}>
                {isVisible && (
                  <motion.span
                    key="label-complaints"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    Complaints
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </nav>

          <div
            className="user-nav"
            onClick={() => setShowLogoutModal(true)}
            title="Log Out"
            style={{ transition: "0.5s ease" }}
          >
            <AnimatePresence initial={!skipInitialAnimation}>
              { }
              <motion.div
                key="user-avatar"
                className="user-avatar"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ flexShrink: 0 }}
              >
                {adminProfile.initials}
              </motion.div>

              <motion.div
                key="user-info"
                style={{ flex: 1 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                { }
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "140px",
                  }}
                >
                  {adminProfile.name}
                </div>
                { }
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {adminProfile.role}
                </div>
              </motion.div>

              <motion.span
                key="logout-icon"
                className="material-icons"
                style={{ color: "#666", fontSize: "20px" }}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
              >
                logout
              </motion.span>
            </AnimatePresence>
          </div>
        </>
      )}

      {minimizeSidebar === 2 && (
        <>
          <div className="brand">
            <img
              src="/Untitled design (1).png"
              className="brand-logo"
              alt="Logo"
            />
          </div>

          <nav style={{ display: "flex", flexDirection: "column" }}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">dashboard</span>
            </NavLink>

            { }
            {isSuperAdmin && (
              <>
                <NavLink
                  to="/users"
                  end
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  title="Residents"
                >
                  <span className="material-icons">people</span>
                </NavLink>

                { }
                <NavLink
                  to="/users/admins"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  title="Admins"
                >
                  <span className="material-icons">admin_panel_settings</span>
                </NavLink>
              </>
            )}


            <NavLink
              to={role === 'super admin' ? '/rates' : '/admin/rates'}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">paid</span>
            </NavLink>

            <NavLink
              to={role === 'super admin' ? '/complaints' : '/admin/complaints'}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">report_problem</span>
            </NavLink>
          </nav>

          <div
            className="user-nav"
            onClick={() => setShowLogoutModal(true)}
            title="Log Out"
          >
            <span
              className="material-icons"
              style={{ color: "#666", fontSize: "20px" }}
            >
              logout
            </span>
          </div>
        </>
      )}

      {showLogoutModal && (
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
                  color: "#888888",
                }}
              >
                logout
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
                Confirm Logout
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Are you sure you want to log out of your session?
              </span>
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "10px",
              }}
            >
              <button className="logoutCancel"
                onClick={() => setShowLogoutModal(false)}
                
              >
                Cancel
              </button>
              <button
                className="logoutbtn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
