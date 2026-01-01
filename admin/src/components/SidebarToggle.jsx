import React from "react";

export function SidebarToggle({
    onToggle,
    sidebarWidth = 250,
    collapsedWidth = 72,
    headerHeight = 64,
    isMinimized
}) {
    return (
        <button
            onClick={onToggle}
            aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
            style={{
                position: "fixed",
                top: headerHeight / 3,
                left: isMinimized ? collapsedWidth + 7 : sidebarWidth + 37,
                transform: "translateY(-50%)",
                zIndex: 40,

                height: "27px",
                width: "27px",
                borderRadius: "9px",
                border: "none",
                backgroundColor: "var(--bg-dark)",
                color: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
                padding: "15px",
                transition:
                    "left 0.3s ease, background-color 0.2s ease, color 0.2s ease"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#242424";

            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-dark)";
                e.currentTarget.style.color = "#e5e7eb";
            }}
        >
            <span
                className="material-symbols-outlined"
                style={{
                    fontSize: 22,
                    color: "currentColor",
                    transition: "color 0.2s ease",
                    fontWeight: "200",
                }}
            >
                {isMinimized ? "dock_to_right" : "dock_to_left"}
            </span>
        </button>
    );
}
