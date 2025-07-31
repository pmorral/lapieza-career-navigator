import { useState } from "react";
import { Check, Star, Users, BookOpen, FileText, Target, MessageSquare, UserCheck, User, Lock, ArrowRight, TrendingUp, Award, Clock, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { LoginPage } from "./LoginPage";
import { TrialAIInterview } from "./TrialAIInterview";

interface LandingPageProps {
  onAccessDashboard: () => void;
  onLogin?: () => void;
}

export function LandingPage({ onAccessDashboard, onLogin }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("academy");

  if (showLogin) {
    return <LoginPage 
      onLogin={onLogin || onAccessDashboard} 
      onBackToLanding={() => setShowLogin(false)}
      onSignupToPay={onAccessDashboard}
    />;
  }

  const features = [
    {
      icon: FileText,
      title: "CV Boost",
      description: "Optimización profesional de tu CV con feedback personalizado"
    },
    {
      icon: Users,
      title: "LinkedIn Boost",
      description: "Optimización completa de tu perfil de LinkedIn"
    },
    {
      icon: Target,
      title: "Tablero de vacantes",
      description: "Seguimiento organizado de todas tus aplicaciones laborales"
    },
    {
      icon: MessageSquare,
      title: "Simulación de Entrevistas con AI",
      description: "Entrevistas simuladas con feedback detallado"
    },
    {
      icon: BookOpen,
      title: "E-learning Hub",
      description: "Cursos especializados en desarrollo profesional"
    },
    {
      icon: UserCheck,
      title: "Comunidad en Vivo",
      description: "Sesiones grupales y networking con profesionales"
    }
  ];

  const benefits = [
    "Acceso completo a todas las herramientas de empleabilidad",
    "Sesiones grupales cada 2 semanas por 5 meses",
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
            src="/lovable-uploads/01b87ef7-8706-4ed0-a34b-a79798c17337.png" 
            alt="Academy by LaPieza" 
            className="h-12"
          />
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowLogin(true)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <User className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">`
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-foreground">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20 w-fit mx-auto">
              <Heart className="w-4 h-4 mr-2" />
              Más de 320 casos de éxito
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Impulsa tu carrera con nuestro
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">programa 360° de empleabilidad</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
              Conviértete en el candidato ideal. Domina tu búsqueda laboral con IA, sesiones grupales, templates profesionales y recursos actualizados durante 5 meses.
            </p>

            <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
              <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-3 border">
                <Clock className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-bold text-xl text-foreground">2.5 meses</div>
                  <div className="text-sm text-muted-foreground">promedio de colocación</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-3 border">
                <TrendingUp className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-bold text-xl text-foreground">+320</div>
                  <div className="text-sm text-muted-foreground">casos de éxito</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-3 border">
                <Award className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-bold text-xl text-foreground">4.7/5</div>
                  <div className="text-sm text-muted-foreground">satisfacción</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  const trialSection = document.getElementById('trial-section');
                  trialSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Prueba gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold"
                onClick={() => setShowLogin(true)}
              >
                Regístrate
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Carousel */}
      <section className="py-12 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground mb-8 font-medium">
            Nuestros usuarios han sido contratados por empresas líderes
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

      {/* Platform Video Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Conoce nuestra plataforma
            </h3>
            <p className="text-lg text-muted-foreground">
              Descubre el valor agregado de nuestro programa a través de este video
            </p>
          </div>

          <Card className="text-center hover:shadow-lg transition-shadow group cursor-pointer max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="relative mb-4">
                <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                    <Play className="w-10 h-10 text-primary ml-2" />
                  </div>
                </div>
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                  Video Demo
                </Badge>
              </div>
              <CardTitle className="text-xl">Demo de la Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-6 text-base">
                Conoce todas las herramientas y funcionalidades que tendrás disponibles en Academy by LaPieza para impulsar tu carrera profesional.
              </CardDescription>
              <Button 
                size="lg"
                className="text-lg px-8 py-4"
                onClick={() => setShowLogin(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Herramientas que transforman tu búsqueda laboral
              </h3>
              <p className="text-lg text-muted-foreground">
                Tecnología avanzada y metodología comprobada diseñada por expertos en reclutamiento y empleabilidad
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Trial AI Interview Section */}
      <section id="trial-section" className="py-20 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Experimenta el poder de la IA
            </h3>
            <p className="text-lg text-muted-foreground">
              Prueba nuestra tecnología antes de unirte al programa completo
            </p>
          </div>
          
          <div className="flex justify-center">
            <TrialAIInterview />
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Lo que dicen nuestros usuarios
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Inversión en tu futuro profesional
            </h3>
            <p className="text-lg text-muted-foreground">
              Un solo plan, acceso completo
            </p>
          </div>

          <Card className="relative overflow-hidden border-2 border-primary shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Academy by LaPieza</CardTitle>
              <div className="text-4xl font-bold text-primary mb-2">
                $359 USD
              </div>
              <CardDescription className="text-lg">
                Único pago - Acceso completo durante 5 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {benefits.map((benefit, index) => (
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
                onClick={onAccessDashboard}
              >
                Comenzar Mi Transformación Profesional
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Academy by LaPieza
            </h4>
            <p className="text-muted-foreground mb-6">
              Transformando carreras profesionales desde 2020
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4">
                <a href="https://linkedin.com/company/academy-lapieza" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://tiktok.com/@academylapieza" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/academy.lapieza" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <span>© 2024 Academy by LaPieza</span>
                <span>•</span>
                <span>Términos y Condiciones</span>
                <span>•</span>
                <span>Política de Privacidad</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}