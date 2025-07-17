import { useState } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, AlertCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CVAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const analyzeCV = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        score: 85,
        strengths: [
          "Strong technical skills presentation",
          "Well-structured experience section",
          "Relevant education background"
        ],
        improvements: [
          "Add more quantifiable achievements",
          "Include specific project outcomes",
          "Optimize keywords for ATS systems"
        ],
        suggestions: [
          "Consider adding a professional summary",
          "Include links to portfolio or GitHub",
          "Add relevant certifications"
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const downloadTemplate = (templateType: string) => {
    // Simulate template download
    console.log(`Downloading ${templateType} template...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">CV Analys</h2>
        <p className="text-muted-foreground">
          Optimiza tu CV para una vacante específica con análisis de IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Sube tu CV actualizado
            </CardTitle>
            <CardDescription>
              Primero sube tu CV actual para el análisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
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
                  PDF, DOC, o DOCX solamente
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
          </CardContent>
        </Card>

        {/* Job Description Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Descripción de la vacante
            </CardTitle>
            <CardDescription>
              Pega la descripción del puesto para optimizar tu CV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="job-description">Descripción completa del puesto</Label>
              <Textarea
                id="job-description"
                placeholder="Pega aquí la descripción completa de la vacante a la que quieres aplicar..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
              />
            </div>
            
            <Button
              onClick={analyzeCV}
              disabled={!uploadedFile || !jobDescription || isAnalyzing}
              className="w-full"
              variant="professional"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Optimizando CV...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimizar CV para esta vacante
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Optimized CV Results */}
      {analysisResult && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              CV Optimizado para la Vacante
            </CardTitle>
            <CardDescription>
              Tu CV ha sido reorganizado y optimizado para esta oportunidad específica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-medium text-success mb-2">Optimizaciones realizadas:</h4>
                <ul className="space-y-1 text-sm text-success">
                  <li>• Encabezado optimizado con headline profesional</li>
                  <li>• Perfil profesional alineado al puesto objetivo</li>
                  <li>• Experiencia reorganizada y redactada para esta vacante</li>
                  <li>• Skills categorizadas y priorizadas según requisitos</li>
                  <li>• Estructura optimizada para ATS</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div key={template.name} className="border rounded-lg p-4 text-center">
                    <div className={`w-full h-24 ${template.color} rounded-lg mb-3 flex items-center justify-center`}>
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <Button
                      onClick={() => downloadTemplate(template.name)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}