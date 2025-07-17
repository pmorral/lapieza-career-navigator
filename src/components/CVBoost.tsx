import { useState } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, Globe, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CVBoost() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState("");
  const [relocation, setRelocation] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const processCV = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setResult({
        optimizedContent: "CV optimizado generado exitosamente",
        templates: ["professional", "creative", "classic"]
      });
      setIsProcessing(false);
      setCurrentStep(3);
    }, 3000);
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

        <Card className="shadow-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Configuración de tu CV</CardTitle>
            <CardDescription>
              Responde estas preguntas para personalizar tu CV optimizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">¿En qué idioma deseas el CV final?</Label>
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
                    Procesando CV...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Optimizar CV
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
        <h2 className="text-2xl font-bold mb-2">CV Boost - Resultados</h2>
        <p className="text-muted-foreground">
          Tu CV ha sido optimizado exitosamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              CV Optimizado
            </CardTitle>
            <CardDescription>
              Contenido mejorado según tus especificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-medium mb-2">Configuración aplicada:</h4>
                <div className="space-y-1 text-sm">
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
                    <span>Puesto objetivo: {targetPosition}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm text-success font-medium">
                  ✓ CV optimizado con estructura profesional
                </p>
                <p className="text-sm text-success font-medium">
                  ✓ Contenido alineado al puesto objetivo
                </p>
                <p className="text-sm text-success font-medium">
                  ✓ Keywords optimizadas para ATS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Descargar Templates
            </CardTitle>
            <CardDescription>
              Elige el diseño que mejor se adapte a tu perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
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
                }
              ].map((template) => (
                <div key={template.name} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-16 ${template.color} rounded flex items-center justify-center`}>
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
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
            </div>
          </CardContent>
        </Card>
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