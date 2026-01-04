import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { PuffLoader } from "react-spinners";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const allowedRoles = ["admin", "super admin", "support"];

        if (userData && allowedRoles.includes(userData.role)) {
          setIsAuthenticated(true);
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
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0f0f0f",
        }}
      >
        <PuffLoader color="#0055ff" size={60} />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
