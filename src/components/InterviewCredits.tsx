import { useState } from "react";
import { CreditCard, Star, Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface InterviewCreditsProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (credits: number) => void;
}

export function InterviewCredits({ isOpen, onClose, onPurchase }: InterviewCreditsProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"saved" | "new">("saved");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
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

  const handleContinueToPayment = () => {
    if (!selectedPlan) return;
    setShowPayment(true);
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === "new" && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) {
      toast({
        title: "Datos incompletos",
        description: "Por favor, completa todos los campos de la tarjeta.",
        variant: "destructive",
      });
      return;
    }

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
        setShowPayment(false);
        setSelectedPlan("");
        setCardData({ number: "", name: "", expiry: "", cvv: "" });
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

  const handleBackToPlans = () => {
    setShowPayment(false);
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

{!showPayment ? (
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
                onClick={handleContinueToPayment}
                disabled={!selectedPlan || isProcessing}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Continuar al Pago
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handleBackToPlans}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a planes
              </Button>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Método de Pago</h3>
              <p className="text-muted-foreground mb-4">
                Plan seleccionado: {creditPlans.find(p => p.id === selectedPlan)?.name} - ${creditPlans.find(p => p.id === selectedPlan)?.price} USD
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    paymentMethod === "saved" ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setPaymentMethod("saved")}
                >
                  <CardContent className="p-4 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Tarjeta Guardada</p>
                    <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    paymentMethod === "new" ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setPaymentMethod("new")}
                >
                  <CardContent className="p-4 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Nueva Tarjeta</p>
                    <p className="text-sm text-muted-foreground">Ingresa datos nuevos</p>
                  </CardContent>
                </Card>
              </div>

              {paymentMethod === "new" && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                        <Input 
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                        <Input 
                          id="cardName"
                          placeholder="Juan Pérez"
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Fecha de Vencimiento</Label>
                        <Input 
                          id="cardExpiry"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input 
                          id="cardCvv"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={handleBackToPlans} disabled={isProcessing}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button 
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isProcessing ? "Procesando Pago..." : "Procesar Pago"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}