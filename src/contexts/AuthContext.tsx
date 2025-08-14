import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  emailVerified: boolean;
  subscriptionActive: boolean;
  signOut: () => Promise<void>;
  checkSubscriptionStatus: (user: User) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  // Verificar estado de verificación de email usando Supabase Auth
  const checkEmailVerification = (user: User): boolean => {
    // Supabase ya valida el email automáticamente
    // Solo verificamos si el usuario tiene email confirmado
    return user.email_confirmed_at !== null;
  };

  // Verificar estado de suscripción
  const checkSubscriptionStatus = async (user: User): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log("🔍 Checking subscription status for user:", user.id);

      // Usar la función de Supabase para verificar el estado del pago
      const { data, error } = await supabase.functions.invoke(
        "check-payment-status",
        {
          body: { user_id: user.id },
        }
      );

      if (error) {
        console.error("❌ Error calling check-payment-status:", error);
        return false;
      }

      console.log("📋 Payment status response:", data);

      // Verificar el estado del pago
      const isActive = data.payment_status === "paid";

      setSubscriptionActive(isActive);
      return isActive;
    } catch (error) {
      console.error("❌ Error checking subscription status:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Limpiar todos los estados antes de cerrar sesión
      setUser(null);
      setSession(null);
      setEmailVerified(false);
      setSubscriptionActive(false);

      // Cerrar sesión en Supabase
      await supabase.auth.signOut();

      // Redirigir a la landing page
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:", error);
      // En caso de error, forzar redirección
      window.location.href = "/";
    }
  };

  const getInitialSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setSession(session);

      if (session?.user) {
        await checkSubscriptionStatus(session.user);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in getInitialSession:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    getInitialSession();
  }, []);

  const value = {
    user,
    session,
    loading,
    emailVerified,
    subscriptionActive,
    signOut,
    checkSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
