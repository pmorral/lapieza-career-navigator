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
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  subscription_status: string; // Cambiado a string para ser más flexible
  subscription_plan?: string;
  interview_credits?: number;
  created_at: string;
  updated_at: string;
}
