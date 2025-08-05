import { useState, useEffect } from "react";
import { Upload, Users, Copy, CheckCircle, AlertCircle, Linkedin, History, Calendar, Trash2 } from "lucide-react";
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
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('linkedin_optimizations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistoryItems(data || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('linkedin_optimizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadHistory();
      toast({
        title: "Eliminado",
        description: "La optimización de LinkedIn ha sido eliminada del historial",
      });
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento del historial",
        variant: "destructive",
      });
    }
  };

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
      console.log('Processing LinkedIn optimization with files:', {
        personalCV: personalCV?.name,
        linkedinCV: linkedinCV?.name
      });
      
      // Convert personal CV to base64
      const reader1 = new FileReader();
      const personalCVBase64 = await new Promise<string>((resolve, reject) => {
        reader1.onload = () => {
          const result = reader1.result as string;
          const base64Data = result.split(',')[1];
          console.log('Personal CV base64 conversion successful, length:', base64Data.length);
          resolve(base64Data);
        };
        reader1.onerror = (error) => {
          console.error('Personal CV file reading error:', error);
          reject(error);
        };
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
            console.log('LinkedIn CV base64 conversion successful, length:', base64Data.length);
            resolve(base64Data);
          };
          reader2.onerror = (error) => {
            console.error('LinkedIn CV file reading error:', error);
            reject(error);
          };
          reader2.readAsDataURL(linkedinCV);
        });
      }
      
      console.log('Calling linkedin-optimizer-ai function...');
      
      // Call our LinkedIn Optimizer AI function using Supabase
      const { data, error } = await supabase.functions.invoke('linkedin-optimizer-ai', {
        body: {
          personalCVBase64,
          linkedinCVBase64
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Error al optimizar el perfil: ${error.message}`);
      }

      setOptimizedContent(data);

      // Save to history
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const { error: saveError } = await supabase
          .from('linkedin_optimizations')
          .insert({
            user_id: user.id,
            personal_cv_filename: personalCV.name,
            linkedin_cv_filename: linkedinCV?.name || null,
            optimized_content: data
          });

        if (saveError) {
          console.error('Error saving to history:', saveError);
        } else {
          await loadHistory();
        }
      }
      
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
      {/* Header with History Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Optimizador de LinkedIn</h1>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="outline"
          size="sm"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
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
                        <h4 className="font-medium">{item.personal_cv_filename}</h4>
                        {item.linkedin_cv_filename && (
                          <p className="text-sm text-muted-foreground">+ {item.linkedin_cv_filename}</p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setOptimizedContent(item.optimized_content)}
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
                  Generando contenido para LinkedIn... (puede tardar más de 1 minuto)
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
                {optimizedContent.spanish.experiences && optimizedContent.spanish.experiences.length > 0 ? (
                  optimizedContent.spanish.experiences.map((exp: any, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Experiencia {index + 1}: {exp.title} - {exp.company}</h3>
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
                        value={exp.description || "Descripción de experiencia profesional no disponible"}
                        readOnly
                        className="min-h-[100px]"
                      />
                    </div>
                  ))
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Experiencia</h3>
                      <Button
                        onClick={() => copyToClipboard(optimizedContent.spanish.experience || "No disponible")}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <Textarea
                      value={optimizedContent.spanish.experience || "Experiencia profesional no disponible"}
                      readOnly
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {/* Education Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Educación</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.education || "No disponible")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.education || "Información de educación no disponible"}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>

                {/* Certifications Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Licencias y Certificaciones</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.certifications || "No disponible")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.certifications || "Certificaciones no disponibles"}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>

                {/* Projects Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Proyectos</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.projects || "No disponible")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.projects || "Proyectos no disponibles"}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>

                {/* Volunteer Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Voluntariado</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.volunteer || "No disponible")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.volunteer || "Experiencia de voluntariado no disponible"}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Accomplishments Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Logros y Reconocimientos</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.accomplishments || "No disponible")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.accomplishments || "Logros no disponibles"}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Interests Español */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Intereses</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.spanish.interests || "No disponible")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.spanish.interests || "Intereses no disponibles"}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Skills Español */}
                <div>
                  <h3 className="font-medium mb-2">Aptitudes Recomendadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {optimizedContent.spanish.skills && optimizedContent.spanish.skills.length > 0 ? (
                      optimizedContent.spanish.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Aptitudes no disponibles</Badge>
                    )}
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
                {optimizedContent.english.experiences && optimizedContent.english.experiences.length > 0 ? (
                  optimizedContent.english.experiences.map((exp: any, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Experience {index + 1}: {exp.title} - {exp.company}</h3>
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
                        value={exp.description || "Professional experience description not available"}
                        readOnly
                        className="min-h-[100px]"
                      />
                    </div>
                  ))
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Experience</h3>
                      <Button
                        onClick={() => copyToClipboard(optimizedContent.english.experience || "Not available")}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={optimizedContent.english.experience || "Professional experience not available"}
                      readOnly
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {/* Education English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Education</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.education || "Not available")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.education || "Education information not available"}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>

                {/* Certifications English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Licenses & Certifications</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.certifications || "Not available")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.certifications || "Certifications not available"}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>

                {/* Projects English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Projects</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.projects || "Not available")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.projects || "Projects not available"}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>

                {/* Volunteer English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Volunteer Experience</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.volunteer || "Not available")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.volunteer || "Volunteer experience not available"}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Accomplishments English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Accomplishments</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.accomplishments || "Not available")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.accomplishments || "Accomplishments not available"}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Interests English */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Interests</h3>
                    <Button
                      onClick={() => copyToClipboard(optimizedContent.english.interests || "Not available")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={optimizedContent.english.interests || "Interests not available"}
                    readOnly
                    className="min-h-[60px]"
                  />
                </div>

                {/* Skills English */}
                <div>
                  <h3 className="font-medium mb-2">Recommended Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {optimizedContent.english.skills && optimizedContent.english.skills.length > 0 ? (
                      optimizedContent.english.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Skills not available</Badge>
                    )}
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