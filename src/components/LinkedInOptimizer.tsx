import { useState } from "react";
import { Upload, Users, Copy, CheckCircle, AlertCircle, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function LinkedInOptimizer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('');
  const [optimizedContent, setOptimizedContent] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const optimizeProfile = async () => {
    if (!uploadedFile) return;
    
    setIsOptimizing(true);
    
    // Simulate AI optimization
    setTimeout(() => {
      setOptimizedContent({
        spanish: {
          headline: "Ingeniero de Software Senior | Desarrollador Full-Stack | Experto en React & Node.js | Construcción de Aplicaciones Web Escalables",
          summary: "Ingeniero de software experimentado con más de 5 años de experiencia en desarrollo full-stack. Historial comprobado en la entrega de aplicaciones web de alta calidad usando React, Node.js y tecnologías modernas. 💻\n\nApasionado por crear soluciones eficientes y escalables que impulsen el crecimiento empresarial. Mi experiencia incluye liderazgo de equipos, arquitectura de sistemas y optimización de procesos. 🚀\n\n¿Interesado en conectar? Escríbeme a: ejemplo@email.com 📧",
          skills: [
            "JavaScript", "React", "Node.js", "TypeScript", "Python", "AWS", "MongoDB", "PostgreSQL", "Git", "Docker"
          ]
        },
        english: {
          headline: "Senior Software Engineer | Full-Stack Developer | React & Node.js Expert | Building Scalable Web Applications",
          summary: "Experienced software engineer with 5+ years of expertise in full-stack development. Proven track record of delivering high-quality web applications using React, Node.js, and modern technologies. 💻\n\nPassionate about creating efficient, scalable solutions that drive business growth. My experience includes team leadership, system architecture, and process optimization. 🚀\n\nInterested in connecting? Reach out to me at: ejemplo@email.com 📧",
          skills: [
            "JavaScript", "React", "Node.js", "TypeScript", "Python", "AWS", "MongoDB", "PostgreSQL", "Git", "Docker"
          ]
        }
      });
      setIsOptimizing(false);
    }, 3000);
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
              Subir CV Optimizado
            </CardTitle>
            <CardDescription>
              Sube tu CV optimizado para generar contenido para LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="linkedin-upload"
              />
              <label
                htmlFor="linkedin-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Linkedin className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Click para subir CV optimizado (PDF)
                </p>
                <p className="text-xs text-muted-foreground">
                  Solo archivos PDF
                </p>
              </label>
            </div>
            
            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <Linkedin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
            )}
            
            <Button
              onClick={optimizeProfile}
              disabled={!uploadedFile || isOptimizing}
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

        {/* Quick Tips */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-info" />
              How to Export LinkedIn Profile
            </CardTitle>
            <CardDescription>
              Step-by-step guide to get your profile PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
                <div>
                  <p className="text-sm font-medium">Go to your LinkedIn profile</p>
                  <p className="text-xs text-muted-foreground">Visit your LinkedIn profile page</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</div>
                <div>
                  <p className="text-sm font-medium">Click "More" button</p>
                  <p className="text-xs text-muted-foreground">Find the "More" button in the top section</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</div>
                <div>
                  <p className="text-sm font-medium">Select "Save to PDF"</p>
                  <p className="text-xs text-muted-foreground">Download your profile as PDF</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">4</div>
                <div>
                  <p className="text-sm font-medium">Upload here</p>
                  <p className="text-xs text-muted-foreground">Upload the PDF for optimization</p>
                </div>
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