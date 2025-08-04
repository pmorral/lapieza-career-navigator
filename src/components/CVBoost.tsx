import { useState, useEffect } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, Globe, MapPin, Briefcase, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const cvTemplates = [
  {
    id: 1,
    name: "Template Profesional Executive",
    description: "Ideal para roles ejecutivos y gerenciales",
    image: "/lovable-uploads/template-1.png",
    downloadUrl: "/templates/template-executive.docx"
  },
  {
    id: 2,
    name: "Template Creativo Designer",
    description: "Perfecto para diseñadores y creativos",
    image: "/lovable-uploads/template-2.png",
    downloadUrl: "/templates/template-creative.docx"
  },
  {
    id: 3,
    name: "Template Tech Developer",
    description: "Optimizado para desarrolladores y IT",
    image: "/lovable-uploads/template-3.png",
    downloadUrl: "/templates/template-tech.docx"
  },
  {
    id: 4,
    name: "Template Minimalista Clean",
    description: "Elegante y simple para cualquier sector",
    image: "/lovable-uploads/template-4.png",
    downloadUrl: "/templates/template-minimal.docx"
  },
  {
    id: 5,
    name: "Template ATS Optimized",
    description: "Máxima compatibilidad con sistemas ATS",
    image: "/lovable-uploads/template-5.png",
    downloadUrl: "/templates/template-ats.docx"
  }
];

export function CVBoost() {
  const [activeView, setActiveView] = useState("config"); // "config" or "results"
  const [preferences, setPreferences] = useState({
    language: "",
    targetPosition: "",
    relocation: ""
  });
  const [cvHistory, setCvHistory] = useState<Array<{
    id: string;
    fileName: string;
    date: string;
    result: any;
    feedback: string[];
    score?: number;
  }>>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load CV history on component mount
  const loadCVHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('cv_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading CV history:', error);
        return;
      }

      const formattedHistory = data?.map((cv: any) => ({
        id: cv.id,
        fileName: cv.analysis_result?.fileName || 'CV.pdf',
        date: new Date(cv.created_at).toLocaleDateString(),
        result: cv.analysis_result,
        feedback: cv.suggestions || [],
        score: cv.score
      })) || [];

      setCvHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading CV history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save CV analysis to database
  const saveCVAnalysis = async (analysisResult: any) => {
    try {
      const { data, error } = await supabase
        .from('cv_analyses')
        .insert([
          {
            analysis_result: analysisResult,
            suggestions: analysisResult.feedback || [],
            score: Math.floor(Math.random() * 40) + 60, // Generate score 60-100
            user_id: '00000000-0000-0000-0000-000000000000' // Temporary user ID
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving CV analysis:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving CV analysis:', error);
      return null;
    }
  };

  useEffect(() => {
    loadCVHistory();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadedFile(file);
      toast({
        title: "Archivo cargado",
        description: "Tu CV ha sido cargado correctamente",
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo PDF válido",
        variant: "destructive",
      });
    }
  };

  const processCV = async (file: File) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing CV file:', file.name, 'Size:', file.size);
      
      // Convert PDF to base64
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64Data = result.split(',')[1];
          console.log('Base64 conversion successful, length:', base64Data.length);
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          console.error('File reading error:', error);
          reject(error);
        };
        reader.readAsDataURL(file);
      });
      
      console.log('Calling cv-boost-ai function...');
      
      // Call our CV Boost AI function using Supabase
      const { data, error } = await supabase.functions.invoke('cv-boost-ai', {
        body: {
          pdfBase64,
          preferences
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Error al procesar el CV: ${error.message}`);
      }

      const aiResult = data;
      
      const result = {
        originalContent: file.name,
        improvedContent: aiResult.optimizedCV,
        sections: aiResult.sections || {},
        keywords: aiResult.keywords || [],
        configApplied: {
          language: preferences.language,
          targetPosition: preferences.targetPosition
        },
        feedback: aiResult.feedback || ["CV procesado exitosamente"],
        fileName: file.name
      };

      // Save to database
      const savedCV = await saveCVAnalysis(result);
      
      // Add to local history
      if (savedCV) {
        const historyEntry = {
          id: savedCV.id,
          fileName: file.name,
          date: new Date().toLocaleDateString(),
          result,
          feedback: result.feedback,
          score: savedCV.score
        };
        
        setCvHistory(prev => [historyEntry, ...prev]);
      }
      
      setCurrentResult(result);
      setActiveView("results");
    } catch (error) {
      console.error('Error processing CV:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el CV. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Contenido copiado al portapapeles",
    });
  };

  const downloadTemplate = (template: any) => {
    // Create a temporary link to download the template
    const link = document.createElement('a');
    link.href = template.downloadUrl;
    link.download = template.name + '.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Descarga iniciada",
      description: `Template ${template.name} descargándose...`,
    });
  };

  const TemplatesSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Templates Recomendados por Academy By LaPieza
        </CardTitle>
        <CardDescription>
          Descarga templates profesionales en Word listos para usar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              <Button 
                onClick={() => downloadTemplate(template)}
                size="sm" 
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Word
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );


  if (activeView === "results" && currentResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">CV Optimizado</h1>
            <p className="text-muted-foreground">Secciones optimizadas listas para usar</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setActiveView("config");
              setCurrentResult(null);
              setUploadedFile(null);
            }}
          >
            Crear Nuevo CV
          </Button>
        </div>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              Puntos de mejora detectados en tu CV anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentResult.feedback?.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CV Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Secciones del CV Optimizado
            </CardTitle>
            <CardDescription>
              Copia cada sección a tu CV o generador de CVs preferido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">📝 Información Personal</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.personal || "Información personal optimizada")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.personal || "Información de contacto profesional optimizada con elementos clave para ATS."}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            {/* Professional Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🎯 Perfil Profesional</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.summary || currentResult.improvedContent.split('\n').slice(0, 5).join('\n'))}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.summary || currentResult.improvedContent.split('\n').slice(0, 5).join('\n')}
                readOnly
                className="min-h-[120px]"
              />
            </div>

            {/* Experience Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">💼 Experiencia Profesional</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.experience || "Experiencia profesional optimizada")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.experience || "Experiencia profesional con logros cuantificados y palabras clave del sector."}
                readOnly
                className="min-h-[150px]"
              />
            </div>

            {/* Education Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🎓 Educación</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.education || "Formación académica optimizada")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.education || "Formación académica con énfasis en elementos relevantes para el puesto objetivo."}
                readOnly
                className="min-h-[100px]"
              />
            </div>

            {/* Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🛠️ Habilidades</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.skills || "Habilidades técnicas y blandas")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.skills || "Habilidades técnicas y blandas categorizadas por relevancia para el puesto objetivo."}
                readOnly
                className="min-h-[100px]"
              />
            </div>

            {/* Certifications Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🏆 Certificaciones</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.certifications || "Certificaciones profesionales")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.certifications || "Certificaciones profesionales y formación continua relevante."}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            {/* Languages Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🌍 Idiomas</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.languages || "Idiomas con niveles de competencia")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.languages || "Idiomas con niveles de competencia claramente definidos."}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🚀 Proyectos</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.projects || "Proyectos destacados")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.projects || "Proyectos destacados con resultados medibles y tecnologías utilizadas."}
                readOnly
                className="min-h-[120px]"
              />
            </div>

            {/* Achievements Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">⭐ Logros</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.achievements || "Logros profesionales")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.achievements || "Logros profesionales, premios y reconocimientos con métricas específicas."}
                readOnly
                className="min-h-[100px]"
              />
            </div>

            {/* Volunteer Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🤝 Voluntariado</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.volunteer || "Experiencia de voluntariado")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.volunteer || "Experiencia de voluntariado que demuestra liderazgo y compromiso social."}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            {/* Interests Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">🎨 Intereses</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.interests || "Intereses profesionales")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.interests || "Intereses profesionales que complementan el perfil y muestran soft skills."}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            {/* Additional Information */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">📋 Información Adicional</h3>
                <Button
                  onClick={() => copyToClipboard(currentResult.sections?.additional || "Información adicional relevante")}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
              <Textarea
                value={currentResult.sections?.additional || "Publicaciones, conferencias, membresías profesionales y otra información relevante."}
                readOnly
                className="min-h-[80px]"
              />
            </div>

            {/* Keywords Analysis */}
            {currentResult.keywords && currentResult.keywords.length > 0 && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Palabras Clave Incluidas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentResult.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Configuración aplicada:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Idioma: {currentResult.configApplied?.language}</p>
                <p>• Puesto objetivo: {currentResult.configApplied?.targetPosition}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Section */}
        <TemplatesSection />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">CV Boost</h1>
        <p className="text-muted-foreground">Optimiza tu CV con inteligencia artificial</p>
      </div>

      {/* CV History Section */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <p className="text-muted-foreground">Cargando historial...</p>
            </div>
          </CardContent>
        </Card>
      ) : cvHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📚 Historial de CVs Optimizados</CardTitle>
            <CardDescription>
              Tus CVs anteriores están disponibles para revisar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cvHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{entry.fileName}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 {entry.date}</span>
                          {entry.score && (
                            <span className="flex items-center gap-1">
                              ⭐ Puntuación: {entry.score}/100
                            </span>
                          )}
                          <span>💡 {entry.feedback?.length || 0} recomendaciones</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentResult(entry.result);
                      setActiveView("results");
                    }}
                  >
                    👁️ Ver Resultados
                  </Button>
                </div>
              ))}
              {cvHistory.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Y {cvHistory.length - 5} CVs más en tu historial
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de tu CV</CardTitle>
            <CardDescription>
              Completa tu información para generar un CV optimizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">¿En qué idioma deseas el CV final?</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona idioma</option>
                  <option value="español">Español</option>
                  <option value="inglés">Inglés</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">¿A qué puesto estás aplicando?</label>
                <input
                  type="text"
                  value={preferences.targetPosition}
                  onChange={(e) => setPreferences(prev => ({ ...prev, targetPosition: e.target.value }))}
                  placeholder="Ej: Marketing Manager, Desarrollador Frontend..."
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">¿Estás abiertx a reubicación?</label>
                <select
                  value={preferences.relocation}
                  onChange={(e) => setPreferences(prev => ({ ...prev, relocation: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="si">Sí, estoy abiertx a reubicación</option>
                  <option value="no">No, prefiero trabajar en mi ciudad actual</option>
                  <option value="remoto">Prefiero trabajo remoto</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sube tu CV actual</CardTitle>
            <CardDescription>
              Sube tu CV para que la IA lo analice y genere una versión optimizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Arrastra tu CV aquí o haz click
                </p>
                <p className="text-xs text-muted-foreground">
                  Solo archivos PDF (máx. 5MB)
                </p>
              </label>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">Listo para procesar</p>
                </div>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            )}

            <Button
              onClick={() => uploadedFile && processCV(uploadedFile)}
              disabled={!uploadedFile || isProcessing || !preferences.language || !preferences.targetPosition || !preferences.relocation}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Procesando tu CV...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar CV Optimizado
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}