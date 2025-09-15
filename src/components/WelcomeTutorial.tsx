import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, MessageSquare, BookOpen, Trophy, ArrowRight, ArrowLeft } from "lucide-react";

interface WelcomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeTutorial = ({ isOpen, onClose }: WelcomeTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "¡Bienvenido/a al Programa de Empleabilidad 360°!",
      subtitle: "Academy by LaPieza",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              ¡Felicidades por dar el primer paso hacia tu transformación profesional!
            </p>
            <p className="text-base text-muted-foreground">
              Estás a punto de embarcarte en un viaje que cambiará tu carrera para siempre. 
              Nuestro programa 360° está diseñado para potenciar todas las áreas de tu empleabilidad.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Conoce a tu Career Coach",
      subtitle: "Tu guía personalizada hacia el éxito",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              ¡Un Career Coach especializado te acompañará en todo tu proceso!
            </p>
            <p className="text-base text-muted-foreground">
              Envíanos un mensaje ahora mismo para conocer a tu Career Coach asignado y 
              recibir tu plan de acción personalizado.
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.open('https://wa.me/+17864214777', '_blank')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Conocer mi Career Coach
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Explora el E-Learning y las Herramientas",
      subtitle: "Todo lo que necesitas en un solo lugar",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Comienza tu aprendizaje ahora mismo
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Card className="p-4 space-y-2">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                <p className="font-medium">E-Learning Hub</p>
                <p className="text-muted-foreground">Cursos especializados</p>
              </Card>
              <Card className="p-4 space-y-2">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                <p className="font-medium">CV Boost</p>
                <p className="text-muted-foreground">Optimiza tu CV</p>
              </Card>
              <Card className="p-4 space-y-2">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                <p className="font-medium">LinkedIn Optimizer</p>
                <p className="text-muted-foreground">Perfil profesional</p>
              </Card>
              <Card className="p-4 space-y-2">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                <p className="font-medium">Mock Interviews</p>
                <p className="text-muted-foreground">Practica entrevistas</p>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "¡Tu éxito comienza ahora!",
      subtitle: "Estamos aquí para apoyarte en cada paso",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="space-y-4">
            <p className="text-xl font-semibold text-primary">
              ¡Felicitaciones por invertir en tu futuro profesional!
            </p>
            <p className="text-lg text-muted-foreground">
              Tienes todo lo necesario para alcanzar tus objetivos profesionales.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 p-4 rounded-lg">
              <p className="text-base font-medium text-primary">
                "El éxito no es casualidad. Es trabajo duro, perseverancia, aprendizaje, 
                estudio, sacrificio y, sobre todo, amor por lo que haces."
              </p>
            </div>
            <p className="text-base text-muted-foreground">
              ¡Comienza tu transformación profesional ahora mismo!
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Marcar tutorial como completado en localStorage
      localStorage.setItem('welcomeTutorialCompleted', 'true');
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    localStorage.setItem('welcomeTutorialCompleted', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">Tutorial de Bienvenida</DialogTitle>
        
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={skipTutorial}
            className="text-muted-foreground hover:text-foreground"
          >
            Saltar tutorial
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              {steps[currentStep].title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <div className="min-h-[400px] flex items-center justify-center">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} de {steps.length}
          </span>

          <Button
            onClick={nextStep}
            className="flex items-center bg-primary hover:bg-primary/90"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ¡Comenzar!
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};