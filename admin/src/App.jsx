// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ArchivedUsers from "./pages/ArchivedUsers";
import Rates from "./pages/Rates";
import Complaints from "./pages/Complaints";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/archived" element={<ArchivedUsers />} />
        <Route path="rates" element={<Rates />} />
        <Route path="complaints" element={<Complaints />} />
      </Route>
    </Routes>
  );
}

export default App;
