// src/components/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import the new component

const MainLayout = () => {
  return (
    <>
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area (Dynamic) */}
      <div className="main-pane">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
