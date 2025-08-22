import { useState, useEffect } from "react";
import {
  Upload,
  Users,
  Copy,
  CheckCircle,
  AlertCircle,
  Linkedin,
  History,
  Calendar,
  Trash2,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import axios from "axios";

// Define types for the LinkedIn optimization data
interface LinkedInProfile {
  data?: {
    full_name?: string;
    headline?: string;
    summary?: string;
    location?: string;
    industry?: string;
    experience?: Array<{
      title?: string;
      company?: string;
      description?: string;
    }>;
    education?: Array<{
      degree?: string;
      school?: string;
    }>;
    skills?: string[];
  };
  success?: boolean;
  info?: string;
}

interface OptimizedContent {
  spanish: {
    headline: string;
    summary: string;
    experiences?: Array<{
      title: string;
      company: string;
      description: string;
    }>;
    experience?: string;
    education?: string;
    skills?: string[];
    certifications?: string;
    projects?: string;
    volunteer?: string;
    accomplishments?: string;
    interests?: string;
  };
  english: {
    headline: string;
    summary: string;
    experiences?: Array<{
      title: string;
      company: string;
      description: string;
    }>;
    experience?: string;
    education?: string;
    skills?: string[];
    certifications?: string;
    projects?: string;
    volunteer?: string;
    accomplishments?: string;
    interests?: string;
  };
  keywords_analysis?: {
    primary_keywords: string[];
    secondary_keywords: string[];
    industry_terms: string[];
  };
  optimization_tips?: string[];
}

interface HistoryItem {
  id: string;
  personal_cv_filename: string;
  linkedin_url?: string;
  optimized_content: OptimizedContent;
  created_at: string;
}

export function LinkedInOptimizer() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [personalCV, setPersonalCV] = useState<File | null>(null);
  const [language, setLanguage] = useState("");
  const [optimizedContent, setOptimizedContent] =
    useState<OptimizedContent | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const { toast } = useToast();

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("linkedin_optimizations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match our interface
        const transformedData: HistoryItem[] = (data || []).map(
          (item: {
            id: string;
            personal_cv_filename: string;
            linkedin_url?: string;
            optimized_content: unknown;
            created_at: string;
          }) => ({
            id: item.id,
            personal_cv_filename: item.personal_cv_filename,
            linkedin_url: item.linkedin_url,
            optimized_content: item.optimized_content as OptimizedContent,
            created_at: item.created_at,
          })
        );

        setHistoryItems(transformedData);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("linkedin_optimizations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadHistory();
      toast({
        title: "Eliminado",
        description:
          "La optimización de LinkedIn ha sido eliminada del historial",
      });
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento del historial",
        variant: "destructive",
      });
    }
  };

  const handlePersonalCVUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setPersonalCV(file);
      toast({
        title: "CV Personal cargado",
        description: "Tu CV personal ha sido cargado correctamente",
      });
    } else {
      toast({
        title: "Tipo de archivo inválido",
        description: "Por favor sube un archivo PDF",
        variant: "destructive",
      });
    }
  };

  const optimizeProfile = async () => {
    if (!personalCV || !linkedinUrl) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);

    try {
      console.log("Processing LinkedIn optimization with:", {
        personalCV: personalCV?.name,
        linkedinUrl: linkedinUrl,
      });

      // Convert personal CV to base64
      const reader = new FileReader();
      const personalCVBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          console.log(
            "Personal CV base64 conversion successful, length:",
            base64Data.length
          );
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          console.error("Personal CV file reading error:", error);
          reject(error);
        };
        reader.readAsDataURL(personalCV);
      });

      console.log("Calling linkedin-optimizer-ai function...");

      // Call our LinkedIn Optimizer AI function using Supabase
      const { data, error } = await supabase.functions.invoke(
        "linkedin-optimizer-ai",
        {
          body: {
            personalCVBase64,
            linkedinUrl: linkedinUrl,
            language: "español", // Default to español since we provide both languages
          },
        }
      );
      console.log("LinkedIn Optimizer AI response:", data, error);
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Error al optimizar el perfil: ${error.message}`);
      }

      setOptimizedContent(data);
      setShowForm(false); // Ocultar el formulario después de la optimización

      // Save to history
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && data) {
        const { error: saveError } = await supabase
          .from("linkedin_optimizations")
          .insert({
            user_id: user.id,
            personal_cv_filename: personalCV.name,
            linkedin_url: linkedinUrl,
            optimized_content: data,
          });

        if (saveError) {
          console.error("Error saving to history:", saveError);
        } else {
          await loadHistory();
        }
      }
    } catch (error) {
      console.error("Error optimizing profile:", error);
      toast({
        title: "Error",
        description: "No se pudo optimizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Contenido copiado al portapapeles",
    });
  };

  const validateLinkedInUrl = (url: string) => {
    const linkedinRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with History Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Optimizador de LinkedIn</h1>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="outline"
          size="sm"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? "Ocultar Historial" : "Ver Historial"}
        </Button>
      </div>

      {/* History Section */}
      {showHistory && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Historial de Optimizaciones de LinkedIn
            </CardTitle>
            <CardDescription>
              Tus optimizaciones de LinkedIn anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay optimizaciones de LinkedIn en el historial
              </p>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          {item.personal_cv_filename}
                        </h4>
                        {item.linkedin_url && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Linkedin className="w-3 h-3" />
                            {item.linkedin_url}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setOptimizedContent(item.optimized_content);
                            setShowForm(false); // Ocultar el formulario cuando se ve el historial
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Ver
                        </Button>
                        <Button
                          onClick={() => deleteHistoryItem(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Section - Only show when showForm is true */}
      {showForm && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LinkedIn URL Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-primary" />
                  Obtener Perfil de LinkedIn
                </CardTitle>
                <CardDescription>
                  Ingresa la URL de tu perfil de LinkedIn para obtener la
                  información
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="linkedin-url"
                    className="text-sm font-medium mb-2 block"
                  >
                    URL de tu perfil de LinkedIn
                  </Label>
                  <Input
                    id="linkedin-url"
                    type="url"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full"
                  />
                  {linkedinUrl && !validateLinkedInUrl(linkedinUrl) && (
                    <p className="text-xs text-red-500 mt-1">
                      Por favor ingresa una URL válida de LinkedIn
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    El perfil se obtendrá automáticamente durante la
                    optimización
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal CV Upload Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  CV Personal para Comparación
                </CardTitle>
                <CardDescription>
                  Sube tu CV personal para comparar y generar contenido
                  optimizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePersonalCVUpload}
                    className="hidden"
                    id="personal-cv-upload"
                  />
                  <label
                    htmlFor="personal-cv-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Subir CV Personal (PDF)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tu CV actualizado para comparar
                    </p>
                  </label>
                </div>

                {personalCV && (
                  <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {personalCV.name}
                    </span>
                    <Badge variant="secondary">Listo</Badge>
                  </div>
                )}

                <Button
                  onClick={optimizeProfile}
                  disabled={
                    !personalCV || !linkedinUrl || isOptimizing
                  }
                  className="w-full"
                  variant="default"
                >
                  {isOptimizing ? (
                    <>
                      <Users className="w-4 h-4 mr-2 animate-spin" />
                      Generando contenido para LinkedIn... (puede tardar más de
                      1 minuto)
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Generar Contenido LinkedIn
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* How to get LinkedIn URL */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-info" />
                ¿Cómo obtener la URL de tu perfil de LinkedIn?
              </CardTitle>
              <CardDescription>
                Sigue estos pasos para copiar la URL de tu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Ve a tu perfil de LinkedIn
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Haz click en "Ver perfil" desde tu página principal
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Copia la URL del navegador
                    </p>
                    <p className="text-xs text-muted-foreground">
                      La URL debe verse como: linkedin.com/in/tu-nombre
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Pega la URL en el campo superior
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Haz click en "Obtener" para extraer tu información
                    </p>
                  </div>
                </div>
                <div className="border border-info/20 rounded-lg p-3 mt-4">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Asegúrate de que tu perfil esté completo y público
                    para obtener mejores resultados en la optimización.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Optimization Results */}
      {optimizedContent && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-success">
              ✅ Optimización Completada
            </h2>
            <Button
              onClick={() => {
                setShowForm(true);
                setOptimizedContent(null);
                setPersonalCV(null);
                setLinkedinUrl("");
              }}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Nueva Optimización
            </Button>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Contenido Optimizado para LinkedIn
              </CardTitle>
              <CardDescription>
                Contenido optimizado por IA listo para copiar a tu perfil de
                LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contenido en Español */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold mb-4">
                  🇪🇸 Contenido en Español
                </h2>

                {/* Headline Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Titular Profesional</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(optimizedContent.spanish.headline)
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.headline}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Summary Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Acerca de (About)</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(optimizedContent.spanish.summary)
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.summary}
                    readOnly
                    className="min-h-[120px]"
                  />
                </div>

                {/* Experience Español */}
                {optimizedContent.spanish.experiences &&
                  optimizedContent.spanish.experiences.length > 0 &&
                  optimizedContent.spanish.experiences.some(
                    (exp) => exp.description && exp.description.trim()
                  ) &&
                  optimizedContent.spanish.experiences.map(
                    (
                      exp: {
                        title: string;
                        company: string;
                        description: string;
                      },
                      index: number
                    ) =>
                      exp.description &&
                      exp.description.trim() && (
                        <div key={index} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">
                              Experiencia {index + 1}: {exp.title} -{" "}
                              {exp.company}
                            </h3>
                            <Button
                              onClick={() => copyToClipboard(exp.description)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                          <Textarea
                            value={exp.description}
                            readOnly
                            className="min-h-[100px]"
                          />
                        </div>
                      )
                  )}

                {/* Education Español */}
                {optimizedContent.spanish.education &&
                  optimizedContent.spanish.education.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Educación</h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(optimizedContent.spanish.education)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.spanish.education}
                        readOnly
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                {/* Certifications Español */}
                {optimizedContent.spanish.certifications &&
                  optimizedContent.spanish.certifications.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          Licencias y Certificaciones
                        </h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(
                              optimizedContent.spanish.certifications
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.spanish.certifications}
                        readOnly
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                {/* Projects Español */}
                {optimizedContent.spanish.projects &&
                  optimizedContent.spanish.projects.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Proyectos</h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(optimizedContent.spanish.projects)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.spanish.projects}
                        readOnly
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                {/* Volunteer Español */}
                {optimizedContent.spanish.volunteer &&
                  optimizedContent.spanish.volunteer.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Voluntariado</h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(optimizedContent.spanish.volunteer)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.spanish.volunteer}
                        readOnly
                        className="min-h-[60px]"
                      />
                    </div>
                  )}

                {/* Accomplishments Español */}
                {optimizedContent.spanish.accomplishments &&
                  optimizedContent.spanish.accomplishments.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          Logros y Reconocimientos
                        </h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(
                              optimizedContent.spanish.accomplishments
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.spanish.accomplishments}
                        readOnly
                        className="min-h-[60px]"
                      />
                    </div>
                  )}

                {/* Interests Español */}
                {optimizedContent.spanish.interests &&
                  optimizedContent.spanish.interests.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Intereses</h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(optimizedContent.spanish.interests)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.spanish.interests}
                        readOnly
                        className="min-h-[60px]"
                      />
                    </div>
                  )}

                {/* Skills Español */}
                {optimizedContent.spanish.skills &&
                  optimizedContent.spanish.skills.length > 0 &&
                  optimizedContent.spanish.skills.some(
                    (skill) => skill && skill.trim()
                  ) && (
                    <div>
                      <h3 className="font-medium mb-2">
                        Aptitudes Recomendadas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {optimizedContent.spanish.skills
                          .filter((skill) => skill && skill.trim())
                          .map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Contenido en Inglés */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  🇺🇸 Content in English
                </h2>

                {/* Headline English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Professional Headline</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(optimizedContent.english.headline)
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.headline}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Summary English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">About Section</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(optimizedContent.english.summary)
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.summary}
                    readOnly
                    className="min-h-[120px]"
                  />
                </div>

                {/* Experience English */}
                {optimizedContent.english.experiences &&
                  optimizedContent.english.experiences.length > 0 &&
                  optimizedContent.english.experiences.some(
                    (exp) => exp.description && exp.description.trim()
                  ) &&
                  optimizedContent.english.experiences.map(
                    (
                      exp: {
                        title: string;
                        company: string;
                        description: string;
                      },
                      index: number
                    ) =>
                      exp.description &&
                      exp.description.trim() && (
                        <div key={index} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">
                              Experience {index + 1}: {exp.title} -{" "}
                              {exp.company}
                            </h3>
                            <Button
                              onClick={() => copyToClipboard(exp.description)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={exp.description}
                            readOnly
                            className="min-h-[100px]"
                          />
                        </div>
                      )
                  )}

                {/* Education English */}
                {optimizedContent.english.education &&
                  optimizedContent.english.education.trim() && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Education</h3>
                        <Button
                          onClick={() =>
                            copyToClipboard(optimizedContent.english.education)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={optimizedContent.english.education}
                        readOnly
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                {/* Certifications English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Licenses & Certifications</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          optimizedContent.english.certifications ||
                            "Not available"
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.certifications}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>

                {/* Projects English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Projects</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          optimizedContent.english.projects || "Not available"
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.projects}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>

                {/* Volunteer English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Volunteer Experience</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          optimizedContent.english.volunteer || "Not available"
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.volunteer}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Accomplishments English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Accomplishments</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          optimizedContent.english.accomplishments ||
                            "Not available"
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.accomplishments}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Interests English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Interests</h3>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          optimizedContent.english.interests || "Not available"
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.interests}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Skills English */}
                <div>
                  <h3 className="font-medium mb-2">Recommended Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {optimizedContent.english.skills &&
                    optimizedContent.english.skills.length > 0 ? (
                      optimizedContent.english.skills.map(
                        (skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        )
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Keywords Analysis Section */}
              {optimizedContent.keywords_analysis &&
                ((optimizedContent.keywords_analysis.primary_keywords &&
                  optimizedContent.keywords_analysis.primary_keywords.length >
                    0 &&
                  optimizedContent.keywords_analysis.primary_keywords.some(
                    (k) => k && k.trim()
                  )) ||
                  (optimizedContent.keywords_analysis.secondary_keywords &&
                    optimizedContent.keywords_analysis.secondary_keywords
                      .length > 0 &&
                    optimizedContent.keywords_analysis.secondary_keywords.some(
                      (k) => k && k.trim()
                    )) ||
                  (optimizedContent.keywords_analysis.industry_terms &&
                    optimizedContent.keywords_analysis.industry_terms.length >
                      0 &&
                    optimizedContent.keywords_analysis.industry_terms.some(
                      (t) => t && t.trim()
                    ))) && (
                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4">
                      🔍 Análisis de Palabras Clave
                    </h2>

                    {/* Primary Keywords */}
                    {optimizedContent.keywords_analysis.primary_keywords &&
                      optimizedContent.keywords_analysis.primary_keywords
                        .length > 0 &&
                      optimizedContent.keywords_analysis.primary_keywords.some(
                        (k) => k && k.trim()
                      ) && (
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">
                            Palabras Clave Principales
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {optimizedContent.keywords_analysis.primary_keywords
                              .filter((k) => k && k.trim())
                              .map((keyword: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="default"
                                  className="bg-primary text-primary-foreground"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Secondary Keywords */}
                    {optimizedContent.keywords_analysis.secondary_keywords &&
                      optimizedContent.keywords_analysis.secondary_keywords
                        .length > 0 &&
                      optimizedContent.keywords_analysis.secondary_keywords.some(
                        (k) => k && k.trim()
                      ) && (
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">
                            Palabras Clave Secundarias
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {optimizedContent.keywords_analysis.secondary_keywords
                              .filter((k) => k && k.trim())
                              .map((keyword: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {keyword}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Industry Terms */}
                    {optimizedContent.keywords_analysis.industry_terms &&
                      optimizedContent.keywords_analysis.industry_terms.length >
                        0 &&
                      optimizedContent.keywords_analysis.industry_terms.some(
                        (t) => t && t.trim()
                      ) && (
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">
                            Términos de la Industria
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {optimizedContent.keywords_analysis.industry_terms
                              .filter((t) => t && t.trim())
                              .map((term: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-blue-300 text-blue-700"
                                >
                                  {term}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

              {/* Optimization Tips Section */}
              {optimizedContent.optimization_tips &&
                optimizedContent.optimization_tips.length > 0 &&
                optimizedContent.optimization_tips.some(
                  (tip) => tip && tip.trim()
                ) && (
                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4">
                      💡 Consejos de Optimización
                    </h2>
                    <div className="space-y-3">
                      {optimizedContent.optimization_tips
                        .filter((tip) => tip && tip.trim())
                        .map((tip: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-blue-800">{tip}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
