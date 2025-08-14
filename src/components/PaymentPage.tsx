import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, CreditCard, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CouponInput } from "./CouponInput";
import { useAuth } from "@/contexts/AuthContext";

export const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, checkSubscriptionStatus } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("premium-6");
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckInterval, setPaymentCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Función para verificar el estado del pago
  const checkPaymentStatus = async () => {
    if (!user) return false;

    try {
      setIsCheckingPayment(true);
      const isActive = await checkSubscriptionStatus();

      if (isActive) {
        console.log("✅ Payment completed! Redirecting to dashboard...");
        toast.success(
          "¡Pago completado exitosamente! Redirigiendo al dashboard..."
        );

        // Limpiar el intervalo de verificación
        if (paymentCheckInterval) {
          clearInterval(paymentCheckInterval);
          setPaymentCheckInterval(null);
        }

        // Redirigir al dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking payment status:", error);
      return false;
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Iniciar verificación de pago cuando se crea la sesión
  const startPaymentCheck = () => {
    console.log("🔄 Starting payment status check...");

    // Verificar inmediatamente
    checkPaymentStatus();

    // Configurar intervalo de verificación cada 3 segundos
    const interval = setInterval(async () => {
      const isCompleted = await checkPaymentStatus();
      if (isCompleted) {
        clearInterval(interval);
      }
    }, 3000);

    setPaymentCheckInterval(interval);

    // Limpiar intervalo después de 5 minutos (300 segundos)
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPaymentCheckInterval(null);
        console.log("⏰ Payment check timeout - user should check manually");
      }
    }, 300000);
  };

  // Limpiar intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [paymentCheckInterval]);

  const plans = [
    {
      id: "premium-6",
      name: "Academy Premium - 6 Meses",
      price: 149,
      description: "Programa completo de empleabilidad por 6 meses",
      features: [
        "Acceso completo a todas las herramientas por 6 meses",
        "Sesiones grupales cada 2 semanas",
        "Templates profesionales",
        "Actualizaciones gratuitas",
        "Soporte prioritario",
        "Comunidad exclusiva",
      ],
      popular: true,
      months: 6,
    },
    {
      id: "premium-12",
      name: "Academy Premium - 12 Meses",
      price: 199,
      description: "Programa completo de empleabilidad por 12 meses",
      features: [
        "Acceso completo a todas las herramientas por 12 meses",
        "Sesiones grupales cada 2 semanas",
        "Templates profesionales",
        "Actualizaciones gratuitas",
        "Soporte prioritario",
        "Comunidad exclusiva",
      ],
      popular: false,
      months: 12,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Check if free coupon is applied
      if (appliedCoupon && appliedCoupon.discount_type === "free") {
        // Record coupon usage
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase.from("coupon_uses").insert({
            coupon_id: appliedCoupon.id,
            user_id: user.user.id,
          });

          // Update coupon usage count
          await supabase
            .from("coupons")
            .update({ current_uses: appliedCoupon.current_uses + 1 })
            .eq("id", appliedCoupon.id);

          // Update user profile to premium
          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_plan: "premium",
            })
            .eq("user_id", user.user.id);
        }

        toast.success("¡Acceso gratuito activado!");
        navigate("/dashboard");
        return;
      }

      // Get selected plan details
      const selectedPlanData = plans.find((p) => p.id === selectedPlan);
      if (!selectedPlanData) {
        toast.error("Plan no válido seleccionado");
        return;
      }

      // Create checkout session using Supabase function
      console.log("🔄 Calling create-checkout-session with:", {
        user_id: user?.id,
        email: user?.email,
        full_name: user?.user_metadata?.full_name || user?.email,
        success_url: `${window.location.origin}/dashboard`,
        cancel_url: `${window.location.origin}/payment`,
        membership_type: selectedPlan === "premium-6" ? "6months" : "12months",
      });

      try {
        const response = await supabase.functions.invoke(
          "create-checkout-session",
          {
            body: {
              user_id: user?.id,
              email: user?.email,
              full_name: user?.user_metadata?.full_name || user?.email,
              success_url: `${window.location.origin}/dashboard`,
              cancel_url: `${window.location.origin}/payment`,
              membership_type:
                selectedPlan === "premium-6" ? "6months" : "12months",
            },
          }
        );

        console.log("📡 Full response from create-checkout-session:", response);
        console.log("📡 Response data:", response.data);
        console.log("📡 Response error:", response.error);

        const { data, error } = response;

        if (error) {
          console.error("❌ Error creating checkout session:", error);
          toast.error(
            `Error al crear la sesión de pago: ${
              error.message || "Error desconocido"
            }`
          );
          return;
        }

        if (!data) {
          console.error("❌ No data received from create-checkout-session");
          toast.error("No se recibió respuesta del servidor");
          return;
        }

        console.log("✅ Data received:", data);
        console.log("✅ Data type:", typeof data);
        console.log("✅ Data keys:", Object.keys(data || {}));

        if (data.checkout_url) {
          console.log("🔗 Redirecting to:", data.checkout_url);

          // Iniciar verificación de pago antes de redirigir
          startPaymentCheck();

          // Mostrar mensaje al usuario
          toast.success("Redirigiendo a Stripe para completar tu pago...");

          // Redirigir a Stripe checkout
          window.location.href = data.checkout_url;
        } else {
          console.error("❌ No checkout_url in response:", data);
          toast.error("La respuesta no contiene la URL de checkout");
        }
      } catch (invokeError) {
        console.error("❌ Error invoking function:", invokeError);
        toast.error(
          `Error al invocar la función: ${
            invokeError.message || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Adquiere tu membresía en Academy by LaPieza
          </h1>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a tus necesidades profesionales y
            comienza tu transformación
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plans Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Selecciona tu plan</h2>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                } ${plan.popular ? "relative" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {appliedCoupon &&
                      appliedCoupon.discount_type === "free" ? (
                        <div className="text-2xl font-bold text-green-600">
                          GRATIS
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-primary">
                            ${plan.price}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            USD
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            <CouponInput
              onCouponApplied={setAppliedCoupon}
              appliedCoupon={appliedCoupon}
            />
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de tu Membresía</CardTitle>
                <CardDescription>
                  Revisa los detalles antes de continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Plan {plans.find((p) => p.id === selectedPlan)?.name}
                    </span>
                    <span>
                      {appliedCoupon && appliedCoupon.discount_type === "free"
                        ? "$0 USD"
                        : `$${
                            plans.find((p) => p.id === selectedPlan)?.price
                          } USD`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {appliedCoupon && appliedCoupon.discount_type === "free"
                        ? "Acceso gratuito con cupón"
                        : "Pago único"}
                    </span>
                    <span>Acceso completo</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {appliedCoupon && appliedCoupon.discount_type === "free"
                        ? "$0 USD"
                        : `$${
                            plans.find((p) => p.id === selectedPlan)?.price
                          } USD`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <div className="space-y-6">
              {(!appliedCoupon || appliedCoupon.discount_type !== "free") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Completar tu Compra</CardTitle>
                    <CardDescription>
                      Serás redirigido a Stripe para completar tu pago de forma
                      segura y adquirir tu membresía
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="pt-4 space-y-4">
                        {/* Indicador de verificación de pago */}
                        {isCheckingPayment && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              <div className="text-sm text-blue-800">
                                Verificando estado del pago...
                                {paymentCheckInterval &&
                                  " (Verificación automática activa)"}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          Tus datos están protegidos con encriptación SSL
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isProcessing}
                        >
                          {isProcessing
                            ? "Creando sesión de pago..."
                            : `Adquirir Membresía - $${
                                plans.find((p) => p.id === selectedPlan)?.price
                              } USD`}
                        </Button>

                        {/* Botón de prueba para debug */}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate("/dashboard")}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Volver al dashboard
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Free Access Button for Coupon Users */}
              {appliedCoupon && appliedCoupon.discount_type === "free" && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-lg font-semibold text-green-600">
                        ¡Cupón aplicado! Tienes acceso gratuito
                      </div>
                      <Button
                        onClick={() =>
                          handleSubmit({
                            preventDefault: () => {},
                          } as React.FormEvent)
                        }
                        className="w-full"
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? "Activando..."
                          : "Activar acceso gratuito"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
