import { useState } from "react";
import { Check, Star, Users, BookOpen, FileText, Target, MessageSquare, UserCheck, User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoginPage } from "./LoginPage";

interface LandingPageProps {
  onAccessDashboard: () => void;
}

export function LandingPage({ onAccessDashboard }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("academy");

  if (showLogin) {
    return <LoginPage onLogin={onAccessDashboard} onBackToLanding={() => setShowLogin(false)} />;
  }

  const features = [
    {
      icon: FileText,
      title: "CV Boost",
      description: "Optimización profesional de tu CV con feedback personalizado"
    },
    {
      icon: Users,
      title: "LinkedIn Optimizer",
      description: "Optimización completa de tu perfil de LinkedIn"
    },
    {
      icon: Target,
      title: "Job Tracker",
      description: "Seguimiento organizado de todas tus aplicaciones laborales"
    },
    {
      icon: MessageSquare,
      title: "Mock Interviews",
      description: "Entrevistas simuladas con feedback detallado"
    },
    {
      icon: BookOpen,
      title: "E-learning Hub",
      description: "Cursos especializados en desarrollo profesional"
    },
    {
      icon: UserCheck,
      title: "Career Coach",
      description: "Mentoría personalizada con coach certificado"
    }
  ];

  const benefits = [
    "Acceso completo a todas las herramientas de empleabilidad",
    "Sesiones grupales cada 2 semanas por 6 meses",
    "Grupo exclusivo de WhatsApp para networking",
    "Templates profesionales para comunicación laboral",
    "Seguimiento personalizado de tu progreso",
    "Certificados de finalización de cursos",
    "Soporte continuo por 6 meses",
    "Actualizaciones gratuitas de contenido"
  ];

  const testimonials = [
    {
      name: "Ana García",
      role: "Marketing Manager",
      content: "Gracias a LaPieza Academy conseguí mi trabajo soñado en menos de 2 meses. Las herramientas son increíbles.",
      rating: 5
    },
    {
      name: "Carlos Mendoza",
      role: "Software Developer",
      content: "El programa me ayudó a optimizar mi perfil y mejorar mis habilidades de entrevista. 100% recomendado.",
      rating: 5
    },
    {
      name: "María López",
      role: "Project Manager",
      content: "La mentoría personalizada fue clave para mi transición profesional. Valió cada peso invertido.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              🚀 6 MESES DE ACCESO COMPLETO
            </Badge>
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/db3312eb-7b7f-43e5-8ac7-8dc7be3850fb.png" 
                alt="Academy by LaPieza" 
                className="h-20"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Impulsa tu carrera profesional con nuestro programa integral de 6 meses
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Acceso completo por 6 meses: herramientas de IA, coach personalizada, templates exclusivos y comunidad activa para acelerar tu crecimiento profesional
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4" 
                variant="professional"
                onClick={() => setShowLogin(true)}
              >
                Iniciar Sesión
                <User className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4"
                onClick={() => setShowLogin(true)}
              >
                Crear Cuenta
                <Lock className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>500+ profesionales exitosos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitas para conseguir trabajo
            </h3>
            <p className="text-lg text-muted-foreground">
              Herramientas profesionales diseñadas por expertos en recruiting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              ¿Qué incluye tu membresía?
            </h3>
            <p className="text-lg text-muted-foreground">
              Acceso completo a todas nuestras herramientas y beneficios exclusivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Lo que dicen nuestros estudiantes
            </h3>
            <p className="text-lg text-muted-foreground">
              Historias reales de profesionales que transformaron su carrera
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Inversión en tu futuro profesional
            </h3>
            <p className="text-lg text-muted-foreground">
              Acceso completo durante 6 meses
            </p>
          </div>

          <Card className="relative overflow-hidden border-2 border-primary shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
            <CardHeader className="text-center pb-8">
              <Badge variant="secondary" className="w-fit mx-auto mb-4">
                Más Popular
              </Badge>
              <CardTitle className="text-2xl mb-2">LaPieza Academy</CardTitle>
              <div className="text-4xl font-bold text-primary mb-2">
                $359 USD
              </div>
              <CardDescription className="text-lg">
                Acceso completo durante 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {benefits.slice(0, 6).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="w-full text-lg py-4"
                variant="professional"
                onClick={() => setShowLogin(true)}
              >
                Comenzar Mi Transformación Profesional
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                Garantía de satisfacción de 30 días
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              LaPieza Academy
            </h4>
            <p className="text-muted-foreground mb-6">
              Transformando carreras profesionales desde 2020
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 LaPieza Academy</span>
              <span>•</span>
              <span>Términos y Condiciones</span>
              <span>•</span>
              <span>Política de Privacidad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}