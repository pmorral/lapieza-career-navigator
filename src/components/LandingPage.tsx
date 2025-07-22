import { useState } from "react";
import { Check, Star, Users, BookOpen, FileText, Target, MessageSquare, UserCheck, User, Lock, ArrowRight, TrendingUp, Award, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
    "Actualizaciones gratuitas de contenido y herramientas"
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

  const companyLogos = [
    { name: "Disney", src: "/lovable-uploads/cced4b4c-7deb-4dac-ad90-ecd3ad4a4637.png" },
    { name: "HSBC", src: "/lovable-uploads/84d3be31-3485-4f6b-93bf-8a36379a4cb2.png" },
    { name: "Nielsen", src: "/lovable-uploads/2e4864cb-2e37-49cc-88f8-cae9458d66f2.png" },
    { name: "Deloitte", src: "/lovable-uploads/6fc386bb-8736-48a3-83e6-5b95cf54ed89.png" },
    { name: "Warner Bros", src: "/lovable-uploads/7f911ddc-8bd9-4939-9458-0a2b9e698023.png" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <img 
            src="/lovable-uploads/db3312eb-7b7f-43e5-8ac7-8dc7be3850fb.png" 
            alt="Academy by LaPieza" 
            className="h-12"
          />
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowLogin(true)}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <User className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/80"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <Heart className="w-4 h-4 mr-2" />
            Más de 320 casos de éxito
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Impulsa tu carrera con nuestro 
            <span className="block text-accent">programa 360° de empleabilidad</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
            Conviértete en el candidato ideal. Accede a herramientas de IA, mentoría personalizada y una comunidad activa que te acompañará en cada paso de tu búsqueda laboral.
          </p>

          {/* Key Results */}
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-10">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <Clock className="w-6 h-6 text-accent" />
              <div className="text-left">
                <div className="font-bold text-2xl">2.5 meses</div>
                <div className="text-sm opacity-80">promedio de colocación</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <TrendingUp className="w-6 h-6 text-accent" />
              <div className="text-left">
                <div className="font-bold text-2xl">+320</div>
                <div className="text-sm opacity-80">casos de éxito</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <Award className="w-6 h-6 text-accent" />
              <div className="text-left">
                <div className="font-bold text-2xl">4.9/5</div>
                <div className="text-sm opacity-80">satisfacción</div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
            onClick={() => setShowLogin(true)}
          >
            Comenzar Mi Transformación
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Company Logos Carousel */}
      <section className="py-12 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground mb-8 font-medium">
            Nuestros estudiantes han sido contratados por empresas líderes
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-16 items-center justify-center">
              {[...companyLogos, ...companyLogos].map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <img 
                    src={logo.src} 
                    alt={logo.name}
                    className="h-12 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Herramientas que transforman tu búsqueda laboral
            </h3>
            <p className="text-lg text-muted-foreground">
              Tecnología avanzada y metodología comprobada diseñada por expertos en reclutamiento y empleabilidad
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