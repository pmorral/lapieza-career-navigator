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
  phone?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  skills?: string;
  experience?: string;
  subscription_plan?: string;
  subscription_status?: string;
  interview_credits?: number;
  created_at: string;
  updated_at: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}
