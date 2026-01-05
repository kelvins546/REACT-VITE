import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/super_admin/Dashboard";
import Users from "./pages/super_admin/Users";
import ArchivedUsers from "./pages/super_admin/ArchivedUsers";
import Rates from "./pages/super_admin/Rates";
import Complaints from "./pages/super_admin/Complaints";
import AdminLogin from "./pages/AdminLogin";
import Admins from "./pages/super_admin/Admins";
import ProtectedRoute from "./components/route_settings/ProtectedRoute";

import Admin_Rates from "./pages/admin&staff/Rates";
import Admin_Complaints from "./pages/admin&staff/Complaints";

function App() {
  return (
    <Routes>
      { }
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/*amdin */}
          <Route path="/admin/rates" element={<Admin_Rates />} />
          <Route path="/admin/complaints" element={<Admin_Complaints />} />
          {/*Super admin*/}
          <Route path="users" element={<Users />} />
          <Route path="users/archived" element={<ArchivedUsers />} />
          <Route path="users/admins" element={<Admins />} />
          <Route path="rates" element={<Rates />} />
          <Route path="complaints" element={<Complaints />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
