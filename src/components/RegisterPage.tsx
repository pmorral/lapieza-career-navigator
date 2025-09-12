import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  MessageCircle,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState("");
  const [formError, setFormError] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de donde vino el usuario para redirigir después del registro
  const from = location.state?.from?.pathname || "/dashboard";

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        existingUserEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo enviar el email de recuperación",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado",
          description:
            "Revisa tu bandeja de entrada para restablecer tu contraseña",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  };

  const handleBackToRegister = () => {
    setUserExists(false);
    setExistingUserEmail("");
    setFormError("");
    setEmail("");
    setName("");
    setWhatsapp("");
    setPassword("");
    setConfirmPassword("");
    setAcceptTerms(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive",
        });
        return;
      }

      if (!acceptTerms) {
        toast({
          title: "Error",
          description: "Debes aceptar los términos y condiciones",
          variant: "destructive",
        });
        return;
      }

      // Crear el usuario sin verificación por email usando función admin-signup
      const { data, error } = await supabase.functions.invoke("admin-signup", {
        body: {
          email,
          password,
          full_name: name,
          whatsapp: whatsapp,
        },
      });

      // Verificar si el usuario ya existe (ahora viene en data con status 200)
      if (data?.user_exists) {
        setExistingUserEmail(email);
        setUserExists(true);
        return;
      }

      // Verificar si hay errores o si no fue exitoso
      if (error || !data?.success) {
        // Verificar si el error es porque el usuario ya existe
        const errorMessage = (
          data?.error ||
          error?.message ||
          ""
        ).toLowerCase();
        const errorCode = data?.code || "";

        if (
          errorMessage.includes("already registered") ||
          errorMessage.includes("user already registered") ||
          errorMessage.includes("already exists") ||
          errorMessage.includes("duplicate key") ||
          errorMessage.includes(
            "a user with this email address has already been registered"
          ) ||
          errorCode === "USER_ALREADY_EXISTS"
        ) {
          setExistingUserEmail(email);
          setUserExists(true);
          return;
        }

        // Mostrar error más intuitivo en lugar de solo toast
        setFormError(
          data?.error || error?.message || "No se pudo crear la cuenta"
        );
        setLoading(false);
        return;
      } else {
        // Iniciar sesión automáticamente y redirigir a /payment
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast({
            title: "Error al iniciar sesión",
            description: signInError.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "¡Cuenta creada!",
          description: "Completa tu membresía para activar tu acceso",
        });

        // Forzar recarga para que AuthProvider detecte la nueva sesión
        window.location.href = "/payment";
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

  // Mostrar loader de autenticación
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/38bdff76-1a8c-4d71-a975-9058214f7ab1.png"
              alt="Academy by LaPieza"
              className="h-16"
            />
          </div>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Creando cuenta...</h3>
                  <p className="text-sm text-muted-foreground">
                    Preparando tu acceso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de usuario existente
  if (userExists) {
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
              Ya tienes una cuenta en Academy by LaPieza
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">
                ¡Ya tienes cuenta!
              </CardTitle>
              <CardDescription className="text-center">
                El correo <strong>{existingUserEmail}</strong> ya está
                registrado en nuestra plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Tu cuenta está lista
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Solo necesitas iniciar sesión para acceder a tu dashboard
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full"
                    variant="professional"
                    size="lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      ¿No recuerdas tu contraseña?
                    </p>
                    <Button
                      onClick={handleResetPassword}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar email de recuperación
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleBackToRegister}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Intentar con otro email
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver al inicio
            </button>
          </div>
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
            Crea tu cuenta y comienza tu transformación profesional
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
            <CardDescription className="text-center">
              Completa tus datos para crear tu cuenta en Academy by LaPieza
            </CardDescription>

            {formError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error al crear cuenta
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {formError}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => setFormError("")}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    className="pl-10"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked: boolean | "indeterminate") => {
                      if (checked === true || checked === false) {
                        setAcceptTerms(checked);
                      }
                    }}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Acepto los{" "}
                    <a
                      href="/terms-conditions"
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      términos y condiciones
                    </a>
                  </Label>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(
                    "https://wa.me/+523337872943?text=Hola%20equipo%20de%20Academy%2C%20tengo%20dudas%20sobre%20mi%20registro%20y%20membres%C3%ADa",
                    "_blank"
                  )
                }
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Habla con un asesor por WhatsApp
              </Button>

              <Button
                type="submit"
                className="w-full"
                variant="professional"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta?</span>{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión aquí
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver al inicio
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <a href="/terms-conditions" className="text-primary hover:underline">
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
