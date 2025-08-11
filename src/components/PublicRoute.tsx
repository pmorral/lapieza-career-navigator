import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface PublicRouteProps {
  user: User | null;
  children: ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({ 
  user, 
  children, 
  redirectTo = "/dashboard" 
}: PublicRouteProps) => {
  if (user) {
    // Si el usuario está autenticado, redirigir al dashboard
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
