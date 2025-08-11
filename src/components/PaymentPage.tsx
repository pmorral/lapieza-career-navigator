import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Lock, Star } from "lucide-react";
import { CouponInput } from "./CouponInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      id: "premium",
      name: "Academy Premium",
      price: 359,
      description: "Programa completo de empleabilidad por 5 meses",
      features: [
        "Acceso completo a todas las herramientas por 5 meses",
        "Sesiones grupales cada 2 semanas",
        "Templates profesionales",
        "Actualizaciones gratuitas",
        "Soporte prioritario",
        "Comunidad exclusiva"
      ],
      popular: true
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Check if free coupon is applied
      if (appliedCoupon && appliedCoupon.discount_type === 'free') {
        // Record coupon usage
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase.from('coupon_uses').insert({
            coupon_id: appliedCoupon.id,
            user_id: user.user.id
          });

          // Update coupon usage count
          await supabase
            .from('coupons')
            .update({ current_uses: appliedCoupon.current_uses + 1 })
            .eq('id', appliedCoupon.id);

          // Update user profile to premium
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'active',
              subscription_plan: 'premium'
            })
            .eq('user_id', user.user.id);
        }
        
        toast.success("¡Acceso gratuito activado!");
        navigate('/dashboard');
        return;
      }

      // Simulate regular payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("¡Pago completado exitosamente!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Completa tu registro en Academy by LaPieza
          </h1>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a tus necesidades profesionales
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
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      {appliedCoupon && appliedCoupon.discount_type === 'free' ? (
                        <div className="text-2xl font-bold text-green-600">GRATIS</div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-primary">${plan.price}</div>
                          <div className="text-sm text-muted-foreground">USD/mes</div>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
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

          {/* Payment Form */}
          <div className="space-y-6">
            {(!appliedCoupon || appliedCoupon.discount_type !== 'free') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Información de pago
                  </CardTitle>
                  <CardDescription>
                    Ingresa los datos de tu tarjeta de forma segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de tarjeta</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 1234 1234 1234" 
                      maxLength={19}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Fecha de vencimiento</Label>
                      <Input id="expiry" placeholder="MM/AA" maxLength={5} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" maxLength={4} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre en la tarjeta</Label>
                    <Input id="name" placeholder="Nombre completo" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" placeholder="México" required />
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      Tus datos están protegidos con encriptación SSL
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                      {isProcessing ? "Procesando..." : `Completar pago - $${plans.find(p => p.id === selectedPlan)?.price} USD`}
                    </Button>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/signup')}
                    >
                      Volver al registro
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            )}

            {/* Free Access Button for Coupon Users */}
            {appliedCoupon && appliedCoupon.discount_type === 'free' && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-lg font-semibold text-green-700">
                      ¡Cupón aplicado! Tienes acceso gratuito
                    </div>
                    <Button 
                      onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} 
                      className="w-full" 
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Activando..." : "Activar acceso gratuito"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/signup')}
                    >
                      Volver al registro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Plan {plans.find(p => p.id === selectedPlan)?.name}</span>
                    <span>
                      {appliedCoupon && appliedCoupon.discount_type === 'free' ? 
                        "$0 USD" : 
                        `$${plans.find(p => p.id === selectedPlan)?.price} USD`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {appliedCoupon && appliedCoupon.discount_type === 'free' ? 
                        "Acceso gratuito con cupón" : 
                        "Facturación mensual"
                      }
                    </span>
                    <span>Cancela cuando quieras</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {appliedCoupon && appliedCoupon.discount_type === 'free' ? 
                        "$0 USD/mes" : 
                        `$${plans.find(p => p.id === selectedPlan)?.price} USD/mes`
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};