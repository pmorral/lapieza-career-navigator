import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { PaymentPage } from "./components/PaymentPage";
import { LoginPage } from "./components/LoginPage";
import { ResetPassword } from "./components/ResetPassword";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AccountActivation } from "./components/AccountActivation";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import NotFound from "./pages/NotFound";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading, emailVerified, subscriptionActive } = useAuth();
  const navigate = useNavigate();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Si el usuario está autenticado pero no tiene email verificado o suscripción activa
  if (user && !emailVerified) {
    return (
      <AccountActivation
        onComplete={() => {
          // Recargar la página para continuar con el flujo normal
          window.location.reload();
        }}
      />
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

      {/* Ruta de pago - accesible para usuarios autenticados sin importar suscripción */}
      <Route
        path="/payment"
        element={
          <ProtectedRoute user={user}>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas del Dashboard - solo para usuarios con suscripción activa */}
      {user && subscriptionActive ? (
        <>
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
        </>
      ) : (
        // Si el usuario no tiene suscripción activa, mostrar solo la ruta de pago
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold">Acceso Requerido</h1>
                  <p className="text-muted-foreground">
                    Necesitas una membresía activa para acceder al dashboard
                  </p>
                  <Button onClick={() => navigate("/payment")}>
                    Adquirir Membresía
                  </Button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      )}

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
