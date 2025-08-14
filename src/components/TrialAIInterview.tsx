import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Mail,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TrialEmailVerification } from "./TrialEmailVerification";

export const TrialAIInterview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [language, setLanguage] = useState("es");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedCV(file);
      toast.success("CV cargado exitosamente");
    } else {
      toast.error("Por favor, sube un archivo PDF");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get email from form
    const formDataObj = new FormData(e.target as HTMLFormElement);
    const email = formDataObj.get("email") as string;

    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    // Store form data for later use
    setFormData(formDataObj);

    // Show email verification first
    setEmailForVerification(email);
    setShowEmailVerification(true);
  };

  const handleVerificationSuccess = async () => {
    setShowEmailVerification(false);
    setIsSubmitting(true);

    try {
      console.log("🔄 Starting trial interview submission...");

      if (!formData) {
        toast.error("Error: Datos del formulario no encontrados");
        return;
      }

      // Log form data
      console.log("📋 Form data:", {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        whatsapp: formData.get("whatsapp"),
        jobTitle: formData.get("jobTitle"),
        jobDescription: formData.get("jobDescription"),
        cvFile: uploadedCV?.name,
      });

      formData.append("cv", uploadedCV!);
      formData.append("language", language);

      console.log("📡 Calling trial interview function...");
      const { data, error } = await supabase.functions.invoke(
        "trial-interview-request",
        {
          body: formData,
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
    // Reset form fields
    const form = document.getElementById("trial-form") as HTMLFormElement;
    if (form) form.reset();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">
                Prueba gratuita de entrevista AI
              </CardTitle>
              <CardDescription>
                Experimenta nuestro simulador de entrevistas con inteligencia
                artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="bg-green-100 text-green-800 mb-4">
                <CheckCircle className="w-4 h-4 mr-1" />
                Solicitud enviada
              </Badge>
              <p className="text-sm text-muted-foreground mb-4">
                Tu entrevista AI será enviada directamente a tu email. Revisa tu
                bandeja de entrada y spam.
              </p>
              <Button variant="outline" onClick={resetForm} className="w-full">
                Hacer otra solicitud
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              Prueba gratuita de entrevista AI
            </CardTitle>
            <CardDescription>
              Experimenta nuestro simulador de entrevistas con inteligencia
              artificial
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
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
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {showEmailVerification ? (
          <TrialEmailVerification
            email={emailForVerification}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={() => setShowEmailVerification(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Solicitud de entrevista AI gratuita
              </DialogTitle>
              <DialogDescription>
                Completa la información para recibir tu entrevista personalizada
                por email
              </DialogDescription>
            </DialogHeader>

            <form id="trial-form" onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="+52 1 234 567 8900"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Solo se permite una entrevista de prueba gratuita por email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Título del puesto *</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Ej: Frontend Developer, Data Scientist, Product Manager"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">
                  Descripción de la vacante *
                </Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Describe la posición: responsabilidades principales, tecnologías requeridas, requisitos, etc."
                  className="min-h-[120px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Mientras más específico seas, más personalizada será tu
                  entrevista AI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma de la entrevista *</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecciona en qué idioma quieres recibir tu entrevista AI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv">Sube tu CV *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
                  {uploadedCV ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">{uploadedCV.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedCV(null)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Arrastra tu CV aquí o haz clic para seleccionar
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Seleccionar archivo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Solo archivos PDF, máximo 2MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">
                  ¿Qué incluye tu entrevista AI gratuita?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Preguntas personalizadas basadas en tu CV y la vacante
                  </li>
                  <li>• Análisis de tus respuestas con IA</li>
                  <li>• Feedback específico para mejorar</li>
                  <li>• Sugerencias de preparación para la entrevista real</li>
                  <li>
                    • La entrevista AI será enviada directamente a tu email
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
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
                      Verificar email y enviar solicitud
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
