import { useState, useRef, useEffect } from "react";
import {
  Play,
  MessageSquare,
  FileText,
  Star,
  Clock,
  Mic,
  MicOff,
  Upload,
  X,
  CreditCard,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InterviewCredits } from "./InterviewCredits";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface InterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  duration: string;
  score: number;
  feedback: string;
  improvements: string[];
  status: "completed" | "in-progress" | "scheduled";
  recordingUrl?: string;
  betterAnswers?: string[];
}

export function MockInterviews() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [interviewCredits, setInterviewCredits] = useState(5);
  const [usedInterviews, setUsedInterviews] = useState(0);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingInterview, setPendingInterview] = useState<any>(null);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [interviewResponses, setInterviewResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<InterviewSession[]>([
    {
      id: "1",
      jobTitle: "Senior Frontend Developer",
      company: "Tech Corp",
      date: "2024-01-15",
      duration: "25 min",
      score: 85,
      feedback:
        "Conocimiento técnico sólido demostrado. Buenas habilidades de comunicación. Confiado al explicar conceptos complejos.",
      improvements: [
        "Practice behavioral questions more",
        "Prepare specific examples for leadership scenarios",
        "Work on concise answers",
      ],
      status: "completed",
      recordingUrl: "https://example-interview-recording.com/session1.mp3",
      betterAnswers: [
        "Para la pregunta 'Háblame de ti', podrías estructurar mejor tu respuesta siguiendo esta guía: 'Soy un desarrollador frontend con 5 años de experiencia especializado en React y TypeScript. En mi trabajo actual en Tech Corp, lidero un equipo de 3 desarrolladores y hemos mejorado el rendimiento de la aplicación en un 40%. Busco nuevos desafíos donde pueda aplicar mi experiencia en arquitectura frontend y mentoría.'",
        "Cuando te pregunten sobre debugging, proporciona un ejemplo específico: 'Recientemente enfrenté un bug de memoria en nuestra SPA. Utilicé Chrome DevTools para identificar memory leaks, implementé lazy loading para componentes pesados y reduje el uso de memoria en un 60%. Documenté el proceso para el equipo.'",
      ],
    },
    {
      id: "2",
      jobTitle: "Full Stack Engineer",
      company: "StartupXYZ",
      date: "2024-01-10",
      duration: "30 min",
      score: 78,
      feedback:
        "Enfoque sólido para resolver problemas. Buen entendimiento del diseño de sistemas. Entusiasta y comprometido.",
      improvements: [
        "Improve answer structure (STAR method)",
        "Practice coding questions out loud",
        "Research company culture better",
      ],
      status: "completed",
      recordingUrl: "https://example-interview-recording.com/session2.mp3",
      betterAnswers: [
        "Para proyectos desafiantes, usa STAR: 'Situación: Nuestro e-commerce tenía problemas de rendimiento. Tarea: Optimizar la velocidad de carga. Acción: Implementé code splitting, optimicé imágenes y usé service workers. Resultado: Redujimos el tiempo de carga en 50% y aumentamos la conversión en 15%.'",
        "Al hablar de tecnologías, sé específico: 'Sigo blogs como CSS-Tricks, participo en comunidades de React, y dedico 2 horas semanales a experimentar con nuevas herramientas. Recientemente exploré Vite para builds más rápidos en nuestros proyectos.'",
      ],
    },
  ]);

  // Get user data from Supabase on component mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          toast({
            title: "Error",
            description:
              "Error al obtener datos del usuario. Por favor inicia sesión.",
            variant: "destructive",
          });
          return;
        }

        if (user) {
          setUser(user);
          console.log("User loaded:", user);
        } else {
          toast({
            title: "Usuario no encontrado",
            description:
              "Por favor inicia sesión para usar las entrevistas AI.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in getUser:", error);
      }
    };

    getUser();
  }, []);

  // Check for pending interviews and count total interviews when user changes
  useEffect(() => {
    if (user) {
      checkPendingInterviews();
      countUserInterviews();
      fetchInterviewResponses();
    }
  }, [user]);

  // Auto-refresh when interview is being analyzed
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      pendingInterview &&
      pendingInterview.status === "analyzing-interview" &&
      autoRefreshEnabled
    ) {
      // Check every 30 seconds when analyzing
      interval = setInterval(() => {
        console.log("🔄 Auto-refreshing analyzing interview status...");
        checkPendingInterviews();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [pendingInterview?.status, autoRefreshEnabled]);

  // Notify when interview analysis is completed
  useEffect(() => {
    if (pendingInterview && pendingInterview.status === "completed") {
      toast({
        title: "🎉 ¡Análisis Completado!",
        description:
          "Tu entrevista ha sido analizada. Revisa los resultados y feedback.",
        duration: 5000,
      });
    }
  }, [pendingInterview?.status, toast]);

  const checkPendingInterviews = async () => {
    if (!user) return;

    setIsLoadingPending(true);
    try {
      console.log("🔍 Checking for pending interviews for user:", user.id);

      const { data: pendingInterviews, error } = await supabase
        .from("interviews" as any)
        .select("*")
        .eq("user_id", user.id)
        .in("status", [
          "creating",
          "processing",
          "pending",
          "created-pending",
          "analyzing-interview",
        ])
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching pending interviews:", error);
        return;
      }

      if (pendingInterviews && pendingInterviews.length > 0) {
        console.log("📋 Found pending interview:", pendingInterviews[0]);
        setPendingInterview(pendingInterviews[0]);
      } else {
        console.log("✅ No pending interviews found");
        setPendingInterview(null);
      }
    } catch (error) {
      console.error("Error in checkPendingInterviews:", error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const countUserInterviews = async () => {
    if (!user) return;

    setIsLoadingInterviews(true);
    try {
      console.log("🔢 Counting total interviews for user:", user.id);

      const { count, error } = await supabase
        .from("interviews" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error counting interviews:", error);
        return;
      }

      console.log("📊 Total interviews count:", count);
      setTotalInterviews(count || 0);
      setUsedInterviews(count || 0);
    } catch (error) {
      console.error("Error in countUserInterviews:", error);
    } finally {
      setIsLoadingInterviews(false);
    }
  };

  const fetchInterviewResponses = async () => {
    if (!user) return;

    setIsLoadingResponses(true);
    try {
      console.log("📋 Fetching interview responses for user:", user.id);

      // First get all interviews for the user
      const { data: userInterviews, error: interviewsError } = await supabase
        .from("interviews" as any)
        .select("id, candidate_id, interview_id")
        .eq("user_id", user.id);

      if (interviewsError) {
        console.error("Error fetching user interviews:", interviewsError);
        return;
      }

      if (!userInterviews || userInterviews.length === 0) {
        console.log("📭 No interviews found for user");
        setInterviewResponses([]);
        return;
      }

      // Get candidate IDs from user interviews
      const candidateIds = userInterviews
        .map((interview: any) => interview.candidate_id)
        .filter(Boolean);

      // Fetch responses for these candidate IDs
      const { data: responses, error: responsesError } = await supabase
        .from("interview_responses" as any)
        .select("*")
        .in("candidate_id", candidateIds)
        .order("created_at", { ascending: false });

      if (responsesError) {
        console.error("Error fetching interview responses:", responsesError);
        return;
      }

      console.log("📊 Found interview responses:", responses?.length || 0);
      setInterviewResponses(responses || []);
    } catch (error) {
      console.error("Error in fetchInterviewResponses:", error);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const startInterview = async () => {
    if (!jobTitle.trim() || !jobDescription.trim() || !uploadedCV || !user) {
      toast({
        title: "Campos requeridos",
        description:
          "Por favor completa todos los campos obligatorios, sube tu CV y asegúrate de estar autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has available interviews
    if (totalInterviews >= interviewCredits) {
      setShowCreditsDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔄 Starting interview request...");

      // Create FormData using user data from Supabase
      const formData = new FormData();

      // Extract name from user metadata or email
      formData.append("user_id", user.id);
      formData.append("fullname", user.user_metadata?.full_name);
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);
      formData.append("cv", uploadedCV);
      // Map language to API format
      const languageCode = language === "spanish" ? "es" : "en";
      formData.append("language", languageCode);

      console.log("📡 Calling Supabase function...");
      const { data, error } = await supabase.functions.invoke(
        "ai-interview-request",
        {
          body: formData,
        }
      );

      console.log("📦 Response received:", { data, error });

      if (error) {
        console.error("❌ Supabase error:", error);
        toast({
          title: "Error",
          description: `Error al enviar la solicitud: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Request successful");

      // Update interview count and responses after creating a new one
      await countUserInterviews();
      await checkPendingInterviews();
      await fetchInterviewResponses();

      // Show email notification popup
      setShowEmailNotification(true);

      toast({
        title: "¡Solicitud enviada!",
        description: `La entrevista AI llegará a tu email. Te quedan ${
          interviewCredits - totalInterviews - 1
        } entrevistas gratuitas.`,
      });
    } catch (error) {
      console.error("💥 Catch error:", error);
      toast({
        title: "Error",
        description: `Error al enviar la solicitud: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedCV(file);
    }
  };

  const removeCV = () => {
    setUploadedCV(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const handlePurchaseCredits = (credits: number) => {
    setInterviewCredits((prev) => prev + credits);
    toast({
      title: "Créditos agregados",
      description: `Se han agregado ${credits} créditos a tu cuenta.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Simulación de Entrevistas con AI
          </h2>
          <p className="text-muted-foreground">
            Practica entrevistas con IA y recibe retroalimentación detallada
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-sm">
              {isLoadingInterviews
                ? "Cargando..."
                : `${
                    interviewCredits - totalInterviews
                  } de ${interviewCredits} entrevistas disponibles`}
            </Badge>
            {totalInterviews >= interviewCredits && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreditsDialog(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Comprar créditos
              </Button>
            )}
          </div>
        </div>

        {!pendingInterview && totalInterviews < interviewCredits && (
          <Button variant="professional">
            <Play className="w-4 h-4 mr-2" />
            Start New Interview
          </Button>
        )}
      </div>

      {/* Pending Interview Alert */}
      {pendingInterview && (
        <Card
          className={`shadow-card ${
            pendingInterview.status === "analyzing-interview"
              ? "border-blue-200 bg-blue-50"
              : pendingInterview.status === "created-pending"
              ? "border-green-200 bg-green-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 ${
                pendingInterview.status === "analyzing-interview"
                  ? "text-blue-800"
                  : pendingInterview.status === "created-pending"
                  ? "text-green-800"
                  : "text-orange-800"
              }`}
            >
              {pendingInterview.status === "analyzing-interview" ? (
                <>Entrevista siendo analizada</>
              ) : pendingInterview.status === "created-pending" ? (
                <>
                  <Play className="w-5 h-5" />
                  Entrevista lista para completar
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  Entrevista en proceso
                </>
              )}
            </CardTitle>
            <CardDescription
              className={
                pendingInterview.status === "analyzing-interview"
                  ? "text-blue-700"
                  : pendingInterview.status === "created-pending"
                  ? "text-green-700"
                  : "text-orange-700"
              }
            >
              {pendingInterview.status === "analyzing-interview"
                ? "Tu entrevista está siendo analizada por nuestra IA. Esto puede tomar unos minutos."
                : pendingInterview.status === "created-pending"
                ? "Tu entrevista AI está lista. Haz clic en el enlace para comenzar."
                : "Tienes una entrevista AI siendo creada. Por favor espera a que se complete."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-medium ${
                      pendingInterview.status === "analyzing-interview"
                        ? "text-blue-800"
                        : pendingInterview.status === "created-pending"
                        ? "text-green-800"
                        : "text-orange-800"
                    }`}
                  >
                    {pendingInterview.job_title || "Entrevista AI"}
                  </p>
                  <p
                    className={`text-sm ${
                      pendingInterview.status === "analyzing-interview"
                        ? "text-blue-600"
                        : pendingInterview.status === "created-pending"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    Creada el{" "}
                    {new Date(pendingInterview.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    pendingInterview.status === "analyzing-interview"
                      ? "border-blue-300 text-blue-700 bg-blue-100"
                      : pendingInterview.status === "created-pending"
                      ? "border-green-300 text-green-700 bg-green-100"
                      : "border-orange-300 text-orange-700 bg-orange-100"
                  }`}
                >
                  {pendingInterview.status === "analyzing-interview"
                    ? "Analizando..."
                    : pendingInterview.status === "creating"
                    ? "Creando..."
                    : pendingInterview.status === "processing"
                    ? "Procesando..."
                    : pendingInterview.status === "created-pending"
                    ? "Lista para completar"
                    : "Pendiente"}
                </Badge>
              </div>

              {/* Vista específica para entrevista siendo analizada */}
              {pendingInterview.status === "analyzing-interview" && (
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        🧠 IA Analizando tu Entrevista
                      </p>
                      <p className="text-xs text-blue-600">
                        Procesando respuestas y generando feedback
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <span>• Analizando respuestas de audio</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <span>• Generando feedback personalizado</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <span>• Preparando recomendaciones</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-blue-200 rounded text-xs text-blue-800">
                    <strong>⏱️ Tiempo estimado:</strong> Máximo 25 minutos
                  </div>

                  {/* Información adicional */}
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <p>
                      <strong>💡 ¿Qué está pasando?</strong>
                    </p>
                    <p className="mt-1">
                      Nuestra IA está procesando tu entrevista para:
                    </p>
                    <ul className="mt-1 ml-3 space-y-1">
                      <li>• Evaluar la claridad de tus respuestas</li>
                      <li>• Identificar áreas de mejora</li>
                      <li>• Generar feedback personalizado</li>
                      <li>• Crear un plan de desarrollo</li>
                    </ul>
                  </div>

                  {/* Toggle de auto-refresh */}
                  <div className="mt-3 flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-refresh"
                        checked={autoRefreshEnabled}
                        onChange={(e) =>
                          setAutoRefreshEnabled(e.target.checked)
                        }
                        className="w-3 h-3 text-blue-600 bg-blue-100 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="auto-refresh" className="text-blue-700">
                        Actualización automática cada 30s
                      </label>
                    </div>
                    <span className="text-blue-600">
                      {autoRefreshEnabled ? "🔄 Activado" : "⏸️ Pausado"}
                    </span>
                  </div>
                </div>
              )}

              {/* Vista para entrevista lista */}
              {pendingInterview.status === "created-pending" &&
                pendingInterview.interview_url && (
                  <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      🎯 ¡Tu entrevista está lista!
                    </p>
                    <Button
                      asChild
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a
                        href={pendingInterview.interview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Comenzar entrevista AI
                      </a>
                    </Button>
                    <p className="text-xs text-green-600 mt-2">
                      ⏰ La entrevista durará aproximadamente 15 minutos
                    </p>
                  </div>
                )}

              {/* Vista para otros estados */}
              {pendingInterview.status !== "created-pending" &&
                pendingInterview.status !== "analyzing-interview" && (
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Estado:</strong>{" "}
                      {pendingInterview.api_message || "Entrevista en proceso"}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Recibirás un email cuando esté lista para completar.
                    </p>
                  </div>
                )}

              <Button
                variant="outline"
                size="sm"
                onClick={checkPendingInterviews}
                disabled={isLoadingPending}
                className={`${
                  pendingInterview.status === "analyzing-interview"
                    ? "border-blue-300 text-blue-700 hover:bg-blue-100"
                    : pendingInterview.status === "created-pending"
                    ? "border-green-300 text-green-700 hover:bg-green-100"
                    : "border-orange-300 text-orange-700 hover:bg-orange-100"
                }`}
              >
                {isLoadingPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar estado
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Setup - Only show when no pending interviews and user has credits */}
      {!pendingInterview && totalInterviews < interviewCredits && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Start AI Interview
            </CardTitle>
            <CardDescription>
              Paste the job description to generate personalized interview
              questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                Idioma de la entrevista *
              </Label>
              <RadioGroup
                value={language}
                onValueChange={setLanguage}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spanish" id="spanish" />
                  <Label htmlFor="spanish">Español</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="english" id="english" />
                  <Label htmlFor="english">Inglés</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="cv-upload">Subir CV (Opcional)</Label>
              <div className="mt-2 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cv-upload"
                />

                {!uploadedCV ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 border-dashed"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Haz clic para subir tu CV (PDF, máximo 2MB)
                      </p>
                    </div>
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">
                        {uploadedCV.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCV}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="job-title">Título del puesto *</Label>
              <Textarea
                id="job-title"
                placeholder="Ej: Frontend Developer, Data Scientist, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                rows={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="job-description">Job Description *</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startInterview}
                disabled={
                  !jobTitle.trim() ||
                  !jobDescription.trim() ||
                  !language ||
                  !uploadedCV ||
                  !user ||
                  isSubmitting ||
                  !!pendingInterview
                }
                variant="professional"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isSubmitting
                  ? "Enviando solicitud..."
                  : usedInterviews >= interviewCredits
                  ? "Comprar créditos"
                  : "Solicitar entrevista AI"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setJobTitle("");
                  setJobDescription("");
                  setLanguage("");
                  setUploadedCV(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed Interview in Progress - now handled by LaPieza URL */}

      {/* Interview History */}
      {interviewResponses.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Historial de Entrevistas AI
            </CardTitle>
            <CardDescription>
              Revisa tus entrevistas completadas y el análisis de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingResponses ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cargando entrevistas...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {interviewResponses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">
                          Entrevista AI -{" "}
                          {response.candidate_id?.substring(0, 8)}...
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {response.interview_id_external}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {response.status || "Completada"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {response.started_at && response.ended_at
                            ? `${Math.round(
                                (response.ended_at - response.started_at) /
                                  60000
                              )} min`
                            : "Duración no disponible"}
                        </span>
                      </div>
                      <span>
                        {response.created_at
                          ? new Date(response.created_at).toLocaleDateString()
                          : "Fecha no disponible"}
                      </span>
                    </div>

                    {response.summary && (
                      <div className="mb-4">
                        <h4 className="font-medium text-success mb-2">
                          Resumen de la Entrevista
                        </h4>
                        <div className="text-sm whitespace-pre-line p-3 bg-accent rounded-lg">
                          {response.summary}
                        </div>
                      </div>
                    )}

                    {response.ai_summary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {response.ai_summary.finalRecommendation && (
                          <div>
                            <h4 className="font-medium text-primary mb-2">
                              Recomendación Final
                            </h4>
                            <div className="text-sm p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                              <p className="font-medium">
                                Decisión:{" "}
                                {
                                  response.ai_summary.finalRecommendation
                                    .decision
                                }
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confianza:{" "}
                                {
                                  response.ai_summary.finalRecommendation
                                    .confidence
                                }
                                /5
                              </p>
                              <p className="mt-2 text-xs">
                                {
                                  response.ai_summary.finalRecommendation
                                    .reasoning
                                }
                              </p>
                            </div>
                          </div>
                        )}

                        {response.ai_summary.softSkills && (
                          <div>
                            <h4 className="font-medium text-warning mb-2">
                              Habilidades Blandas
                            </h4>
                            <div className="text-sm p-3 bg-warning/5 rounded-lg border-l-2 border-warning">
                              <p className="text-xs whitespace-pre-line">
                                {response.ai_summary.softSkills}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t flex gap-2 flex-wrap">
                      {response.recording_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={response.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🎧 Escuchar grabación
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <InterviewCredits
        isOpen={showCreditsDialog}
        onClose={() => setShowCreditsDialog(false)}
        onPurchase={handlePurchaseCredits}
      />

      {/* Email Notification Dialog */}
      <Dialog
        open={showEmailNotification}
        onOpenChange={setShowEmailNotification}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Entrevista AI en camino
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>¡Perfecto!</strong> En los próximos minutos recibirás un
                link por correo electrónico con tu entrevista AI personalizada.
              </p>
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📧 Revisa tu bandeja de entrada y carpeta de spam
                  <br />
                  ⏰ La entrevista estará lista en 2-5 minutos
                  <br />
                  📊 El feedback aparecerá aquí después de completarla
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowEmailNotification(false)}
                className="flex-1"
              >
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
