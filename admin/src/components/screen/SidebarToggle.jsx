import React from "react";
import "./SidebarToggle.css";

export function SidebarToggle({
  onToggle,
  sidebarWidth = 250,
  collapsedWidth = 72,
  headerHeight = 64,
  isMinimized,
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
      className="sidebar-toggle-button"
      style={{ left: isMinimized ? collapsedWidth + 7 : sidebarWidth + 37 }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#242424";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-dark)";
        e.currentTarget.style.color = "#e5e7eb";
      }}
    >
      <span className="material-symbols-outlined sidebar-toggle-icon">
        {isMinimized ? "dock_to_right" : "dock_to_left"}
      </span>
    </button>
  );
}
