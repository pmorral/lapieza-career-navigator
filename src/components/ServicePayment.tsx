import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Check,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ServicePaymentProps {
  service: {
    id: string;
    title: string;
    price: string | number;
    duration?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ServicePayment({
  service,
  isOpen,
  onClose,
}: ServicePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar logueado para realizar el pago",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Crear sesión de checkout usando la función modificada
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          service_id: service.id,
          success_url: `${window.location.origin}/dashboard/services?success=true`,
          cancel_url: `${window.location.origin}/dashboard/services?canceled=true`
        }
      });

      if (error) {
        throw error;
      }

      if (data?.checkout_url) {
        // Redirigir a Stripe
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No se pudo crear la sesión de pago");
      }

    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error al procesar el pago",
        description: "No se pudo crear la sesión de pago. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pago del Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{service.title}</CardTitle>
              {service.duration && (
                <CardDescription>{service.duration}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {typeof service.price === "number"
                    ? `$${service.price}`
                    : service.price}{" "}
                  USD
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
                <p className="font-medium">Pago Seguro con Stripe</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Serás redirigido a Stripe para completar tu pago de forma segura. 
                Una vez completado, el equipo de Academy se pondrá en contacto contigo 
                en un plazo no mayor a 24 horas hábiles para agendar tu sesión.
              </p>
            </CardContent>
          </Card>

          {/* Terms Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Importante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Tendrás hasta 15 días naturales para agendar tu sesión después del pago.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  Puedes reprogramar con al menos 24 horas de anticipación.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground">
                  No se realizan reembolsos una vez efectuado el pago.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment} 
              className="flex-1" 
              disabled={isProcessing}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? "Procesando..." : "Continuar al Pago"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
