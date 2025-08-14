import {
  Settings,
  User,
  Lock,
  CreditCard,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";

export function GeneralSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    linkedin_url: "",
    skills: "",
    experience: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Cargar datos del perfil desde Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar el perfil",
            variant: "destructive",
          });
        } else if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            location: profileData.location || "",
            bio: profileData.bio || "",
            linkedin_url:
              ((profileData as Record<string, unknown>)
                .linkedin_url as string) || "",
            skills:
              ((profileData as Record<string, unknown>).skills as string) || "",
            experience:
              ((profileData as Record<string, unknown>).experience as string) ||
              "",
          });
        }
      } catch (error) {
        console.error("Error in loadProfile:", error);
        toast({
          title: "Error",
          description: "Error al cargar el perfil",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          linkedin_url: profile.linkedin_url,
          skills: profile.skills,
          experience: profile.experience,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Enviar email para cambio de contraseña
  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No se encontró el email del usuario",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setPasswordResetSent(true);
      toast({
        title: "Email enviado",
        description: "Se ha enviado un email para cambiar tu contraseña",
      });
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email de cambio de contraseña",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cambiar contraseña directamente (si el usuario conoce la actual)
  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      // Primero verificar la contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "La contraseña actual es incorrecta",
          variant: "destructive",
        });
        return;
      }

      // Cambiar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha actualizado correctamente",
      });

      // Limpiar el formulario
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Configuración General</h2>
          <p className="text-muted-foreground">
            Gestiona tu perfil, notificaciones y configuración de privacidad
          </p>
        </div>
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración General</h2>
        <p className="text-muted-foreground">
          Gestiona tu perfil, notificaciones y configuración de privacidad
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Información del Perfil
          </CardTitle>
          <CardDescription>
            Actualiza tu información personal y profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar desde aquí
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+52 55 1234 5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                placeholder="Ciudad, País"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={profile.linkedin_url}
                onChange={(e) =>
                  setProfile({ ...profile, linkedin_url: e.target.value })
                }
                placeholder="https://linkedin.com/in/tu-perfil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Habilidades</Label>
              <Input
                id="skills"
                value={profile.skills}
                onChange={(e) =>
                  setProfile({ ...profile, skills: e.target.value })
                }
                placeholder="React, TypeScript, Node.js..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía Profesional</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Cuéntanos sobre tu experiencia y objetivos profesionales..."
              rows={3}
            />
          </div>

          <div className="space-y-2 hidden">
            <Label htmlFor="experience">Experiencia</Label>
            <Textarea
              id="experience"
              value={profile.experience}
              onChange={(e) =>
                setProfile({ ...profile, experience: e.target.value })
              }
              placeholder="Describe tu experiencia laboral y logros principales..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Gestión de Contraseña
          </CardTitle>
          <CardDescription>
            Cambia tu contraseña o solicita un enlace de restablecimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordResetSent ? (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Email enviado correctamente</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Revisa tu bandeja de entrada y sigue las instrucciones para
                cambiar tu contraseña.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPasswordResetSent(false)}
                className="mt-2"
              >
                Enviar otro email
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repite la nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isChangingPassword ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                  className="flex-1"
                >
                  {isChangingPassword ? (
                    <>
                      <LoadingSpinner />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handlePasswordReset}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email de Restablecimiento
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="shadow-card hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Gestión de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Gestionar Suscripción
            </Button>

            <Button variant="outline" className="w-full">
              <User className="w-4 h-4 mr-2" />
              Exportar Datos
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-destructive">Zona de Peligro</h4>
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-2">
                <p className="font-medium">Eliminar Cuenta</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. Se eliminarán
                  permanentemente todos tus datos.
                </p>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
