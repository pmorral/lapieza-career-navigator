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
  checkSubscriptionStatus: () => Promise<boolean>;
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
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_end_date")
        .eq("user_id", user.id)
        .single();

      if (!error && profile) {
        const isActive =
          profile.subscription_status === "active" &&
          (!profile.subscription_end_date ||
            new Date(profile.subscription_end_date) > new Date());
        setSubscriptionActive(isActive);
        return isActive;
      }
      return false;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Verificar email usando Supabase Auth y suscripción
        const emailOk = checkEmailVerification(session.user);
        setEmailVerified(emailOk);
        await checkSubscriptionStatus();
      }

      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Verificar email usando Supabase Auth y suscripción cuando cambie el estado de auth
        const emailOk = checkEmailVerification(session.user);
        setEmailVerified(emailOk);
        await checkSubscriptionStatus();
      } else {
        // Resetear estados cuando no hay usuario
        setEmailVerified(false);
        setSubscriptionActive(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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
