import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  MessageSquare,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  title: string;
  duration: string;
  price: string | number;
  description: string;
  features: string[];
  investment?: string;
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
  special?: boolean;
}

interface ServiceHistoryItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  duration?: string;
}

export function AdditionalServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingService, setLoadingService] = useState<string | null>(null);
  const [hasPurchasedConsultation, setHasPurchasedConsultation] =
    useState(false);

  useEffect(() => {
    const loadServiceHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.functions.invoke(
          "get-service-history",
          {
            body: { user_id: user.id },
          }
        );
        if (!error && data?.services) {
          const list = data.services as ServiceHistoryItem[];
          const purchased = list.some(
            (s) => s.name === "Asesoría General de Empleabilidad"
          );
          setHasPurchasedConsultation(purchased);
        }
      } catch (e) {
        // Continuar sin bloquear UI
      }
    };
    loadServiceHistory();
  }, [user]);

  const services: Service[] = [
    {
      id: "consultation",
      title: "Asesoría General de Empleabilidad",
      duration: "60 minutos",
      price: hasPurchasedConsultation ? 150 : 75,
      description:
        "Orientación general sobre tu carrera profesional y estrategias de empleabilidad",
      features: [
        "Análisis de perfil",
        "Roadmap profesional",
        "Recomendaciones",
        "Recursos adicionales",
      ],
      icon: Briefcase,
      popular: true,
    },
    {
      id: "interview-45",
      title: "Entrevista con Career Coach",
      duration: "45 minutos",
      price: 100,
      description:
        "Sesión personalizada para simulación de entrevista con un especialista",
      features: [
        "Análisis personalizado",
        "Feedback inmediato",
        "Plan de acción",
        "Grabación de la sesión",
        "Se elige un idioma: Español o Inglés",
      ],
      icon: Users,
      popular: false,
    },
    {
      id: "job-vacancies",
      title: "20 Vacantes Personalizadas",
      duration: "48 horas",
      price: 100,
      description:
        "Recibe 20 vacantes seleccionadas específicamente para tu perfil que se agregarán a tu tablero",
      features: [
        "20 vacantes curadas",
        "Match personalizado",
        "Agregadas a tu tablero",
        "Entrega en 48 horas",
        "Llamada de 30mn para conocer tu perfil",
      ],
      icon: Target,
      popular: false,
    },
  ];

  const handleBookService = async (serviceId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar logueado para realizar el pago",
        variant: "destructive",
      });
      return;
    }

    setLoadingService(serviceId);

    try {
      // Crear sesión de checkout directamente
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            service_id: serviceId,
            success_url: `${window.location.origin}/dashboard/services?success=true`,
            cancel_url: `${window.location.origin}/dashboard/services?canceled=true`,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.checkout_url) {
        // Redirigir directamente a Stripe
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
      setLoadingService(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Servicios Adicionales</h2>
          <p className="text-muted-foreground">
            Acelera tu desarrollo profesional con servicios personalizados
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            (window.location.href = "/terms-and-conditions-aditional-services")
          }
          className="text-xs"
        >
          Ver Términos y Condiciones
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`shadow-card relative ${
              service.popular ? "border-primary" : ""
            }`}
          >
            {service.popular && (
              <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                Más Popular
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap min-w-0">
                    <span className="truncate">{service.title}</span>
                    {service.id === "consultation" &&
                      !hasPurchasedConsultation && (
                        <Badge className="bg-green-100 text-green-800 whitespace-nowrap px-2 py-0.5 text-xs">
                          50% OFF primera vez
                        </Badge>
                      )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </CardDescription>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="text-2xl font-bold text-primary">
                    {typeof service.price === "number"
                      ? `$${service.price}`
                      : service.price}
                  </div>
                  {service.id === "consultation" &&
                    !hasPurchasedConsultation && (
                      <div className="text-[10px] text-muted-foreground">
                        Precio regular $150 USD
                      </div>
                    )}
                  {typeof service.price === "number" && (
                    <div className="text-xs text-muted-foreground">USD</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Incluye:</h4>
                <ul className="space-y-1">
                  {service.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full"
                variant={service.popular ? "default" : "outline"}
                onClick={() => handleBookService(service.id)}
                disabled={loadingService === service.id}
              >
                {loadingService === service.id ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    {service.special ? "Aplica ahora" : "Adquirir Servicio"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
