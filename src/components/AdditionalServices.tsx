import { Calendar, DollarSign, Clock, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdditionalServices() {
  const services = [
    {
      id: "interview-30",
      title: "Entrevista con Career Coach",
      duration: "30 minutos",
      price: 35,
      description: "Sesión personalizada para simulación de entrevista con un especialista",
      features: ["Análisis personalizado", "Feedback inmediato", "Plan de acción", "Grabación de la sesión"],
      icon: Users,
      popular: false
    },
    {
      id: "consultation",
      title: "Asesoría General de Empleabilidad",
      duration: "60 minutos",
      price: 50,
      description: "Orientación general sobre tu carrera profesional y estrategias de empleabilidad",
      features: ["Análisis de perfil", "Roadmap profesional", "Recomendaciones", "Recursos adicionales"],
      icon: Briefcase,
      popular: true
    },
    {
      id: "job-search",
      title: "Búsqueda estratégica de empleo",
      duration: "60 minutos",
      price: 50,
      description: "Paquete de búsqueda de vacantes personalizadas y seleccionadas específicamente para tu perfil",
      features: ["Análisis de match", "Enlaces directos", "Tips por vacante", "Estrategia de búsqueda"],
      icon: Briefcase,
      popular: false
    },
    {
      id: "employment-program",
      title: "Programa Empleabilidad Personalizado",
      duration: "Seguimiento completo",
      price: "Una quincena de tu próximo salario bruto",
      description: "Te acompañamos durante tu búsqueda de empleo con seguimiento personalizado",
      features: ["Tres asesorías personalizadas con tu Career Coach", "Seguimiento con un Career Coach a través de WhatsApp", "Acceso a una comunidad en WhatsApp", "Simulaciones de entrevista con diferentes expertos", "Benchmark de Job Boards de nicho"],
      icon: Users,
      popular: true
    }
  ];

  const handleBookService = (serviceId: string) => {
    // Aquí se implementaría la lógica de pago/booking
    console.log(`Booking service: ${serviceId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Servicios Adicionales</h2>
        <p className="text-muted-foreground">Acelera tu desarrollo profesional con servicios personalizados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id} className={`shadow-card relative ${service.popular ? 'border-primary' : ''}`}>
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
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">${service.price}</div>
                  <div className="text-xs text-muted-foreground">USD</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{service.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Incluye:</h4>
                <ul className="space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
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
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Ahora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Payment History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Historial de Servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-medium">Entrevista con Career Coach</p>
                <p className="text-sm text-muted-foreground">8 Mar 2024 - 30 min</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$35 USD</p>
                <Badge variant="secondary" className="text-xs">Completado</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-medium">Recomendación de Vacantes</p>
                <p className="text-sm text-muted-foreground">1 Mar 2024 - 20 vacantes</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$50 USD</p>
                <Badge variant="secondary" className="text-xs">Entregado</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}