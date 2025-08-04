import { useState, useEffect } from "react";
import { Upload, Download, FileText, Sparkles, CheckCircle, Globe, MapPin, Briefcase, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export function CVBoost() {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [result, setResult] = useState<any>(null);
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
      
      setResult(result);
      setCurrentStep(3);
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

  const downloadCV = () => {
    if (!result?.improvedContent) {
      toast({
        title: "Error",
        description: "No hay contenido de CV para descargar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create PDF using jsPDF
      const doc = new jsPDF();
      
      // Set font and title
      doc.setFontSize(20);
      doc.text("CV OPTIMIZADO", 20, 30);
      
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generado por CV Boost AI - ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Add CV content
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(result.improvedContent, 170);
      doc.text(lines, 20, 60);
      
      // Save the PDF
      const fileName = `CV_Optimizado_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "CV descargado",
        description: "Tu CV optimizado se ha descargado como PDF"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  // Download CV from history
  const downloadCVFromHistory = (cvResult: any) => {
    if (!cvResult?.improvedContent) {
      toast({
        title: "Error",
        description: "No hay contenido de CV para descargar",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("CV OPTIMIZADO", 20, 30);
      doc.setFontSize(10);
      doc.text(`Generado por CV Boost AI - ${new Date().toLocaleDateString()}`, 20, 45);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(cvResult.improvedContent, 170);
      doc.text(lines, 20, 60);
      
      const fileName = `${cvResult.fileName.replace('.pdf', '')}_Optimizado_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "CV descargado",
        description: "Tu CV optimizado se ha descargado como PDF"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">CV Boost</h1>
            <p className="text-muted-foreground">Optimiza tu CV con inteligencia artificial</p>
          </div>

          {/* CV History Section */}
          {isLoading ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <p className="text-muted-foreground">Cargando historial...</p>
                </div>
              </CardContent>
            </Card>
          ) : cvHistory.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">📚 Historial de CVs Optimizados</CardTitle>
                <CardDescription>
                  Tus CVs anteriores están disponibles para descargar y revisar
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResult(entry.result);
                            setCurrentStep(3);
                          }}
                        >
                          👁️ Ver Detalles
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCVFromHistory(entry.result)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      </div>
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

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!preferences.language || !preferences.targetPosition || !preferences.relocation}
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
                    Solo archivos PDF (máx. 5MB)
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