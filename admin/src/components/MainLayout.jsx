import React, { useState, useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Sidebar from "./Sidebar";
import Admin_Sidebar from "./Admin_Sidebar";
import { SidebarToggle } from "./SidebarToggle";

const SIDEBAR_EXPANDED = 250;
const SIDEBAR_COLLAPSED = 72;

const MainLayout = () => {
  const { role } = useOutletContext(); 

  const [sidebarMinimized, setSidebarMinimized] = useState(() => {
    const saved = localStorage.getItem("sidebarState");
    return saved ? Number(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("sidebarState", sidebarMinimized);
  }, [sidebarMinimized]);

  const sidebarWidth =
    sidebarMinimized === 2
      ? SIDEBAR_COLLAPSED
      : SIDEBAR_EXPANDED;

  const isSuperAdmin = role === "super admin";

  return (
    <>
      {isSuperAdmin ? (
        <Sidebar
          minimizeSidebar={sidebarMinimized}
          setminizeSidebar={setSidebarMinimized}
        />
      ) : (
        <Admin_Sidebar
          minimizeSidebar={sidebarMinimized}
          setminizeSidebar={setSidebarMinimized}
        />
      )}

      <div className="main-pane">
        <SidebarToggle
          onToggle={() =>
            setSidebarMinimized(prev => (prev === 1 ? 2 : 1))
          }
          sidebarWidth={sidebarWidth}
          isMinimized={sidebarMinimized === 2}
        />

        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
