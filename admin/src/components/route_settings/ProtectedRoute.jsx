import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../loaders/LoadingPopUp";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const LOCAL_ROLE_KEY = "hardcoded_admin_role";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const localRole = localStorage.getItem(LOCAL_ROLE_KEY);
        if (localRole) {
          setIsAuthenticated(true);
          setRole(localRole);
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const allowedRoles = ["admin", "super admin", "support"];

        if (userData && allowedRoles.includes(userData.role)) {
          setIsAuthenticated(true);
          setRole(userData.role);
        } else {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <LoadingPopup
        show
        message="Loading..."
        Loader={PuffLoader}
        color="#ffd700"
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ role }} />;
};

export default ProtectedRoute;
