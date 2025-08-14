import { AlertTriangle, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InactiveAccountProps {
  onReactivate: () => void;
  onBackToLanding: () => void;
}

export function InactiveAccount({ onReactivate, onBackToLanding }: InactiveAccountProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-warning/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/38bdff76-1a8c-4d71-a975-9058214f7ab1.png" 
              alt="Academy by LaPieza" 
              className="h-16"
            />
          </div>
          <div className="mb-4">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-2" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Cuenta Inactiva
          </h1>
          <p className="text-muted-foreground">
            Tu membresía ha expirado. Reactiva tu cuenta para continuar accediendo a todas las herramientas.
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reactiva tu Membresía</CardTitle>
            <CardDescription>
              Continúa transformando tu carrera profesional con Academy by LaPieza
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Plan de 6 meses */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-center mb-2">Academy Premium - 6 Meses</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">$149 USD</div>
                  <div className="text-sm text-muted-foreground">6 meses de acceso completo</div>
                </div>
              </div>
              
              {/* Plan de 12 meses */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-center mb-2">Academy Premium - 12 Meses</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">$199 USD</div>
                  <div className="text-sm text-muted-foreground">12 meses de acceso completo</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Acceso completo a todas las herramientas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Sesiones grupales cada 2 semanas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Templates profesionales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Actualizaciones gratuitas</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={onReactivate}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Reactivar Membresía
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={onBackToLanding}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}