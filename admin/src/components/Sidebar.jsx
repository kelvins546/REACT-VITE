// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ minimizeSidebar = 1, setminizeSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [skipInitialAnimation, setSkipInitialAnimation] = useState(true);

  useEffect(() => {
    setSkipInitialAnimation(false);
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`sidebar ${minimizeSidebar === 2 ? 'active' : ''}`}>
      {/* Removed the toggle button */}
      {minimizeSidebar === 1 && (
        <>
          <div className="brand">
            <img src="/Untitled design (1).png" className="brand-logo" alt="Logo" />
            <AnimatePresence initial={!skipInitialAnimation}>
              {isVisible && (
                <motion.span className="brand-text"
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

            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">people</span>
              <AnimatePresence initial={!skipInitialAnimation}>
                {isVisible && (
                  <motion.span
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    Users
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>

            <NavLink
              to="/rates"
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
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        Utility
                      </motion.span>
                      <motion.span
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
              to="/complaints"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">report_problem</span>
              <AnimatePresence initial={!skipInitialAnimation}>
                {isVisible && (
                  <motion.span
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
            onClick={setShowLogoutModal}
            title="Log Out"
            style={{ transition: "0.5s ease" }}
          >
            <AnimatePresence initial={!skipInitialAnimation}>
              <motion.div
                className="user-avatar"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ flexShrink: 0 }}
              >
                AD
              </motion.div>

              <motion.div
                style={{ flex: 1 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                    Admin
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                    User
                  </div>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    System
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    Administrator
                  </div>
                </div>
              </motion.div>

              <motion.span
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
            <img src="/Untitled design (1).png" className="brand-logo" alt="Logo" />
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

            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">people</span>
            </NavLink>

            <NavLink
              to="/rates"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">paid</span>
            </NavLink>

            <NavLink
              to="/complaints"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="material-icons">report_problem</span>
            </NavLink>
          </nav>

          <div className="user-nav" onClick={setShowLogoutModal} title="Log Out">
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
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '50',
        }}>
          <div style={{
            backgroundColor: '#0F0F0F',
            borderRadius: '8px',
            border: '1px solid #333333',
            padding: '20px',
            maxWidth: '330px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            animation: "slideUp 0.5s"
          }}>
            <div>
              <span className="material-icons" style={{
                fontSize: '40px'
              }}>
                logout
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Confirm Logout</span>
              <span style={{ fontSize: '12px', color: '#aaa' }}>Are you sure you want to log out of your session?</span>
            </div>
            <div style={{
              marginTop: '16px',
              display: 'flex',
              gap: '5px'
            }}>
              <button onClick={() => setShowLogoutModal(false)} style={{
                padding: '12px',
                backgroundColor: '#2a2a2a1a',
                color: '#fff',
                border: '1px #2A2A2A solid',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                margin: '0 8px',
                width: '100%',
              }}>
                Cancel
              </button>
              <button onClick={handleLogout} style={{
                padding: '12px',
                backgroundColor: '#FF44441A',
                color: '#ff6b6b',
                border: '1px #FF4444 solid',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
                fontWeight: '600'
              }}>
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