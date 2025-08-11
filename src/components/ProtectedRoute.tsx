import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  user: User | null;
  children: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  user,
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (!user) {
    // Redirigir a login y guardar la ubicación actual para redirigir después del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
