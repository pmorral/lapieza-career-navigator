import { useState } from "react";
import { FileText, Users, BookOpen, MessageSquare, Target, Home, Upload, Download, Play, Plus, UserCheck, DollarSign, Gift, Settings, FileBarChart, CreditCard, User, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LinkedInOptimizer } from "./LinkedInOptimizer";
import { JobTracker } from "./JobTracker";
import { ELearningHub } from "./ELearningHub";
import { MockInterviews } from "./MockInterviews";
import { CareerCoach } from "./CareerCoach";
import { AdditionalServices } from "./AdditionalServices";
import { ReferAndEarn } from "./ReferAndEarn";
import { GeneralSettings } from "./GeneralSettings";
import { AutomatedMessages } from "./AutomatedMessages";
import { CVBoost } from "./CVBoost";
import { PaymentSettings } from "./PaymentSettings";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Panel Principal", icon: Home },
    { id: "learning", label: "E-learning", icon: BookOpen },
    { id: "cv-boost", label: "CV Boost", icon: FileText },
    { id: "linkedin", label: "LinkedIn Boost", icon: Users },
    { id: "job-tracker", label: "Tablero de Vacantes", icon: Target },
    { id: "interviews", label: "Simulación de Entrevistas con AI", icon: MessageSquare },
    { id: "automated-messages", label: "Templates de Empleabilidad", icon: Users },
    { id: "services", label: "Servicios Adicionales", icon: DollarSign },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "cv-boost":
        return <CVBoost />;
      case "linkedin":
        return <LinkedInOptimizer />;
      case "job-tracker":
        return <JobTracker />;
      case "learning":
        return <ELearningHub />;
      case "interviews":
        return <MockInterviews />;
      case "automated-messages":
        return <AutomatedMessages />;
      case "services":
        return <AdditionalServices />;
      case "settings":
        return <GeneralSettings />;
      case "membership":
        return <MembershipDetails />;
      case "payment":
        return <PaymentSettings />;
      default:
        return <DashboardOverview setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-card">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <div className="flex justify-center mb-2">
                <img 
                  src="/lovable-uploads/db3312eb-7b7f-43e5-8ac7-8dc7be3850fb.png" 
                  alt="Academy by LaPieza" 
                  className="h-8"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Impulsa tu potencial profesional
              </p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    // Scroll to top when section changes
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {menuItems.find(item => item.id === activeSection)?.label || "Panel Principal"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu desarrollo profesional
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSection("membership")}>
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Mi Membresía
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSection("payment")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Métodos de Pago
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Comienza tu desarrollo profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("cv-boost")}
            >
              <Upload className="w-4 h-4 mr-2" />
              CV Boost
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("linkedin")}
            >
              <Users className="w-4 h-4 mr-2" />
              Optimizar Perfil LinkedIn
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("job-tracker")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Aplicación Laboral
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("interviews")}
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Entrevista Simulada
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open("https://wa.me/+525555555555?text=Hola,%20necesito%20soporte%20con%20mi%20cuenta%20de%20Academy", "_blank")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chatear con Soporte
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Eventos del Mes
            </CardTitle>
            <CardDescription>
              Próximas sesiones y actividades programadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h4 className="font-medium text-sm">Estrategias de Networking</h4>
                </div>
                <p className="text-xs text-muted-foreground">Jueves 25 de Julio, 2024 - 7:00 PM</p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <h4 className="font-medium text-sm">Workshop CV Optimization</h4>
                </div>
                <p className="text-xs text-muted-foreground">Martes 30 de Julio, 2024 - 6:00 PM</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <h4 className="font-medium text-sm">Simulacro de Entrevistas</h4>
                </div>
                <p className="text-xs text-muted-foreground">Viernes 2 de Agosto, 2024 - 7:30 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Sesiones de Comunidad
            </CardTitle>
            <CardDescription>
              Acceso a sesiones quincenales y grupo de WhatsApp durante tu membresía de 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <h4 className="font-medium mb-2">Próxima Sesión Grupal</h4>
                <p className="text-sm font-medium text-primary">Estrategias de Networking</p>
                <p className="text-xs text-muted-foreground mb-4">Jueves 25 de Julio, 2024 - 7:00 PM (Hora México)</p>
                <Button size="sm" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Acceder a la sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MembershipDetails() {
  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-primary" />
            Mi Membresía
          </CardTitle>
          <CardDescription>
            Acceso por 6 meses - Gestiona tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">Academy Premium</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Válido hasta:</span>
              <span className="font-medium text-warning">31 Jul 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio pagado:</span>
              <span className="font-medium">$359 USD</span>
            </div>
          </div>
          
          <div className="pt-2 border-t space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Descargar Invoice
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Historial de Pagos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}