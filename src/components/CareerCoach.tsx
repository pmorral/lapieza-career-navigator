import { MessageCircle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function CareerCoach() {
  const coachInfo = {
    name: "María González",
    photo: "/placeholder.svg",
    whatsappLink: "https://wa.me/5215512345678",
    availability: "Lunes a Viernes 9:00 AM - 6:00 PM (Hora México)",
    specialties: ["LinkedIn Optimization", "Interview Preparation", "Career Strategy"]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Career Coach</h2>
        <p className="text-muted-foreground">Conecta con tu career coach asignada para recibir orientación personalizada</p>
      </div>

      {/* Coach Info Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Tu Career Coach Asignada
          </CardTitle>
          <CardDescription>
            Disponible para apoyarte en tu desarrollo profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={coachInfo.photo} alt={coachInfo.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {coachInfo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{coachInfo.name}</h3>
              <p className="text-sm text-muted-foreground">Career Coach Certificada</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{coachInfo.availability}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Especialidades:</h4>
            <div className="flex flex-wrap gap-2">
              {coachInfo.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              variant="professional"
              onClick={() => window.open(coachInfo.whatsappLink, '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chatear por WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Disponible solo durante horario laboral
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sesiones este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">+2 vs mes anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próxima sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Viernes 15 Mar</div>
            <p className="text-xs text-muted-foreground">10:00 AM - Revisión de CV</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tiempo de respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">&lt; 2h</div>
            <p className="text-xs text-muted-foreground">Tiempo promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Mensajes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={coachInfo.photo} alt={coachInfo.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  MG
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-accent p-3 rounded-lg rounded-tl-none">
                  <p className="text-sm">Hola! He revisado tu CV actualizado. Excelente trabajo con las mejoras que discutimos. ¿Te parece si agendamos una sesión para revisar tu estrategia de LinkedIn?</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <div className="flex-1 max-w-xs">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none">
                  <p className="text-sm">¡Perfecto! Sí, me gustaría agendar la sesión para LinkedIn. ¿Tienes disponibilidad el viernes?</p>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">Hace 1 hora</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t mt-4">
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ver conversación completa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}