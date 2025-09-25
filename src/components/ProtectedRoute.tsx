import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles = [] }) => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles || [];

  const isAdmin = userRoles.some(role => role.name === "ADMIN");

  if (!isAdmin && allowedRoles.length > 0 &&
    !allowedRoles.some(roleName => userRoles.some(r => r.name === roleName))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;