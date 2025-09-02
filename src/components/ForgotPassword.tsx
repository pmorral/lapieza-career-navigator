import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/lovable-uploads/38bdff76-1a8c-4d71-a975-9058214f7ab1.png"
                alt="Academy by LaPieza"
                className="h-16"
              />
            </div>
          </div>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-800">
                    ¡Email Enviado!
                  </h2>
                  <p className="text-green-700 mt-2">
                    Hemos enviado un enlace para resetear tu contraseña a{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Revisa tu bandeja de entrada y tu carpeta de spam.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button onClick={() => navigate("/login")} className="w-full">
                    Volver al Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Enviar a otro email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/38bdff76-1a8c-4d71-a975-9058214f7ab1.png"
              alt="Academy by LaPieza"
              className="h-16"
            />
          </div>
          <p className="text-muted-foreground">
            Resetea tu contraseña de forma segura
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tu correo electrónico y te enviaremos un enlace para
              resetear tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="professional"
                size="lg"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar enlace de reseteo"}
                {!loading && <Mail className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al login
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <a href="#" className="text-primary hover:underline">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="text-primary hover:underline">
            Política de Privacidad
          </a>
        </div>
      </div>
    </div>
  );
}
