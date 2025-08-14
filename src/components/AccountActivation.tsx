import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { InactiveAccount } from "./InactiveAccount";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AccountActivationProps {
  onComplete: () => void;
}

export function AccountActivation({ onComplete }: AccountActivationProps) {
  const { user, emailVerified, subscriptionActive, checkSubscriptionStatus } =
    useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<
    "loading" | "email" | "subscription" | "complete"
  >("loading");

  useEffect(() => {
    const checkAccountStatus = async () => {
      if (!user) return;

      setIsLoading(true);

      try {
        // Verificar suscripción
        const subscriptionOk = await checkSubscriptionStatus();

        if (!emailVerified) {
          setCurrentStep("email");
        } else if (!subscriptionOk) {
          setCurrentStep("subscription");
        } else {
          setCurrentStep("complete");
        }
      } catch (error) {
        console.error("Error checking account status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccountStatus();
  }, [user, emailVerified, checkSubscriptionStatus]);

  const handleEmailVerificationSuccess = async () => {
    try {
      // Verificar suscripción después de verificar email
      const subscriptionOk = await checkSubscriptionStatus();

      if (subscriptionOk) {
        setCurrentStep("complete");
        onComplete();
      } else {
        setCurrentStep("subscription");
      }
    } catch (error) {
      console.error("Error after email verification:", error);
    }
  };

  const handleSubscriptionActivation = () => {
    // Redirigir a la página de pago
    window.location.href = "/payment";
  };

  const handleBackToLanding = () => {
    // Cerrar sesión y volver al landing
    supabase.auth.signOut();
  };

  if (isLoading || currentStep === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (currentStep === "email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Verifica tu email</CardTitle>
            <CardDescription>
              Para continuar, necesitas verificar tu dirección de email
              <br />
              <span className="font-medium text-foreground">{user?.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Revisa tu bandeja de entrada y haz clic en el enlace de
                verificación que te enviamos.
              </p>

              <Button
                onClick={handleEmailVerificationSuccess}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Ya verifiqué mi email
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBackToLanding}
                className="w-full"
              >
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "subscription") {
    return (
      <InactiveAccount
        onReactivate={handleSubscriptionActivation}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  if (currentStep === "complete") {
    // La cuenta está completamente activa
    onComplete();
    return null;
  }

  return null;
}
