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
      description: "Para todos los perfiles profesionales",
      color: "bg-blue-100"
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
        <h2 className="text-2xl font-bold mb-2">CV Boost - CV Optimizado</h2>
        <p className="text-muted-foreground">
          Tu CV ha sido optimizado según las mejores prácticas de empleabilidad
        </p>
      </div>

      <Card className="shadow-card max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tu CV Optimizado</span>
            <Button variant="professional">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </CardTitle>
          <CardDescription>
            CV profesional optimizado con template profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vista previa del CV optimizado */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-xl font-bold">Juan Pérez García</h3>
                <p className="text-primary font-medium">Desarrollador Frontend Especializado en React.js</p>
                <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>juan.perez@email.com</span>
                  <span>•</span>
                  <span>+52 55 1234 5678</span>
                  <span>•</span>
                  <span>Ciudad de México</span>
                  <span>•</span>
                  <span>linkedin.com/in/juanperez</span>
                  {relocation === "yes" && (
                    <>
                      <span>•</span>
                      <span>Abierto a reubicación</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-2">PERFIL PROFESIONAL</h4>
                <p className="text-sm">
                  Desarrollador Frontend especializado en React.js con pasión por crear experiencias de usuario excepcionales. 
                  Orientado a resultados con capacidad para trabajar en equipos multidisciplinarios y entregar soluciones de alta calidad.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-2">EXPERIENCIA PROFESIONAL</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">Desarrollador Frontend Senior</h5>
                        <p className="text-sm text-primary">Tech Solutions Inc.</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Ene 2022 - Presente</p>
                    </div>
                    <ul className="text-sm mt-1 space-y-1">
                      <li>• Lidero el desarrollo de aplicación web que mejoró la eficiencia operativa en 40%</li>
                      <li>• Implemento sistema de gestión que redujo tiempos de respuesta en 60%</li>
                      <li>• Colaboro en equipo ágil entregando 15+ features en 6 meses</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-primary mb-2">HABILIDADES TÉCNICAS</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>React.js</span>
                      <span className="text-muted-foreground">Avanzado</span>
                    </div>
                    <div className="flex justify-between">
                      <span>JavaScript ES6+</span>
                      <span className="text-muted-foreground">Avanzado</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TypeScript</span>
                      <span className="text-muted-foreground">Intermedio</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Git/GitHub</span>
                      <span className="text-muted-foreground">Avanzado</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-primary mb-2">HABILIDADES BLANDAS</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Liderazgo de equipos</span>
                      <span className="text-muted-foreground">Alto</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comunicación efectiva</span>
                      <span className="text-muted-foreground">Alto</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolución de problemas</span>
                      <span className="text-muted-foreground">Alto</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-primary mb-2">EDUCACIÓN</h4>
                  <div className="text-sm">
                    <p className="font-medium">Ingeniería en Sistemas Computacionales</p>
                    <p className="text-muted-foreground">Universidad Tecnológica Nacional</p>
                    <p className="text-muted-foreground">2018 - 2022</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-primary mb-2">IDIOMAS</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Español</span>
                      <span className="text-muted-foreground">Nativo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inglés</span>
                      <span className="text-muted-foreground">Intermedio-Alto (B2)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración aplicada */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Configuración Aplicada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
        </CardContent>
      </Card>

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