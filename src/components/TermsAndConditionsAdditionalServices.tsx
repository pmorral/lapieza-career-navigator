import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  Users,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function TermsAndConditionsAdditionalServices() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header público */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/01b87ef7-8706-4ed0-a34b-a79798c17337.png"
              alt="Academy by LaPieza"
              className="h-8"
            />
            <span className="font-semibold text-lg">Academy by LaPieza</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Términos y Condiciones - Servicios Adicionales
            </h1>
            <p className="text-lg text-muted-foreground">
              Información importante sobre nuestros servicios de sesiones
              personalizadas
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-6 h-6 text-primary" />
                Términos y Condiciones de Servicios Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tiempo de respuesta */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Confirmación de Sesión
                  </h3>
                  <p className="text-blue-700">
                    Una vez que solicites una sesión, nos pondremos en contacto
                    contigo en un plazo de <strong>24 a 48 horas</strong> para
                    confirmarla.
                  </p>
                </div>
              </div>

              {/* Preparación */}
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    Preparación para la Sesión
                  </h3>
                  <p className="text-green-700">
                    Es importante que llegues con tus{" "}
                    <strong>dudas y objetivos claros</strong>, para aprovechar
                    al máximo la sesión.
                  </p>
                </div>
              </div>

              {/* Tolerancia de tiempo */}
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800 mb-2">
                    Puntualidad y Tolerancia
                  </h3>
                  <p className="text-orange-700">
                    El día de la cita, la sala virtual permanecerá abierta
                    durante <strong>10 minutos de tolerancia</strong>. Si no
                    ingresas en ese tiempo, la sesión se dará por{" "}
                    <strong>
                      cancelada sin derecho a reembolso ni reprogramación
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Servicios personales */}
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Características del Servicio
                  </h3>
                  <p className="text-purple-700">
                    Los servicios son{" "}
                    <strong>personales e intransferibles</strong>.
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Información Importante
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    • Estos términos aplican a todos los servicios adicionales
                    contratados fuera del plan base.
                  </p>
                  <p>
                    • Las sesiones se realizan a través de plataformas virtuales
                    seguras.
                  </p>
                  <p>
                    • Cualquier cambio en la programación debe ser comunicado
                    con al menos 24 horas de anticipación.
                  </p>
                  <p>
                    • Los pagos se procesan al momento de la confirmación de la
                    sesión.
                  </p>
                </div>
              </div>

              {/* Contacto */}
              <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-primary mb-2">
                  ¿Tienes dudas sobre estos términos?
                </h3>
                <p className="text-primary/80">
                  Contáctanos a través de nuestro equipo de soporte para aclarar
                  cualquier inquietud.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
