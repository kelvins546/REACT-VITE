import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { PuffLoader } from "react-spinners";
import { LoadingPopup } from "../loaders/LoadingPopUp";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const LOCAL_ROLE_KEY = "hardcoded_admin_role";
  const location = useLocation();

  useEffect(() => {
    let timeoutId;
    let retryTimeoutId;
    let isMounted = true;

    const checkSession = async () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);

      if (isMounted) {
        setLoading(true);
        setLoadingMessage(
          navigator.onLine ? "Loading..." : "Check your internet connection...",
        );
      }

      timeoutId = setTimeout(() => {
        if (isMounted) setLoadingMessage("Check your internet connection...");
      }, 5000);

      try {
        const localRole = localStorage.getItem(LOCAL_ROLE_KEY);
        if (localRole) {
          if (isMounted) {
            setIsAuthenticated(true);
            setRole(localRole);
            setLoading(false);
          }
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, first_name, last_name")
          .eq("id", session.user.id)
          .single();

        if (userError) throw userError;

        const allowedRoles = ["admin", "super admin", "support"];

        if (userData && allowedRoles.includes(userData.role)) {
          if (isMounted) {
            setIsAuthenticated(true);
            setRole(userData.role);
            setProfile(userData);
            setLoading(false);
          }
        } else {
          await supabase.auth.signOut();
          if (isMounted) setLoading(false);
        }
      } catch (error) {
        console.error("Session check failed", error);
        if (isMounted) {
          setLoadingMessage("Check your internet connection...");
          retryTimeoutId = setTimeout(checkSession, 3000);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
    };
  }, [location]);

  return (
    <>
      <LoadingPopup
        show={loading}
        message={loadingMessage}
        Loader={PuffLoader}
        color="#ffd700"
      />
      {isAuthenticated ? (
        <Outlet context={{ role, profile, setLoading, setLoadingMessage }} />
      ) : (
        !loading && <Navigate to="/login" replace />
      )}
    </>
  );
};

export default ProtectedRoute;
