import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { PaymentPage } from "./components/PaymentPage";
import { LoginPage } from "./components/LoginPage";
import { ResetPassword } from "./components/ResetPassword";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta raíz - redirigir según estado de autenticación */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />

      {/* Rutas públicas - solo para usuarios no autenticados */}
      <Route
        path="/login"
        element={
          <PublicRoute user={user}>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Ruta para restablecer contraseña - pública */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas del Dashboard - todas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rutas específicas del dashboard */}
      <Route
        path="/dashboard/overview"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="overview" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/interviews"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="interviews" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/cv-boost"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="cv-boost" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/linkedin"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="linkedin" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/job-tracker"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="job-tracker" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/learning"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="learning" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/automated-messages"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="automated-messages" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/services"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="services" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="profile" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/membership"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="membership" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/payment"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="payment" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute user={user}>
            <Dashboard defaultSection="settings" />
          </ProtectedRoute>
        }
      />

      {/* Ruta de pago */}
      <Route
        path="/payment"
        element={
          <ProtectedRoute user={user}>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
