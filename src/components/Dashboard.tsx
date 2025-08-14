import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  BookOpen,
  MessageSquare,
  Target,
  Home,
  Upload,
  Download,
  Play,
  Plus,
  UserCheck,
  DollarSign,
  Gift,
  Settings,
  FileBarChart,
  CreditCard,
  User,
  ChevronDown,
  Calendar,
  Trophy,
  Eye,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment, StripeInvoice } from "@/hooks/use-payment";
import { LoadingSpinner } from "./LoadingSpinner";
import { UserProfile } from "@/types/payment";
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
import { JobSuccess } from "./JobSuccess";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showJobSuccess, setShowJobSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user profile
    const getUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setUserProfile(profile);
      }
    };

    getUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { id: "overview", label: "Panel Principal", icon: Home },
    {
      id: "interviews",
      label: "Simulación de Entrevistas con AI",
      icon: MessageSquare,
    },
    { id: "cv-boost", label: "CV Boost", icon: FileText },
    { id: "linkedin", label: "LinkedIn Boost", icon: Users },
    { id: "job-tracker", label: "Tablero de Vacantes", icon: Target },
    { id: "learning", label: "E-learning", icon: BookOpen },
    {
      id: "automated-messages",
      label: "Templates de Empleabilidad",
      icon: Users,
    },
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
                  src="/lovable-uploads/01b87ef7-8706-4ed0-a34b-a79798c17337.png"
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                  {menuItems.find((item) => item.id === activeSection)?.label ||
                    "Panel Principal"}
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
                  <DropdownMenuItem
                    onClick={() => setActiveSection("settings")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveSection("membership")}
                  >
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Mi Membresía
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveSection("payment")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Métodos de Pago
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowJobSuccess(true)}>
                    <Trophy className="w-4 h-4 mr-2" />
                    ¡Conseguí Empleo!
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="p-6">{renderContent()}</main>
        </div>
      </div>

      {showJobSuccess && (
        <JobSuccess onClose={() => setShowJobSuccess(false)} />
      )}
    </div>
  );
}

function DashboardOverview({
  setActiveSection,
}: {
  setActiveSection: (section: string) => void;
}) {
  const coachInfo = {
    name: "María González",
    photo: "/lovable-uploads/team-collaboration.png",
    whatsappLink:
      "https://wa.me/+525555555555?text=Hola%20María,%20necesito%20ayuda%20con%20mi%20desarrollo%20profesional",
    availability: "Disponible",
    specialties: ["Entrevistas", "CV", "LinkedIn", "Networking"],
  };

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
                  <h4 className="font-medium text-sm">
                    Estrategias de Networking
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jueves 25 de Julio, 2024 - 7:00 PM
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <h4 className="font-medium text-sm">
                    Workshop CV Optimization
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Martes 30 de Julio, 2024 - 6:00 PM
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <h4 className="font-medium text-sm">
                    Simulacro de Entrevistas
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Viernes 2 de Agosto, 2024 - 7:30 PM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CV Templates Section */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Templates de CV Profesionales
            </CardTitle>
            <CardDescription>
              Descarga templates optimizados para ATS y diferentes industrias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CVTemplatesPreview setActiveSection={setActiveSection} />
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
              Acceso a sesiones quincenales y grupo de WhatsApp durante tu
              membresía de 5 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <h4 className="font-medium mb-2">Próxima Sesión Grupal</h4>
                <p className="text-sm font-medium text-primary">
                  Estrategias de Networking
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Jueves 25 de Julio, 2024 - 7:00 PM (Hora México)
                </p>
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
  const { user } = useAuth();
  const { checkPaymentStatus } = usePayment();
  const { toast } = useToast();
  const [stripeInvoice, setStripeInvoice] = useState<StripeInvoice | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Cargar estado del pago y comprobante de Stripe
  useEffect(() => {
    const loadPaymentInfo = async () => {
      if (!user) return;

      try {
        const status = await checkPaymentStatus();
        if (status) {
          setPaymentStatus(status.payment_status);

          // Solo cargar invoice si el pago está activo
          if (status.payment_status === "paid") {
            // Por ahora no tenemos getStripeInvoice implementado
            // setStripeInvoice(invoice);
          }
        }
      } catch (error) {
        console.error("Error loading payment info:", error);
      }
    };

    loadPaymentInfo();
  }, [user, checkPaymentStatus]);

  // Si no hay usuario, mostrar loading
  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el usuario no tiene pago activo, mostrar opción para activar
  if (paymentStatus === "unpaid" || !paymentStatus) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <FileBarChart className="w-5 h-5" />
              Membresía Inactiva
            </CardTitle>
            <CardDescription className="text-amber-700">
              No tienes una membresía activa. Activa tu cuenta para acceder a
              todas las funcionalidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button
                onClick={() => (window.location.href = "/payment")}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Activar Membresía
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el usuario tiene pago activo, mostrar información de la membresía
  return (
    <div className="space-y-6">
      <Card className="shadow-card border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileBarChart className="w-5 h-5" />
            Mi Membresía
          </CardTitle>
          <CardDescription className="text-green-700">
            Acceso activo - Gestiona tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stripeInvoice ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto pagado:</span>
                  <span className="font-medium">
                    ${stripeInvoice.payment.amount.toFixed(2)}{" "}
                    {stripeInvoice.payment.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha de pago:</span>
                  <span className="font-medium">
                    {new Date(
                      Number(stripeInvoice.payment.created) * 1000
                    ).toLocaleDateString("es-MX")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ID de transacción:
                  </span>
                  <span className="font-medium text-xs font-mono">
                    {stripeInvoice.payment.id}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Membresía activa - Información del pago disponible próximamente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Import template preview images
import templateExecutivePreview from "@/assets/template-executive-preview.jpg";
import templateCreativePreview from "@/assets/template-creative-preview.jpg";
import templateTechPreview from "@/assets/template-tech-preview.jpg";
import templateMinimalPreview from "@/assets/template-minimal-preview.jpg";
import templateAtsPreview from "@/assets/template-ats-preview.jpg";

function CVTemplatesPreview({
  setActiveSection,
}: {
  setActiveSection: (section: string) => void;
}) {
  const { toast } = useToast();

  const cvTemplates = [
    {
      id: 1,
      name: "Template Profesional Executive",
      description: "Ideal para roles ejecutivos y gerenciales",
      image: templateExecutivePreview,
      downloadUrl:
        "https://qgxpzuaeorjkcjwwphjt.supabase.co/storage/v1/object/public/cv-templates/Executive%20Resume%20Template.docx",
    },
    {
      id: 2,
      name: "Template Creativo Designer",
      description: "Perfecto para diseñadores y creativos",
      image: templateCreativePreview,
      downloadUrl:
        "https://qgxpzuaeorjkcjwwphjt.supabase.co/storage/v1/object/public/cv-templates/Graduate%20Resume%20Template.docx",
    },
    {
      id: 3,
      name: "Template Tech Developer",
      description: "Optimizado para desarrolladores y IT",
      image: templateTechPreview,
      downloadUrl:
        "https://qgxpzuaeorjkcjwwphjt.supabase.co/storage/v1/object/public/cv-templates/Professional%20Resume%20Template.docx",
    },
    {
      id: 4,
      name: "Template Minimalista Clean",
      description: "Elegante y simple para cualquier sector",
      image: templateMinimalPreview,
      downloadUrl:
        "https://qgxpzuaeorjkcjwwphjt.supabase.co/storage/v1/object/public/cv-templates/Classic%20Resume%20Template.docx",
    },
    {
      id: 5,
      name: "Template ATS Optimized",
      description: "Máxima compatibilidad con sistemas ATS",
      image: templateAtsPreview,
      downloadUrl:
        "https://qgxpzuaeorjkcjwwphjt.supabase.co/storage/v1/object/public/cv-templates/Business%20Resume%20Template.docx",
    },
  ];

  const downloadTemplate = async (template: any) => {
    try {
      console.log("Download attempt starting for template:", template);
      console.log("Download URL:", template.downloadUrl);

      toast({
        title: "Descargando template...",
        description: "Por favor espera mientras se descarga el archivo",
      });

      // Test if URL is accessible first
      console.log("Testing URL accessibility...");
      const response = await fetch(template.downloadUrl, {
        method: "HEAD",
      });

      console.log("HEAD response status:", response.status);
      console.log(
        "HEAD response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        console.error("HEAD request failed with status:", response.status);
        throw new Error(
          `HTTP ${response.status}: Error al acceder al template`
        );
      }

      // Now fetch the actual file
      console.log("Fetching file content...");
      const fileResponse = await fetch(template.downloadUrl);

      console.log("File response status:", fileResponse.status);
      console.log(
        "File response headers:",
        Object.fromEntries(fileResponse.headers.entries())
      );

      if (!fileResponse.ok) {
        console.error("File fetch failed with status:", fileResponse.status);
        throw new Error(
          `HTTP ${fileResponse.status}: Error al descargar el template`
        );
      }

      // Create blob from response
      const blob = await fileResponse.blob();
      console.log("Blob created, size:", blob.size, "type:", blob.type);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, "-")}.docx`;

      console.log("Download link created:", link.href);
      console.log("Download filename:", link.download);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download completed successfully");
      toast({
        title: "¡Template descargado!",
        description: `${template.name} se ha descargado exitosamente`,
      });
    } catch (error) {
      console.error("Download error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      toast({
        title: "Error al descargar",
        description: `Error: ${error.message}. Verifica la consola para más detalles.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cvTemplates.slice(0, 3).map((template) => (
          <div
            key={template.id}
            className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="aspect-[3/4] bg-muted rounded-lg mb-3 overflow-hidden">
              <img
                src={template.image}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <h4 className="font-medium text-sm mb-1">{template.name}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {template.description}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => downloadTemplate(template)}
              >
                <Download className="w-3 h-3 mr-1" />
                Descargar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  console.log("Preview attempt for template:", template);
                  console.log("Image URL:", template.image);
                  console.log("Attempting to open in new tab...");

                  try {
                    // Preview functionality - open image in new tab
                    const opened = window.open(template.image, "_blank");
                    console.log("Window.open result:", opened);

                    if (!opened) {
                      console.error("Failed to open new tab - popup blocked?");
                      toast({
                        title: "Error al abrir preview",
                        description:
                          "No se pudo abrir la vista previa. Verifica que no estén bloqueados los popups.",
                        variant: "destructive",
                      });
                    } else {
                      console.log("Preview opened successfully");
                    }
                  } catch (error) {
                    console.error("Preview error:", error);
                    toast({
                      title: "Error al abrir preview",
                      description: `Error: ${error.message}`,
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center pt-4 border-t border-border">
        <Button variant="outline" onClick={() => setActiveSection("cv-boost")}>
          <FileText className="w-4 h-4 mr-2" />
          Ver todos los templates
        </Button>
      </div>
    </div>
  );
}
