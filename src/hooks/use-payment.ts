import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PaymentStatus, CheckoutSession } from "@/types/payment";

// Tipos para los planes de Stripe
export interface StripePlan {
  id: string;
  name: string;
  price: number;
  price_cents: number;
  months: number;
  description: string;
  features: string[];
  currency: string;
  popular: boolean;
  savings: number;
}

// Tipos para el comprobante de Stripe
export interface StripeInvoice {
  customer: {
    id: string;
    email: string;
    name: string;
  };
  payment: {
    id: string;
    amount: number;
    amount_cents: number;
    currency: string;
    status: string;
    created: string;
    payment_method: string;
  };
  checkout: {
    id: string;
    membership_type: string;
    months: string;
    product_id: string;
    price_id: string;
  } | null;
  metadata: {
    user_id: string;
    source: string;
    generated_at: string;
  };
}

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const { user } = useAuth();

  const checkPaymentStatus = async (): Promise<PaymentStatus | null> => {
    if (!user) return null;

    try {
      console.log(
        "🔍 Checking payment status directly from database for user:",
        user.id
      );

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("❌ Error checking payment status:", error);
        return null;
      }

      console.log("📋 Profile data retrieved:", profile);

      // Determine payment status based on subscription_status
      if (profile.subscription_status === "active") {
        return {
          payment_status: "paid",
          subscription_id: null,
          customer_id: null,
          expires_at: null,
          created_at: profile.created_at,
        };
      } else {
        return {
          payment_status: "unpaid",
          subscription_id: null,
          customer_id: null,
          expires_at: null,
          created_at: null,
        };
      }
    } catch (error) {
      console.error("💥 Error in checkPaymentStatus:", error);
      return null;
    }
  };

  const createCheckoutSession = async (
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession | null> => {
    if (!user) return null;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            price_id: priceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            user_id: user.id,
          },
        }
      );

      if (error) {
        console.error("❌ Error creating checkout session:", error);
        toast.error("Error al crear la sesión de pago");
        return null;
      }

      console.log("✅ Checkout session created:", data);
      return data;
    } catch (error) {
      console.error("💥 Error in createCheckoutSession:", error);
      toast.error("Error inesperado al crear la sesión de pago");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCheckout = async (
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<void> => {
    const session = await createCheckoutSession(priceId, successUrl, cancelUrl);
    if (session?.url) {
      window.location.href = session.url;
    }
  };

  return {
    isLoading,
    isCheckingPayment,
    checkPaymentStatus,
    createCheckoutSession,
    redirectToCheckout,
  };
};
