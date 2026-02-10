import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/route_settings/ProtectedRoute";

import MainLayout from "./components/screen/MainLayout";
import Dashboard from "./pages/shared/Dashboard";

import Users from "./pages/super_admin/JSX_Files/Users";
import Admins from "./pages/super_admin/JSX_Files/Admins";
import ArchivedUsers from "./pages/super_admin/JSX_Files/ArchivedUsers";
import ArchivedAdmins from "./pages/super_admin/JSX_Files/ArchivedAdmins";

import Rates from "./pages/super_admin/JSX_Files/Rates";
import Admin_Rates from "./pages/admin&staff/Rates";

import AdminRegister from "./pages/auth/AdminRegister";
import AdminLogin from "./pages/auth/AdminLogin";

function App() {
  return (
    <Routes>
      {}
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/*admin*/}
          <Route path="/admin/rates" element={<Admin_Rates />} />
          {/*Super admin*/}
          <Route path="users" element={<Users />} />
          <Route path="users/archived" element={<ArchivedUsers />} />
          <Route path="users/admins" element={<Admins />} />
          <Route path="users/admins/archived" element={<ArchivedAdmins />} />
          <Route path="rates" element={<Rates />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
