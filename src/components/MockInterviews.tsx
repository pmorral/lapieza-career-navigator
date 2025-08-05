import { useState, useRef } from "react";
import { Play, MessageSquare, FileText, Star, Clock, Mic, MicOff, Upload, X, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InterviewCredits } from "./InterviewCredits";
import { useToast } from "@/hooks/use-toast";

interface InterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  duration: string;
  score: number;
  feedback: string;
  improvements: string[];
  status: 'completed' | 'in-progress' | 'scheduled';
  recordingUrl?: string;
  betterAnswers?: string[];
}

export function MockInterviews() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [interviewCredits, setInterviewCredits] = useState(5);
  const [usedInterviews, setUsedInterviews] = useState(0);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<InterviewSession[]>([
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'Tech Corp',
      date: '2024-01-15',
      duration: '25 min',
      score: 85,
      feedback: "Conocimiento técnico sólido demostrado. Buenas habilidades de comunicación. Confiado al explicar conceptos complejos.",
      improvements: [
        'Practice behavioral questions more',
        'Prepare specific examples for leadership scenarios',
        'Work on concise answers'
      ],
      status: 'completed',
      recordingUrl: "https://example-interview-recording.com/session1.mp3",
      betterAnswers: [
        "Para la pregunta 'Háblame de ti', podrías estructurar mejor tu respuesta siguiendo esta guía: 'Soy un desarrollador frontend con 5 años de experiencia especializado en React y TypeScript. En mi trabajo actual en Tech Corp, lidero un equipo de 3 desarrolladores y hemos mejorado el rendimiento de la aplicación en un 40%. Busco nuevos desafíos donde pueda aplicar mi experiencia en arquitectura frontend y mentoría.'",
        "Cuando te pregunten sobre debugging, proporciona un ejemplo específico: 'Recientemente enfrenté un bug de memoria en nuestra SPA. Utilicé Chrome DevTools para identificar memory leaks, implementé lazy loading para componentes pesados y reduje el uso de memoria en un 60%. Documenté el proceso para el equipo.'"
      ]
    },
    {
      id: '2',
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      date: '2024-01-10',
      duration: '30 min',
      score: 78,
      feedback: "Enfoque sólido para resolver problemas. Buen entendimiento del diseño de sistemas. Entusiasta y comprometido.",
      improvements: [
        'Improve answer structure (STAR method)',
        'Practice coding questions out loud',
        'Research company culture better'
      ],
      status: 'completed',
      recordingUrl: "https://example-interview-recording.com/session2.mp3",
      betterAnswers: [
        "Para proyectos desafiantes, usa STAR: 'Situación: Nuestro e-commerce tenía problemas de rendimiento. Tarea: Optimizar la velocidad de carga. Acción: Implementé code splitting, optimicé imágenes y usé service workers. Resultado: Redujimos el tiempo de carga en 50% y aumentamos la conversión en 15%.'",
        "Al hablar de tecnologías, sé específico: 'Sigo blogs como CSS-Tricks, participo en comunidades de React, y dedico 2 horas semanales a experimentar con nuevas herramientas. Recientemente exploré Vite para builds más rápidos en nuestros proyectos.'"
      ]
    }
  ]);

  const startInterview = () => {
    if (!jobTitle.trim() || !jobDescription.trim()) return;
    
    // Check if user has available interviews
    if (usedInterviews >= interviewCredits) {
      setShowCreditsDialog(true);
      return;
    }
    
    // Show email notification popup
    setShowEmailNotification(true);
  };

  const endInterview = () => {
    // Simulate AI feedback generation in Spanish
    const feedback = `Basándome en la descripción de la vacante proporcionada, aquí está mi evaluación:

FORTALEZAS IDENTIFICADAS:
• Conocimiento técnico sólido relacionado con los requisitos del puesto
• Buena articulación de ideas y comunicación clara
• Ejemplos relevantes que demuestran experiencia práctica

ÁREAS DE MEJORA:
• Aplicar más consistentemente la metodología STAR en las respuestas
• Profundizar en ejemplos específicos que conecten con los requisitos de la vacante
• Mostrar mayor conocimiento sobre la cultura y valores de la empresa

METODOLOGÍA STAR:
La metodología STAR es una técnica estructurada para responder preguntas de entrevista:
- Situación: Describe el contexto o situación
- Tarea: Explica la tarea que tenías que realizar
- Acción: Detalla las acciones específicas que tomaste
- Resultado: Comparte los resultados obtenidos con métricas cuando sea posible

Aplicar esta metodología te ayudará a dar respuestas más estructuradas y convincentes.`;

    const newInterview = {
      id: Date.now().toString(),
      jobTitle: "Software Engineer", 
      company: "Tech Corp",
      date: new Date().toISOString().split('T')[0],
      duration: "45 min",
      score: 8.5,
      feedback,
      improvements: [
        "Practicar más preguntas conductuales usando metodología STAR",
        "Preparar ejemplos específicos para escenarios de liderazgo", 
        "Investigar a fondo la cultura de la empresa"
      ],
        status: "completed" as const,
        recordingUrl: "https://example-interview-recording.com/audio.mp3"
      };

      setInterviews(prev => [newInterview, ...prev]);
      setIsInterviewActive(false);
      setIsRecording(false);
      setCurrentQuestion('');
      setUsedInterviews(prev => prev + 1);
      
      toast({
        title: "Entrevista completada",
        description: `Te quedan ${interviewCredits - usedInterviews - 1} entrevistas gratuitas.`,
      });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedCV(file);
    }
  };

  const removeCV = () => {
    setUploadedCV(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const handlePurchaseCredits = (credits: number) => {
    setInterviewCredits(prev => prev + credits);
    toast({
      title: "Créditos agregados",
      description: `Se han agregado ${credits} créditos a tu cuenta.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Simulación de Entrevistas con AI</h2>
          <p className="text-muted-foreground">Practica entrevistas con IA y recibe retroalimentación detallada</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-sm">
              {interviewCredits - usedInterviews} entrevistas disponibles
            </Badge>
            {usedInterviews >= interviewCredits && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreditsDialog(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Comprar créditos
              </Button>
            )}
          </div>
        </div>
        
        <Button variant="professional">
          <Play className="w-4 h-4 mr-2" />
          Start New Interview
        </Button>
      </div>

      {/* Interview Setup */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Start AI Interview
          </CardTitle>
          <CardDescription>
            Paste the job description to generate personalized interview questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Idioma de la entrevista</Label>
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
            <Label htmlFor="cv-upload">Subir CV (Opcional)</Label>
            <div className="mt-2 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="cv-upload"
              />
              
              {!uploadedCV ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-dashed"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para subir tu CV (PDF)
                    </p>
                  </div>
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{uploadedCV.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeCV}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="job-title">Título del puesto *</Label>
            <Textarea
              id="job-title"
              placeholder="Ej: Frontend Developer, Data Scientist, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              rows={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="job-description">Job Description *</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="mt-2"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={startInterview}
              disabled={!jobTitle.trim() || !jobDescription.trim() || !language || isInterviewActive}
              variant="professional"
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              {usedInterviews >= interviewCredits ? "Comprar créditos" : "Start AI Interview"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setJobTitle('');
                setJobDescription('');
              }}
              disabled={isInterviewActive}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Removed Interview in Progress - now handled by LaPieza URL */}

      {/* Interview History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Interview History
          </CardTitle>
          <CardDescription>
            Review your past interviews and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{interview.jobTitle}</h3>
                    <p className="text-sm text-muted-foreground">{interview.company}</p>
                  </div>
                  <Badge variant={getScoreBadge(interview.score) as any}>
                    {interview.score}/100
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{interview.duration}</span>
                  </div>
                  <span>{new Date(interview.date).toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-success mb-2">Feedback</h4>
                  <div className="text-sm whitespace-pre-line p-3 bg-accent rounded-lg">
                    {interview.feedback}
                  </div>
                </div>
                  
                  <div>
                    <h4 className="font-medium text-warning mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {interview.improvements.map((item, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {interview.betterAnswers && (
                  <div className="mt-4">
                    <h4 className="font-medium text-primary mb-2">Ejemplos de mejores respuestas</h4>
                    <div className="space-y-2">
                      {interview.betterAnswers.map((answer, index) => (
                        <div key={index} className="text-sm p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                          {answer}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t flex gap-2">
                  {interview.recordingUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={interview.recordingUrl} target="_blank" rel="noopener noreferrer">
                        🎧 Escuchar grabación
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Ver reporte completo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <InterviewCredits
        isOpen={showCreditsDialog}
        onClose={() => setShowCreditsDialog(false)}
        onPurchase={handlePurchaseCredits}
      />

      {/* Email Notification Dialog */}
      <Dialog open={showEmailNotification} onOpenChange={setShowEmailNotification}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Entrevista AI en camino
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>¡Perfecto!</strong> En los próximos minutos recibirás un link por correo electrónico con tu entrevista AI personalizada.
              </p>
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📧 Revisa tu bandeja de entrada y carpeta de spam<br />
                  ⏰ La entrevista estará lista en 2-5 minutos<br />
                  📊 El feedback aparecerá aquí después de completarla
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowEmailNotification(false)}
                className="flex-1"
              >
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}