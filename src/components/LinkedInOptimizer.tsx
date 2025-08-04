import { useState } from "react";
import { Upload, Users, Copy, CheckCircle, AlertCircle, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export function LinkedInOptimizer() {
  const [personalCV, setPersonalCV] = useState<File | null>(null);
  const [linkedinCV, setLinkedinCV] = useState<File | null>(null);
  const [language, setLanguage] = useState('');
  const [optimizedContent, setOptimizedContent] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const handlePersonalCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleLinkedInCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setLinkedinCV(file);
      toast({
        title: "CV LinkedIn cargado",
        description: "Tu CV de LinkedIn ha sido cargado correctamente",
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
    if (!personalCV) return;
    
    setIsOptimizing(true);
    
    try {
      // Convert personal CV to base64
      const reader1 = new FileReader();
      const personalCVBase64 = await new Promise<string>((resolve, reject) => {
        reader1.onload = () => {
          const result = reader1.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader1.onerror = reject;
        reader1.readAsDataURL(personalCV);
      });

      // Convert LinkedIn CV to base64 if provided
      let linkedinCVBase64 = null;
      if (linkedinCV) {
        const reader2 = new FileReader();
        linkedinCVBase64 = await new Promise<string>((resolve, reject) => {
          reader2.onload = () => {
            const result = reader2.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader2.onerror = reject;
          reader2.readAsDataURL(linkedinCV);
        });
      }
      
      // Call our LinkedIn Optimizer AI function using Supabase
      const { data, error } = await supabase.functions.invoke('linkedin-optimizer-ai', {
        body: {
          personalCVBase64,
          linkedinCVBase64
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Error al optimizar el perfil');
      }

      setOptimizedContent(data);
      
    } catch (error) {
      console.error('Error optimizing profile:', error);
      toast({
        title: "Error",
        description: "No se pudo optimizar el perfil. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Subir CVs para Optimización
            </CardTitle>
            <CardDescription>
              Sube tu CV personal y tu CV de LinkedIn para generar contenido optimizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal CV Upload */}
            <div>
              <h4 className="text-sm font-medium mb-2">1. CV Personal Optimizado</h4>
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
                    Tu CV actualizado y optimizado
                  </p>
                </label>
              </div>
              
              {personalCV && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg mt-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{personalCV.name}</span>
                  <Badge variant="secondary">Listo</Badge>
                </div>
              )}
            </div>

            {/* LinkedIn CV Upload */}
            <div>
              <h4 className="text-sm font-medium mb-2">2. CV de LinkedIn (Opcional)</h4>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleLinkedInCVUpload}
                  className="hidden"
                  id="linkedin-cv-upload"
                />
                <label
                  htmlFor="linkedin-cv-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Linkedin className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Subir CV de LinkedIn (PDF)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Para comparar y mejorar
                  </p>
                </label>
              </div>
              
              {linkedinCV && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg mt-2">
                  <Linkedin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{linkedinCV.name}</span>
                  <Badge variant="secondary">Listo</Badge>
                </div>
              )}
            </div>
            
            <Button
              onClick={optimizeProfile}
              disabled={!personalCV || isOptimizing}
              className="w-full"
              variant="professional"
            >
              {isOptimizing ? (
                <>
                  <Users className="w-4 h-4 mr-2 animate-spin" />
                  Generando contenido para LinkedIn...
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

        {/* How to get LinkedIn CV */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-info" />
              ¿Cómo obtener tu CV de LinkedIn?
            </CardTitle>
            <CardDescription>
              Sigue estos pasos para descargar tu perfil como PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
                <div>
                  <p className="text-sm font-medium">Ve a tu perfil de LinkedIn</p>
                  <p className="text-xs text-muted-foreground">Haz click en "Ver perfil" desde tu página principal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</div>
                <div>
                  <p className="text-sm font-medium">Busca "Más opciones"</p>
                  <p className="text-xs text-muted-foreground">Click en los tres puntos (...) en la sección superior</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</div>
                <div>
                  <p className="text-sm font-medium">Selecciona "Guardar como PDF"</p>
                  <p className="text-xs text-muted-foreground">El archivo se descargará automáticamente</p>
                </div>
              </div>
              <div className="border border-info/20 rounded-lg p-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Asegúrate de que tu perfil esté completo antes de descargarlo para obtener mejores resultados en la optimización.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {optimizedContent && (
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Contenido Optimizado para LinkedIn
            </CardTitle>
            <CardDescription>
              Contenido optimizado por IA listo para copiar a tu perfil de LinkedIn
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contenido en Español */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold mb-4">🇪🇸 Contenido en Español</h2>
                
                {/* Headline Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Titular Profesional</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.headline)}
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
                      onClick={() => copyToClipboard(optimizedContent.spanish.summary)}
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
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Experiencia</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.experience)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.experience}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>

                {/* Education Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Educación</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.education)}
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

                {/* Certifications Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Licencias y Certificaciones</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.certifications)}
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

                {/* Projects Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Proyectos</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.projects)}
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

                {/* Volunteer Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Voluntariado</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.volunteer)}
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

                {/* Skills Español */}
                <div>
                  <h3 className="font-medium mb-2">Aptitudes Recomendadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {optimizedContent.spanish.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido en Inglés */}
              <div>
                <h2 className="text-lg font-semibold mb-4">🇺🇸 Content in English</h2>
                
                {/* Headline English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Professional Headline</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.headline)}
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
                      onClick={() => copyToClipboard(optimizedContent.english.summary)}
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
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Experience</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.experience)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.experience}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>

                {/* Education English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Education</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.education)}
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

                {/* Certifications English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Licenses & Certifications</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.certifications)}
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
                      onClick={() => copyToClipboard(optimizedContent.english.projects)}
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
                      onClick={() => copyToClipboard(optimizedContent.english.volunteer)}
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

                {/* Skills English */}
                <div>
                  <h3 className="font-medium mb-2">Recommended Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {optimizedContent.english.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}