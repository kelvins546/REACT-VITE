import React, { useState } from "react";
import "./Complaints.css";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../../components/loaders/LoadingPopUp";
import { PopupNotification } from "../../components/notifications/PopUpNotification";

const Complaints = () => {
  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    variant: "success",
    icon: "info"
  });

  const [loader, setLoader] = useState({
    show: false,
    message: "Processing..."
  });
  const [showModal, setShowModal] = useState(false);
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Category: All');
  const [selectedStatus, setSelectedStatus] = useState('Status: All');

  const categories = ['Category: All', 'Category: Hardware', 'Category: Billing'];
  const statuses = ['Status: All', 'Status: Open', 'Status: Closed'];

  const [chatLogs, setChatLogs] = useState([
    { id: 1, type: "user", msg: "User created ticket." },
    { id: 2, type: "admin", msg: "Admin assigned to Technical Support." },
  ]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newMessage = { id: Date.now(), type: "admin", msg: replyText };
    setChatLogs([...chatLogs, newMessage]);

    setReplyText("");
    setIsReplying(false);
  };

  const handleResolve = () => {
    setLoader({
      show: true,
      message: "Marking as resolved..."
    });

    setTimeout(() => {
      setLoader({
        show: false,
        message: "Processing..."
      });

      setNotification({
        show: true,
        title: "Resolved",
        message: "The ticket has been successfully marked as resolved.",
        variant: "success",
        icon: "check_circle"
      });

      setShowConfirmResolve(false);
      setShowModal(false)
      setSelectedUser(null);
    }, 2000);
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
        color="#ffd700"
      />
      <div className="page-header">
        <div className="page-title">Complaints Management</div>
      </div>

      { }
      <div className="c-stats-grid">
        <div className="c-stat-card sc-open">
          <div className="c-card-data">
            <div className="c-sc-label">OPEN TICKETS</div>
            <div className="c-sc-val">12</div>
            <div className="c-sc-sub">
              <span
                className="material-icons"
                style={{ fontSize: "16px", marginRight: "4px" }}
              >
                mail
              </span>
              +3 New Today
            </div>
          </div>
          <div className="c-sc-icon">
            <span className="material-icons">mark_email_unread</span>
          </div>
        </div>

        <div className="c-stat-card sc-prio">
          <div className="c-card-data">
            <div className="c-sc-label">HIGH PRIORITY</div>
            <div className="c-sc-val">4</div>
            <div className="c-sc-sub">
              <span
                className="material-icons"
                style={{ fontSize: "16px", marginRight: "4px" }}
              >
                warning
              </span>
              Needs Attention
            </div>
          </div>
          <div className="c-sc-icon">
            <span className="material-icons">priority_high</span>
          </div>
        </div>

        <div className="c-stat-card sc-solve">
          <div className="c-card-data">
            <div className="c-sc-label">RESOLVED (DEC)</div>
            <div className="c-sc-val">48</div>
            <div className="c-sc-sub">
              <span
                className="material-icons"
                style={{ fontSize: "16px", marginRight: "4px" }}
              >
                check_circle
              </span>
              94% Resolution Rate
            </div>
          </div>
          <div className="c-sc-icon">
            <span className="material-icons">check_circle</span>
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
            placeholder="Search ticket ID or user..."
          />
        </div>
        <div className="filter-group">
          <div className="filters-container">
            <div className="complaint-dropdown">
              <button
                className={`dropdown-button ${categoryOpen ? 'open' : ''}`}
                onClick={() => setCategoryOpen(!categoryOpen)}
              >
                <span>{selectedCategory}</span>
                <span className="material-symbols-outlined"
                  style={{
                    transform: categoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s"
                  }}
                >
                  keyboard_arrow_down
                </span>
              </button>
              {categoryOpen && (
                <ul className="dropdown-menu options-list">
                  {categories.map((cat) => (
                    <li
                      key={cat}
                      className={`dropdown-option ${selectedCategory === cat ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryOpen(false);
                      }}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <span className="checkmark material-symbols-outlined">
                        check
                      </span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="complaint-dropdown">
              <button
                className={`dropdown-button ${statusOpen ? 'open' : ''}`}
                onClick={() => setStatusOpen(!statusOpen)}
              >
                <span>{selectedStatus}</span>
                <span className="material-symbols-outlined"
                  style={{
                    transform: statusOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s"
                  }}
                >
                  keyboard_arrow_down
                </span>
              </button>
              {statusOpen && (
                <ul className="dropdown-menu options-list">
                  {statuses.map((status) => (
                    <li
                      key={status}
                      className={`dropdown-option ${selectedStatus === status ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedStatus(status);
                        setStatusOpen(false);
                      }}
                    >
                      <span>{status}</span>
                      {selectedStatus === status && <span className="checkmark material-symbols-outlined">
                        check
                      </span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      { }
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>TICKET ID</th>
              <th>USER</th>
              <th>SUBJECT / ISSUE</th>
              <th>DATE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="ticket-id">#TK-9921</td>
              <td>
                <div className="user-cell">
                  <div className="u-avatar">NA</div>
                  <div>
                    <span className="text-main">Natasha Alonzo</span>
                    <span className="text-sub">Unit 402</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-main">Hub Offline</span>
                <span className="text-sub">Device not syncing data</span>
              </td>
              <td>Today, 09:30 AM</td>
              <td>
                <span className="prio-badge prio-high">
                  <span
                    className="material-icons prio-icon-high"
                    style={{ fontSize: "16px" }}
                  >
                    arrow_upward
                  </span>
                  High
                </span>
              </td>
              <td>
                <span className="stat-badge stat-open">UNRESOLVED</span>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className="icon-btn btn-view"
                    title="View Details"
                    onClick={() => setShowModal(true)}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "20px" }}
                    >
                      visibility
                    </span>
                  </button>
                </div>
              </td>
            </tr>
            { }
            <tr>
              <td className="ticket-id">#TK-9920</td>
              <td>
                <div className="user-cell">
                  <div
                    className="u-avatar"
                    style={{ background: "#333", color: "#ccc" }}
                  >
                    JD
                  </div>
                  <div>
                    <span className="text-main">John Doe</span>
                    <span className="text-sub">Unit 305</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-main">Rate Discrepancy</span>
                <span className="text-sub">Billing calculation error</span>
              </td>
              <td>Yesterday, 2:15 PM</td>
              <td>
                <span className="prio-badge prio-med">
                  <span
                    className="material-icons prio-icon-med"
                    style={{ fontSize: "16px" }}
                  >
                    remove
                  </span>
                  <span className="prio-text">Med</span>
                </span>
              </td>
              <td>
                <span className="stat-badge stat-review">IN REVIEW</span>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className="icon-btn"
                    title="View Details"
                    onClick={() => setShowModal(true)}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "20px" }}
                    >
                      visibility
                    </span>
                  </button>
                </div>
              </td>
            </tr>
            { }
            <tr>
              <td className="ticket-id">#TK-9918</td>
              <td>
                <div className="user-cell">
                  <div
                    className="u-avatar"
                    style={{ background: "#333", color: "#ccc" }}
                  >
                    MC
                  </div>
                  <div>
                    <span className="text-main">Maria Cruz</span>
                    <span className="text-sub">Unit 101</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-main">Wifi Update</span>
                <span className="text-sub">Cannot update credentials</span>
              </td>
              <td>Dec 12, 11:00 AM</td>
              <td>
                <span className="prio-badge prio-low">
                  <span
                    className="material-icons prio-icon-low"
                    style={{ fontSize: "16px" }}
                  >
                    arrow_downward
                  </span>{" "}
                  <span className="prio-text">Low</span>
                </span>
              </td>
              <td>
                <span className="stat-badge stat-solved">RESOLVED</span>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className="icon-btn"
                    title="View Details"
                    onClick={() => setShowModal(true)}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "20px" }}
                    >
                      visibility
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        { }
        <div className="u-pagination">
          <div style={{ fontSize: "14px", color: "#666" }}>
            Showing 1-3 of 15
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="u-page-btn">{"<"}</button>
            <button className="u-page-btn active">1</button>
            <button className="u-page-btn">2</button>
            <button className="u-page-btn">{">"}</button>
          </div>
        </div>
      </div>

      { }
      {showModal && (
        <div className="c-modal-overlay">
          <div className="c-modal-container">
            <div className="c-modal-header">
              <div className="c-modal-title">
                <span
                  className="material-icons"
                  style={{ color: "var(--danger)" }}
                >
                  report_problem
                </span>
                Ticket #TK-9921
              </div>
              <button
                className="c-close-btn"
                onClick={() => setShowModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="c-modal-body">
              <div className="c-modal-row">
                <span className="c-modal-label">Subject</span>
                <span className="c-modal-val">Hub Offline</span>
              </div>
              <div className="c-modal-row">
                <span className="c-modal-label">User</span>
                <span className="c-modal-val">Natasha Alonzo (Unit 402)</span>
              </div>
              <div className="c-modal-row">
                <span className="c-modal-label">Status</span>
                <span className="stat-badge stat-open">OPEN</span>
              </div>
              <div className="c-modal-row">
                <span className="c-modal-label">Priority</span>
                <span className="prio-badge prio-high">High</span>
              </div>

              <div>
                <span className="c-desc-label">Description</span>
                <div className="c-desc-box">
                  My main hub in the living room has been disconnected since 8
                  AM today. I tried resetting the wifi but the LED indicator is
                  still flashing red. It is not syncing usage data to the app.
                </div>
              </div>

              <div>
                <div className="c-section-title">Activity Log</div>
                <div className="c-chat-box">
                  { }
                  {chatLogs.map((log) => (
                    <div key={log.id} className={`c-chat-msg ${log.type}`}>
                      {log.msg}
                    </div>
                  ))}
                </div>
              </div>

              { }
              {!isReplying ? (
                <div className="c-modal-footer">
                  <button
                    className="logoutCancel" style={{width:"100%"}}
                    onClick={() => setIsReplying(true)}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      reply
                    </span>
                    Reply
                  </button>
                  <button className="btn btn-primary-modal" onClick={() => setShowConfirmResolve(true)}>
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}
                    >
                      check_circle
                    </span>
                    Mark as Resolved
                  </button>
                </div>
              ) : (
                <div className="c-reply-section">
                  <textarea
                    className="c-reply-textarea"
                    placeholder="Type your response to the user..."
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="c-reply-actions">
                    <button
                      className="logoutCancel"
                      onClick={() => setIsReplying(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary-modal"
                      onClick={handleSendReply}
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: "18px" }}
                      >
                        send
                      </span>
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showConfirmResolve && (
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
            zIndex: "9991",
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
                className="material-symbols-outlined"
                style={{
                  fontSize: "35px",
                  marginTop: "10px",
                  color: "#00FF99",
                }}
              >
                siren_check
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
                Confirm Resolve
              </span>
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                Are you sure you want to mark this as resolved?
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
                onClick={() => setShowConfirmResolve(false)}

              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="confirmResolveBtn"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Complaints;
