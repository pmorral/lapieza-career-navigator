import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Mail,
  Clock,
  FileText,
  Upload,
  X,
  XCircle,
  Crown,
  ArrowRight,
} from "lucide-react";
import TrialEmailVerification from "./TrialEmailVerification";

interface TrialAIInterviewProps {
  hideTriggerCard?: boolean;
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TrialAIInterview: React.FC<TrialAIInterviewProps> = ({
  hideTriggerCard = false,
  externalOpen,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [language, setLanguage] = useState("es");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [trialLimitReached, setTrialLimitReached] = useState(false);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "email" | "verification" | "form"
  >("email");

  useEffect(() => {
    if (typeof externalOpen === "boolean") {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);

    // Reset states when dialog closes
    if (!open) {
      setTrialLimitReached(false);
      setShowEmailVerification(false);
      setIsSubmitted(false);
      setFormData(null);
      setUploadedCV(null);
      setIsCheckingLimit(false);
      setShowInterviewForm(false);
      setCurrentStep("email");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedCV(file);
      toast.success("CV cargado exitosamente");
    } else {
      toast.error("Por favor, sube un archivo PDF");
    }
  };

  const checkTrialLimit = async (email: string): Promise<boolean> => {
    setIsCheckingLimit(true);
    try {
      console.log("🔍 Checking trial limit for email:", email);

      const { data, error } = await supabase.functions.invoke(
        "validate-trial-request",
        {
          body: { email },
        }
      );

      if (error) {
        console.error("❌ Error checking trial limit:", error);
        return false; // Si hay error, permitir continuar
      }

      // Si el usuario ya usó su entrevista gratis
      if (data?.trial_limit_reached) {
        console.log("❌ Trial limit reached");
        setTrialLimitReached(true);
        return true; // Límite alcanzado
      }

      return false; // No hay límite alcanzado
    } catch (error) {
      console.error("💥 Error checking trial limit:", error);
      return false; // Si hay error, permitir continuar
    } finally {
      setIsCheckingLimit(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get email from form
    const email = (e.target as HTMLFormElement).email.value;

    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    // First validate if user can request trial interview
    const hasLimitReached = await checkTrialLimit(email);
    if (hasLimitReached) {
      return; // Stop here, trial limit screen will be shown
    }

    // If validation passes, show email verification
    setEmailForVerification(email);
    setCurrentStep("verification");
  };

  const handleVerificationSuccess = async () => {
    // Email verification successful, show the form
    setCurrentStep("form");
  };

  const handleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("🔄 Starting trial interview submission...");

      // Get form data
      const formDataObj = new FormData(e.target as HTMLFormElement);
      formDataObj.append("email", emailForVerification);
      formDataObj.append("cv", uploadedCV!);
      formDataObj.append("language", language);

      console.log("📡 Calling trial interview function...");
      const { data, error } = await supabase.functions.invoke(
        "trial-interview-request",
        {
          body: formDataObj,
        }
      );

      console.log("📦 Response received:", { data, error });

      if (error) {
        console.error("❌ Supabase error:", error);
        toast.error(
          `Error: ${error.message || "Error al enviar la solicitud"}`
        );
        return;
      }

      // Check if user has already used their trial interview
      if (data?.trial_limit_reached) {
        console.log("❌ Trial limit reached");
        setTrialLimitReached(true);
        return;
      }

      console.log("✅ Request successful");
      setIsSubmitted(true);
      toast.success("¡Solicitud enviada! La entrevista AI llegará a tu email.");
    } catch (error) {
      console.error("💥 Catch error:", error);
      toast.error(
        `Error al enviar la solicitud: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setUploadedCV(null);
    setLanguage("es");
    setIsOpen(false);
    setShowEmailVerification(false);
    setFormData(null);
    setCurrentStep("email");
    onOpenChange?.(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        {!hideTriggerCard && (
          <DialogTrigger asChild>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex flex-col space-y-1.5 p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold tracking-tight text-xl">
                  Prueba gratuita de entrevista AI
                </h3>
                <p className="text-sm text-muted-foreground">
                  Experimenta nuestro simulador de entrevistas con inteligencia
                  artificial
                </p>
              </div>
              <div className="p-6 pt-0 text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    15-20 minutos de duración
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Resultados por email
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    Análisis personalizado
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary mb-4">
                  100% Gratuito
                </Badge>
                <Button className="w-full">
                  Solicitar entrevista gratuita
                </Button>
              </div>
            </div>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">¡Solicitud enviada!</h3>
              <p className="text-muted-foreground">
                Tu entrevista AI personalizada será enviada a tu email en las
                próximas 24-48 horas.
              </p>
            </div>

            <Button onClick={resetForm} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      {!hideTriggerCard && (
        <DialogTrigger asChild>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex flex-col space-y-1.5 p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-xl">
                Prueba gratuita de entrevista AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Experimenta nuestro simulador de entrevistas con inteligencia
                artificial
              </p>
            </div>
            <div className="p-6 pt-0 text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  15-20 minutos de duración
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Resultados por email
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  Análisis personalizado
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary mb-4">
                100% Gratuito
              </Badge>
              <Button className="w-full">Solicitar entrevista gratuita</Button>
            </div>
          </div>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-2xl max-h-[90vh]">
        {trialLimitReached ? (
          <div className="text-center space-y-4 py-4 overflow-hidden">
            {/* Header con icono */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                  <XCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  ¡Ya solicitaste tu entrevista gratuita!
                </h3>
                <p className="text-base text-muted-foreground">
                  Solo puedes solicitar una entrevista gratuita por email
                </p>
              </div>
            </div>

            {/* Información de la entrevista */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Tu entrevista está en proceso
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Recibirás tu entrevista personalizada por email en las próximas
                24-48 horas
              </p>

              <div className="flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                <span>Procesamiento: 24-48 horas</span>
              </div>
            </div>

            {/* Beneficios de la membresía */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h4 className="text-lg font-semibold text-foreground">
                  ¿Quieres más entrevistas?
                </h4>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                  Con una membresía puedes realizar múltiples entrevistas
                  personalizadas
                </p>
                <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-0.5">
                  <li>• Entrevistas ilimitadas</li>
                  <li>• Feedback detallado</li>
                  <li>• Análisis personalizado</li>
                  <li>• Mejora continua</li>
                </ul>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <Button
                onClick={() => {
                  handleDialogOpenChange(false);
                  navigate("/login");
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="default"
              >
                <Crown className="w-4 h-4 mr-2" />
                Iniciar Sesión para Adquirir Membresía
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                onClick={() => handleDialogOpenChange(false)}
                variant="outline"
                className="w-full"
                size="default"
              >
                Entendido
              </Button>
            </div>
          </div>
        ) : currentStep === "verification" ? (
          <TrialEmailVerification
            email={emailForVerification}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={() => setCurrentStep("email")}
          />
        ) : currentStep === "form" ? (
          <div className="overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Completa los datos de tu entrevista
              </DialogTitle>
              <DialogDescription>
                Ahora completa la información para recibir tu entrevista
                personalizada por email
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInterviewSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Puesto de trabajo *</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Ej: Desarrollador Frontend"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Descripción del puesto *</Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Describe las responsabilidades y requisitos del puesto..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma de la entrevista *</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv">Subir CV (PDF) *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="flex-1"
                    required
                  />
                  {uploadedCV && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      CV cargado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">
                  ¿Qué incluye tu entrevista gratuita?
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Preguntas personalizadas según tu CV y el puesto</li>
                  <li>• Feedback detallado sobre tus respuestas</li>
                  <li>• Sugerencias de mejora profesional</li>
                  <li>• Resultados por email en 24-48 horas</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep("verification")}
                  variant="outline"
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !uploadedCV}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar solicitud
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Solicitud de entrevista AI gratuita
              </DialogTitle>
              <DialogDescription>
                Ingresa tu email para comenzar con tu entrevista personalizada
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recibirás la entrevista AI y los resultados en este email
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">
                  ¿Qué incluye tu entrevista gratuita?
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Preguntas personalizadas según tu CV y el puesto</li>
                  <li>• Feedback detallado sobre tus respuestas</li>
                  <li>• Sugerencias de mejora profesional</li>
                  <li>• Resultados por email en 24-48 horas</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isCheckingLimit}
                >
                  {isCheckingLimit ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Continuar con mi email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrialAIInterview;
