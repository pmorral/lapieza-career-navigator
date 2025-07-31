import { useState } from "react";
import { CreditCard, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface InterviewCreditsProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (credits: number) => void;
}

export function InterviewCredits({ isOpen, onClose, onPurchase }: InterviewCreditsProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const creditPlans = [
    {
      id: "basic",
      name: "Paquete Básico",
      credits: 10,
      price: 29,
      popular: false,
      features: [
        "10 entrevistas adicionales",
        "Feedback detallado con IA",
        "Metodología STAR incluida",
        "Soporte por email"
      ]
    },
    {
      id: "premium",
      name: "Paquete Premium",
      credits: 25,
      price: 59,
      popular: true,
      features: [
        "25 entrevistas adicionales",
        "Feedback detallado con IA",
        "Metodología STAR incluida",
        "Entrevistas en inglés",
        "Soporte prioritario",
        "Análisis comparativo"
      ]
    },
    {
      id: "pro",
      name: "Paquete Profesional",
      credits: 50,
      price: 99,
      popular: false,
      features: [
        "50 entrevistas adicionales",
        "Feedback detallado con IA",
        "Metodología STAR incluida",
        "Entrevistas en múltiples idiomas",
        "Soporte 24/7",
        "Análisis comparativo",
        "Reportes personalizados"
      ]
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      // Simular proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const plan = creditPlans.find(p => p.id === selectedPlan);
      if (plan) {
        onPurchase(plan.credits);
        toast({
          title: "Compra exitosa",
          description: `Has adquirido ${plan.credits} créditos para entrevistas.`,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error en la compra",
        description: "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Comprar Créditos para Entrevistas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Has alcanzado el límite de 5 entrevistas gratuitas. Adquiere créditos adicionales para continuar practicando.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-md'
                } ${plan.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    ${plan.price} USD
                  </div>
                  <CardDescription>
                    {plan.credits} créditos de entrevistas
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {selectedPlan === plan.id && (
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium ml-2">Seleccionado</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={!selectedPlan || isProcessing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? "Procesando..." : "Comprar Créditos"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}