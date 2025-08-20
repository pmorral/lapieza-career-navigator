import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserService {
  id: string;
  user_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string;
  service_name: string;
  service_type: string;
  duration: string;
  amount_paid: number;
  currency: string;
  status: string;
  purchased_at: string;
  expires_at: string;
  scheduled_at?: string;
  completed_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useServices() {
  const [services, setServices] = useState<UserService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchServices = async () => {
    if (!user) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener servicios desde el edge function
      const { data, error: fetchError } = await supabase.functions.invoke(
        "get-user-services",
        {
          body: { user_id: user.id },
        }
      );

      if (fetchError) {
        console.error("Error fetching services:", fetchError);
        setError("Error al cargar los servicios");
        return;
      }

      setServices(data?.services || []);
    } catch (err) {
      console.error("Exception fetching services:", err);
      setError("Error inesperado al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const refreshServices = () => {
    fetchServices();
  };

  return {
    services,
    loading,
    error,
    refreshServices
  };
}
