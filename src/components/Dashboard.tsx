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
  Edit,
  Save,
  X,
  RefreshCw,
  TrendingUp,
  History,
  MessageCircle,
  PanelLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { AdditionalServices } from "./AdditionalServices";
import { GeneralSettings } from "./GeneralSettings";
import { AutomatedMessages } from "./AutomatedMessages";
import { CVBoost } from "./CVBoost";
import { PaymentSettings } from "./PaymentSettings";
import { JobSuccess } from "./JobSuccess";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  defaultSection?: string;
}

export function Dashboard({ defaultSection = "overview" }: DashboardProps) {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [showJobSuccess, setShowJobSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Sincronizar la sección activa con la URL
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const sectionFromUrl = pathSegments[pathSegments.length - 1];

    if (sectionFromUrl && sectionFromUrl !== "dashboard") {
      setActiveSection(sectionFromUrl);
    }
  }, [location.pathname]);

  // Navegar a la URL correspondiente cuando cambie la sección
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    navigate(`/dashboard/${section}`);
    // Scroll to top when section changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Get user profile
    const getUserProfile = async () => {
      if (user) {
        try {
          setIsLoadingProfile(true);
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error loading profile:", error);
            toast({
              title: "Error",
              description: "No se pudo cargar el perfil del usuario",
              variant: "destructive",
            });
          } else {
            setUserProfile(profile);
            setEditedProfile(profile);
          }
        } catch (error) {
          console.error("Error in getUserProfile:", error);
          toast({
            title: "Error",
            description: "Error al cargar el perfil",
            variant: "destructive",
          });
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    getUserProfile();
  }, [user, toast]);

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

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setEditedProfile(userProfile || {});
  };

  const handleProfileSave = async () => {
    if (!user || !userProfile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(editedProfile)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setUserProfile({ ...userProfile, ...editedProfile });
      setIsEditingProfile(false);
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setEditedProfile(userProfile || {});
  };

  const menuItems = [
    {
      id: "overview",
      label: "Panel Principal",
      icon: Home,
      path: "/dashboard/overview",
    },
    {
      id: "interviews",
      label: "Simulación de Entrevistas con AI",
      icon: MessageSquare,
      path: "/dashboard/interviews",
    },
    {
      id: "cv-boost",
      label: "CV Boost",
      icon: FileText,
      path: "/dashboard/cv-boost",
    },
    {
      id: "linkedin",
      label: "LinkedIn Boost",
      icon: Users,
      path: "/dashboard/linkedin",
    },
    {
      id: "job-tracker",
      label: "Tablero de Vacantes",
      icon: Target,
      path: "/dashboard/job-tracker",
    },
    {
      id: "automated-messages",
      label: "Templates de Empleabilidad",
      icon: Users,
      path: "/dashboard/automated-messages",
    },
    {
      id: "services",
      label: "Servicios Adicionales",
      icon: DollarSign,
      path: "/dashboard/services",
    },
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
        return (
          <div className="space-y-8">
            <AdditionalServices />
          </div>
        );
      case "settings":
        return <GeneralSettings />;
      case "profile":
        return (
          <UserProfileSection
            userProfile={userProfile}
            isLoadingProfile={isLoadingProfile}
            isEditingProfile={isEditingProfile}
            editedProfile={editedProfile}
            setEditedProfile={setEditedProfile}
            onEdit={handleProfileEdit}
            onSave={handleProfileSave}
            onCancel={handleProfileCancel}
          />
        );
      case "membership":
        return <MembershipDetails />;
      case "payment":
        return <PaymentSettings />;
      default:
        return <DashboardOverview setActiveSection={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 ${
            sidebarCollapsed ? "w-14" : "w-64"
          } bg-card border-r border-border shadow-card transition-all duration-200`}
        >
          <div className="flex flex-col h-full">
            <div className={`p-6 ${sidebarCollapsed ? "px-2" : "px-6"}`}>
              <div className="flex justify-center mb-2">
                <img
                  src="/favicon.ico"
                  alt="Academy by LaPieza"
                  className={`h-8 ${sidebarCollapsed ? "scale-90" : ""}`}
                />
              </div>
              {!sidebarCollapsed && (
                <p className="text-sm text-muted-foreground text-center">
                  Impulsa tu potencial profesional
                </p>
              )}
            </div>

            <nav className="flex-1 px-2 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 ${
                    sidebarCollapsed ? "px-3 justify-center" : "px-4"
                  } py-3 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 ${
            sidebarCollapsed ? "ml-14" : "ml-64"
          } transition-all duration-200`}
        >
          <header className="bg-card border-b border-border px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Colapsar menú"
                  onClick={() => setSidebarCollapsed((v) => !v)}
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSectionChange("overview")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </Button>
                    {activeSection !== "overview" && (
                      <>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-foreground font-medium">
                          {menuItems.find((item) => item.id === activeSection)
                            ?.label || "Sección"}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {menuItems.find((item) => item.id === activeSection)
                      ?.label || "Panel Principal"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu desarrollo profesional
                  </p>
                </div>
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
                    onClick={() => handleSectionChange("settings")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSectionChange("membership")}
                  >
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Mi Membresía
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
      "https://wa.me/+523337872943?text=Hola%20María,%20necesito%20ayuda%20con%20mi%20desarrollo%20profesional",
    availability: "Disponible",
    specialties: ["Entrevistas", "CV", "LinkedIn", "Networking"],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acciones Rápidas centrado */}
        <div className="lg:col-span-2 flex justify-center">
          <Card className="shadow-card w-full max-w-xl">
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
        </div>

        {/* WhatsApp Coach Highlight */}
        <Card className="shadow-card border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <MessageCircle className="w-5 h-5" />
              ¿Necesitas ayuda inmediata?
            </CardTitle>
            <CardDescription className="text-green-700">
              Escríbenos por WhatsApp y te apoyamos al instante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.open(coachInfo.whatsappLink, "_blank")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar mensaje por WhatsApp
            </Button>
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
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    plan: string;
    status: string;
    startDate: string;
    endDate: string | null;
    credits: number;
    customerId: string | null;
    subscriptionId: string | null;
    amount: number;
    currency: string;
    nextBillingDate: string | null;
  } | null>(null);

  interface SubscriptionRow {
    plan_type: string | null;
    amount_paid: number | null;
    currency: string | null;
    status: string | null;
    started_at: string | null;
    expires_at: string | null;
    id?: string | null;
    stripe_customer_id?: string | null;
  }

  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      if (!user) return;

      try {
        setIsLoadingPayment(true);

        // Perfil base
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Suscripción desde función
        const { data: subResp } = await supabase.functions.invoke(
          "get-user-subscription",
          { body: { user_id: user.id } }
        );

        const sub = subResp?.subscription as {
          plan_type: string | null;
          amount_paid: number | null;
          currency: string | null;
          status: string | null;
          started_at: string | null;
          expires_at: string | null;
          id?: string | null;
          stripe_customer_id?: string | null;
        } | null;

        let details = {
          plan: profile?.subscription_plan || "Academy",
          status: profile?.subscription_status || "inactive",
          startDate: profile?.created_at || new Date().toISOString(),
          endDate: null as string | null,
          credits: profile?.interview_credits || 0,
          customerId: null as string | null,
          subscriptionId: null as string | null,
          amount: 149.0,
          currency: "usd",
          nextBillingDate: null as string | null,
        };

        if (sub) {
          const planKey = (sub.plan_type || "6months").toLowerCase();
          details = {
            plan:
              planKey === "12months"
                ? "Academy - 12 Meses"
                : "Academy - 6 Meses",
            status: sub.status || "active",
            startDate: sub.started_at || details.startDate,
            endDate: sub.expires_at || null,
            credits: details.credits,
            customerId: sub.stripe_customer_id || null,
            subscriptionId: sub.id || null,
            amount:
              typeof sub.amount_paid === "number"
                ? Math.max(0, sub.amount_paid / 100)
                : planKey === "12months"
                ? 199
                : 149,
            currency: (sub.currency || "usd").toLowerCase(),
            nextBillingDate: null,
          };
        }

        setSubscriptionDetails(details);
      } catch (error) {
        console.error("Error loading subscription info:", error);
        toast({
          title: "Error",
          description: "Error al cargar la información de suscripción",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPayment(false);
      }
    };

    loadSubscriptionInfo();
  }, [user, toast]);

  const handleRenewal = async () => {
    try {
      // Redirigir a la página de pago para renovar
      window.location.href = "/payment";
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la renovación",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async () => {
    try {
      // Redirigir a la página de pago para upgrade
      window.location.href = "/payment";
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la actualización",
        variant: "destructive",
      });
    }
  };

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

  // Si está cargando la información de pago
  if (isLoadingPayment) {
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
  if (subscriptionDetails?.status !== "active") {
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
                onClick={handleRenewal}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Activar Membresía
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planes disponibles */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Planes Disponibles
            </CardTitle>
            <CardDescription>
              Elige el plan que mejor se adapte a tus necesidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan de 6 meses */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">
                  Academy - 6 Meses
                </h4>
                <p className="text-2xl font-bold text-primary mb-2">
                  $149<span className="text-base">149 USD</span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  6 meses de acceso completo
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li>• CV Boost con AI</li>
                  <li>• LinkedIn Optimizer</li>
                  <li>• 5 Entrevistas AI</li>
                  <li>• E-learning Hub</li>
                  <li>• Job Tracker</li>
                </ul>
                <Button onClick={handleRenewal} className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Activar Plan
                </Button>
              </div>

              {/* Plan de 12 meses */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">
                  Academy - 12 Meses
                </h4>
                <p className="text-2xl font-bold text-primary mb-2">
                  $199<span className="text-base"> USD</span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  12 meses de acceso completo
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li>• CV Boost con AI</li>
                  <li>• LinkedIn Optimizer</li>
                  <li>• 5 Entrevistas AI</li>
                  <li>• E-learning Hub</li>
                  <li>• Job Tracker</li>
                </ul>
                <Button onClick={handleRenewal} className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Activar Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el usuario tiene pago activo, mostrar información de la membresía
  return (
    <div className="space-y-6">
      {/* Estado de la membresía */}
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
          {subscriptionDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-semibold text-lg">
                  {subscriptionDetails.plan}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-semibold text-lg text-green-600">
                  {subscriptionDetails.status === "active"
                    ? "Activo"
                    : subscriptionDetails.status}
                </p>
              </div>
            </div>
          )}

          {/* Información de la suscripción */}
          {subscriptionDetails && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fecha de inicio:</span>
                <span className="font-medium">
                  {new Date(subscriptionDetails.startDate).toLocaleDateString(
                    "es-MX"
                  )}
                </span>
              </div>
              {subscriptionDetails.endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha de fin:</span>
                  <span className="font-medium">
                    {new Date(subscriptionDetails.endDate).toLocaleDateString(
                      "es-MX"
                    )}
                  </span>
                </div>
              )}
              {subscriptionDetails.nextBillingDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Próxima facturación:
                  </span>
                  <span className="font-medium">
                    {new Date(
                      subscriptionDetails.nextBillingDate
                    ).toLocaleDateString("es-MX")}
                  </span>
                </div>
              )}
              {subscriptionDetails.customerId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID de Cliente:</span>
                  <span className="font-medium text-xs font-mono">
                    {subscriptionDetails.customerId}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones de membresía */}
      <Card className="shadow-card hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Gestionar Membresía
          </CardTitle>
          <CardDescription>Acciones disponibles para tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleRenewal}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Renovar Membresía
            </Button>
            <Button
              variant="outline"
              onClick={handleUpgrade}
              className="w-full"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Actualizar Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información del Customer */}
      {subscriptionDetails?.customerId && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información del Cliente
            </CardTitle>
            <CardDescription>Detalles de tu cuenta en Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer ID:</span>
                <span className="font-medium text-xs font-mono">
                  {subscriptionDetails.customerId}
                </span>
              </div>
              {subscriptionDetails.subscriptionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subscription ID:
                  </span>
                  <span className="font-medium text-xs font-mono">
                    {subscriptionDetails.subscriptionId}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan actual:</span>
                <span className="font-medium">{subscriptionDetails.plan}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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

  const downloadTemplate = async (template: {
    downloadUrl: string;
    name: string;
  }) => {
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

function UserProfileSection({
  userProfile,
  isLoadingProfile,
  isEditingProfile,
  editedProfile,
  setEditedProfile,
  onEdit,
  onSave,
  onCancel,
}: {
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  isEditingProfile: boolean;
  editedProfile: Partial<UserProfile>;
  setEditedProfile: (profile: Partial<UserProfile>) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (isLoadingProfile) {
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

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Perfil no encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Mi Perfil
            </CardTitle>
            <CardDescription>
              Gestiona tus datos personales y de contacto
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditingProfile ? (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={onSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="full_name" className="text-sm">
                  Nombre Completo
                </Label>
                <Input
                  id="full_name"
                  value={editedProfile.full_name || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      full_name: e.target.value,
                    })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      email: e.target.value,
                    })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="phone" className="text-sm">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={editedProfile.phone || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      phone: e.target.value,
                    })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="linkedin" className="text-sm">
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={editedProfile.linkedin_url || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      linkedin_url: e.target.value,
                    })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="bio" className="text-sm">
                  Biografía
                </Label>
                <Textarea
                  id="bio"
                  value={editedProfile.bio || ""}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, bio: e.target.value })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="skills" className="text-sm">
                  Habilidades
                </Label>
                <Input
                  id="skills"
                  value={editedProfile.skills || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      skills: e.target.value,
                    })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="experience" className="text-sm">
                  Experiencia
                </Label>
                <Textarea
                  id="experience"
                  value={editedProfile.experience || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      experience: e.target.value,
                    })
                  }
                  disabled={!isEditingProfile}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
