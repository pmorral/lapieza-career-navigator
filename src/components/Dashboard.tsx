import { useState } from "react";
import { FileText, Users, BookOpen, MessageSquare, Target, Home, Upload, Download, Play, Plus, UserCheck, DollarSign, Gift, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CVAnalyzer } from "./CVAnalyzer";
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

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "learning", label: "E-learning", icon: BookOpen },
    { id: "cv-boost", label: "CV Boost", icon: FileText },
    { id: "cv-analyzer", label: "CV Analys", icon: FileText },
    { id: "linkedin", label: "LinkedIn Optimizer", icon: Users },
    { id: "job-tracker", label: "Job Tracker", icon: Target },
    { id: "interviews", label: "Mock Interview", icon: MessageSquare },
    { id: "automated-messages", label: "Mensajes Automatizados", icon: Users },
    { id: "career-coach", label: "Career Coach", icon: UserCheck },
    { id: "services", label: "Servicios Adicionales", icon: DollarSign },
    { id: "referrals", label: "Refiere y Gana", icon: Gift },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "cv-boost":
        return <CVBoost />;
      case "cv-analyzer":
        return <CVAnalyzer />;
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
      case "career-coach":
        return <CareerCoach />;
      case "services":
        return <AdditionalServices />;
      case "referrals":
        return <ReferAndEarn />;
      case "settings":
        return <GeneralSettings />;
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
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Academy by LaPieza
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Boost your career potential
              </p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
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
                  {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your career development journey
                </p>
              </div>
              <Button variant="professional" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Quick Action
              </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CV Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">CVs analyzed this month</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">12</div>
            <p className="text-xs text-muted-foreground">Active applications</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-success"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">8</div>
            <p className="text-xs text-muted-foreground">Mock interviews completed</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-info"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">65%</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-warning"></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with your career development
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
              Optimize LinkedIn Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("job-tracker")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Job Application
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("interviews")}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Mock Interview
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Sesiones de Comunidad
            </CardTitle>
            <CardDescription>
              Acceso a sesiones quincenales y grupo de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Enlace a la próxima sesión:</h4>
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium">Sesión: Estrategias de Networking</p>
                <p className="text-xs text-muted-foreground">Jueves 25 de Julio, 2024 - 7:00 PM (Hora México)</p>
                <Button size="sm" className="mt-2">
                  <Play className="w-4 h-4 mr-2" />
                  Acceder a la sesión
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Liga de Acceso al grupo de WhatsApp:</h4>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Unirse al grupo de comunidad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}