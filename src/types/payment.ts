export interface PaymentStatus {
  payment_status: "paid" | "unpaid";
  subscription_id: string | null;
  customer_id: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  metadata: {
    user_id: string;
    membership_type: string;
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  name?: string; // Alias para full_name
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedin_url?: string; // URL del perfil de LinkedIn
  skills?: string; // Habilidades del usuario
  experience?: string; // Experiencia profesional
  subscription_status: string; // Cambiado a string para ser más flexible
  subscription_plan?: string;
  subscription_start_date?: string; // Fecha de inicio de suscripción
  subscription_end_date?: string; // Fecha de fin de suscripción
  stripe_customer_id?: string; // ID del customer en Stripe
  stripe_subscription_id?: string; // ID de la suscripción en Stripe
  interview_credits?: number;
  created_at: string;
  updated_at: string;
}
