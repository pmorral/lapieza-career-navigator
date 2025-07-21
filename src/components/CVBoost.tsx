import { useState } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, Globe, MapPin, Briefcase, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function CVBoost() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState("");
  const [relocation, setRelocation] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const templates = [
    { 
      name: "Profesional", 
      description: "Para perfiles jr u operativos",
      color: "bg-blue-100"
    },
    { 
      name: "Creativo", 
      description: "Para perfiles de Marketing y Diseño",
      color: "bg-purple-100"
    },
    { 
      name: "Clásico", 
      description: "Para perfiles Sr.",
      color: "bg-gray-100"
    },
    { 
      name: "Moderno", 
      description: "Para perfiles tecnológicos",
      color: "bg-green-100"
    },
    { 
      name: "Ejecutivo", 
      description: "Para perfiles directivos",
      color: "bg-red-100"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const processCV = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing for CV text extraction and corrections
    setTimeout(() => {
      setResult({
        sections: {
          experiencia: {
            original: "Trabajé en varias empresas desarrollando software",
            corrected: "Desarrollador de software con experiencia en múltiples organizaciones, enfocado en la creación de soluciones tecnológicas innovadoras y eficientes que mejoran los procesos empresariales"
          },
          educacion: {
            original: "Estudié ingeniería en sistemas",
            corrected: "Ingeniero en Sistemas Computacionales con sólida formación en desarrollo de software, análisis de sistemas y metodologías ágiles"
          },
          habilidades: {
            original: "React, JavaScript, CSS",
            corrected: "• Desarrollo Frontend: React.js, JavaScript ES6+, TypeScript, HTML5, CSS3\n• Frameworks y Librerías: Next.js, Tailwind CSS, Material-UI\n• Control de Versiones: Git, GitHub, GitLab"
          },
          idiomas: {
            original: "Inglés intermedio",
            corrected: "• Español: Nativo\n• Inglés: Intermedio-Alto (B2) - Capacidad para comunicación técnica y documentación"
          },
          perfil: {
            original: "Soy desarrollador",
            corrected: "Desarrollador Frontend especializado en React.js con pasión por crear experiencias de usuario excepcionales. Orientado a resultados con capacidad para trabajar en equipos multidisciplinarios y entregar soluciones de alta calidad"
          },
          logros: {
            original: "Hice varios proyectos",
            corrected: "• Lideré el desarrollo de aplicación web que mejoró la eficiencia operativa en 40%\n• Implementé sistema de gestión que redujo tiempos de respuesta en 60%\n• Colaboré en equipo ágil entregando 15+ features en 6 meses"
          }
        }
      });
      setIsProcessing(false);
      setCurrentStep(3);
    }, 3000);
  };

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Texto copiado",
        description: `El texto de ${sectionName} ha sido copiado al portapapeles`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el texto",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = (templateType: string) => {
    console.log(`Downloading ${templateType} template...`);
  };

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">CV Boost</h2>
          <p className="text-muted-foreground">
            Optimiza tu CV con IA para destacar en el mercado laboral
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuración Principal */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Configuración de tu CV</CardTitle>
                <CardDescription>
                  Responde estas preguntas para personalizar las correcciones de IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">¿En qué idioma deseas las correcciones?</Label>
                  <RadioGroup value={language} onValueChange={setLanguage} className="mt-2">
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
                  <Label className="text-base font-medium">¿Estás abierto/a a reubicación?</Label>
                  <RadioGroup value={relocation} onValueChange={setRelocation} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">¿A qué puesto estás aplicando?</Label>
                  <Textarea 
                    placeholder="Describe el puesto o tipo de posición que buscas..."
                    value={targetPosition}
                    onChange={(e) => setTargetPosition(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!language || !relocation || !targetPosition}
                  className="w-full"
                  variant="professional"
                >
                  Continuar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Templates Opcionales */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Templates Disponibles
                </CardTitle>
                <CardDescription>
                  Descarga templates profesionales (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => (
                  <div key={template.name} className="border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-10 ${template.color} rounded flex items-center justify-center`}>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                      </div>
                      <Button
                        onClick={() => downloadTemplate(template.name)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">CV Boost</h2>
          <p className="text-muted-foreground">
            Sube tu CV actual para comenzar la optimización
          </p>
        </div>

        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Adjunta tu CV actual</CardTitle>
            <CardDescription>
              Sube tu CV en formato PDF para que la IA lo analice y optimice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <FileText className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Click para subir tu CV
                </p>
                <p className="text-xs text-muted-foreground">
                  Solo archivos PDF
                </p>
              </label>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <Badge variant="secondary">Listo</Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                Regresar
              </Button>
              <Button
                onClick={processCV}
                disabled={!uploadedFile || isProcessing}
                className="flex-1"
                variant="professional"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Extrayendo texto y generando correcciones...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analizar CV y Generar Correcciones
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">CV Boost - Correcciones Generadas</h2>
        <p className="text-muted-foreground">
          Hemos extraído el texto de tu CV y generado correcciones para cada sección
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Correcciones por Sección */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(result?.sections || {}).map(([sectionKey, sectionData]: [string, any]) => (
            <Card key={sectionKey} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{sectionKey}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(sectionData.corrected, sectionKey)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Texto Original:</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{sectionData.original}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-success">Texto Corregido:</Label>
                  <div className="mt-1 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{sectionData.corrected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Templates Opcionales y Configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Templates Disponibles */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Templates Disponibles
              </CardTitle>
              <CardDescription>
                Descarga templates profesionales para aplicar tus correcciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <div key={template.name} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-12 ${template.color} rounded flex items-center justify-center`}>
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                    <Button
                      onClick={() => downloadTemplate(template.name)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configuración Aplicada */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Configuración Aplicada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Idioma: {language === "spanish" ? "Español" : "Inglés"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Reubicación: {relocation === "yes" ? "Sí" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Puesto: {targetPosition}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={() => {
            setCurrentStep(1);
            setResult(null);
            setUploadedFile(null);
            
            setLanguage("");
            setRelocation("");
            setTargetPosition("");
          }}
          variant="outline"
        >
          Crear nuevo CV
        </Button>
      </div>
    </div>
  );
}