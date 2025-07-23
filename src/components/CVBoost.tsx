import { useState } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, Globe, MapPin, Briefcase, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function CVBoost() {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState({
    language: "",
    targetPosition: ""
  });
  const [cvHistory, setCvHistory] = useState<Array<{
    id: string;
    fileName: string;
    date: string;
    result: any;
    feedback: string[];
  }>>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const processCV = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const feedback = [
      "Tu CV anterior tenía información de contacto incompleta",
      "Faltaba cuantificar logros específicos en la experiencia laboral", 
      "Las habilidades no estaban categorizadas ni tenían niveles definidos",
      "El perfil profesional era muy genérico y no mostraba tu valor único",
      "No había keywords relevantes para el puesto objetivo"
    ];
    
    const result = {
      originalContent: "CV content extracted...",
      improvedContent: `MARÍA JOSÉ GARCÍA LÓPEZ
📧 maria.garcia@email.com | 📱 +52 55 1234 5678 | 🌍 Ciudad de México | 💼 LinkedIn: /in/maria-garcia

PERFIL PROFESIONAL
Especialista en Marketing Digital con 5 años de experiencia desarrollando estrategias integrales para aumentar la visibilidad online y conversión de leads. Experta en SEO/SEM, redes sociales y análisis de datos. Busco aplicar mis conocimientos en ${preferences.targetPosition || 'marketing digital'} para impulsar el crecimiento de una empresa innovadora.

EXPERIENCIA PROFESIONAL

Marketing Manager | Empresa XYZ | Enero 2021 - Presente
• Diseñé e implementé estrategias de marketing digital que incrementaron el tráfico web en 150%
• Gestioné presupuestos de publicidad digital de $50,000 USD anuales con ROI del 300%
• Lideré un equipo de 3 especialistas en contenido y redes sociales
• Desarrollé campañas multi-canal que aumentaron la generación de leads en 80%

Especialista en Marketing Digital | StartUp ABC | Marzo 2019 - Diciembre 2020
• Creé contenido para redes sociales que aumentó el engagement en 200%
• Optimicé SEO del sitio web mejorando el ranking en Google en 50 posiciones
• Implementé herramientas de automatización que redujeron el tiempo de gestión en 40%
• Analicé métricas de rendimiento y presenté informes mensuales a dirección

HABILIDADES
Hard Skills
• Google Ads - Avanzado
• Facebook Business Manager - Avanzado  
• Google Analytics - Intermedio
• SEO/SEM - Avanzado
• Email Marketing - Intermedio

Soft Skills
• Liderazgo - Alto
• Comunicación - Alto
• Pensamiento analítico - Alto
• Trabajo en equipo - Alto

EDUCACIÓN
Licenciatura en Mercadotecnia | Universidad Nacional | 2015-2019

IDIOMAS
• Español - Nativo
• Inglés - Avanzado
• Francés - Básico`,
      configApplied: {
        language: preferences.language,
        targetPosition: preferences.targetPosition
      },
      feedback
    };

    // Save to history
    const historyEntry = {
      id: Date.now().toString(),
      fileName: file.name,
      date: new Date().toLocaleDateString(),
      result,
      feedback
    };
    
    setCvHistory(prev => [historyEntry, ...prev]);
    setResult(result);
    setIsProcessing(false);
    setCurrentStep(3);
  };

  const downloadCV = () => {
    // Simulate PDF download
    toast({
      title: "CV descargado",
      description: "Tu CV optimizado se ha descargado correctamente"
    });
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">CV Boost</h1>
            <p className="text-muted-foreground">Optimiza tu CV con inteligencia artificial</p>
            
            {/* CV History */}
            {cvHistory.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Historial de CVs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cvHistory.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{entry.fileName}</p>
                          <p className="text-sm text-muted-foreground">{entry.date}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResult(entry.result);
                            setCurrentStep(3);
                          }}
                        >
                          Ver CV
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

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
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!preferences.language || !preferences.targetPosition}
                className="w-full mt-6"
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">CV Boost</h1>
            <p className="text-muted-foreground">Sube tu CV actual para comenzar la optimización</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Adjunta tu CV actual en formato PDF</CardTitle>
              <CardDescription>
                Sube tu CV para que la IA lo analice y genere una versión optimizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
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
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <p className="text-lg font-medium">
                    Arrastra tu CV aquí o haz click para seleccionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Solo archivos PDF (máx. 10MB)
                  </p>
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">Archivo listo para procesar</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Regresar
                </Button>
                <Button
                  onClick={() => uploadedFile && processCV(uploadedFile)}
                  disabled={!uploadedFile || isProcessing}
                  className="flex-1"
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">CV Boost</h1>
          <p className="text-muted-foreground">Tu CV ha sido optimizado exitosamente</p>
        </div>

        {/* Feedback Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              Puntos de mejora detectados en tu CV anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.feedback?.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Optimized CV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Tu CV Optimizado - Template Profesional
              </span>
              <Button onClick={downloadCV} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
            </CardTitle>
            <CardDescription>
              CV profesional generado con las mejores prácticas de empleabilidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {result.improvedContent}
              </pre>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Configuración aplicada:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Idioma: {result.configApplied?.language}</p>
                <p>• Puesto objetivo: {result.configApplied?.targetPosition}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setUploadedFile(null);
                  setResult(null);
                }}
                className="flex-1"
              >
                Crear Nuevo CV
              </Button>
              <Button onClick={downloadCV} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Descargar CV Final
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}