import { Settings, User, Bell, Lock, CreditCard, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function GeneralSettings() {
  const [profile, setProfile] = useState({
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+52 55 1234 5678",
    location: "Ciudad de México, México",
    bio: "Desarrollador Full Stack con 5 años de experiencia"
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    jobAlerts: true,
    coachMessages: true,
    weeklyReports: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    shareProgress: false,
    allowCoachContact: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración General</h2>
        <p className="text-muted-foreground">Gestiona tu perfil, notificaciones y configuración de privacidad</p>
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
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía Profesional</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Cuéntanos sobre tu experiencia y objetivos profesionales..."
              rows={3}
            />
          </div>
          
          <Button className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Controla qué notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Actualizaciones por Email</p>
              <p className="text-sm text-muted-foreground">Recibe noticias y actualizaciones de la plataforma</p>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) => setNotifications({...notifications, emailUpdates: checked})}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Vacantes</p>
              <p className="text-sm text-muted-foreground">Notificaciones sobre nuevas oportunidades laborales</p>
            </div>
            <Switch
              checked={notifications.jobAlerts}
              onCheckedChange={(checked) => setNotifications({...notifications, jobAlerts: checked})}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensajes del Career Coach</p>
              <p className="text-sm text-muted-foreground">Notificaciones de mensajes de tu career coach</p>
            </div>
            <Switch
              checked={notifications.coachMessages}
              onCheckedChange={(checked) => setNotifications({...notifications, coachMessages: checked})}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reportes Semanales</p>
              <p className="text-sm text-muted-foreground">Resumen semanal de tu progreso</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Privacidad y Seguridad
          </CardTitle>
          <CardDescription>
            Controla la visibilidad de tu información
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Visibilidad del Perfil</Label>
            <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privado</SelectItem>
                <SelectItem value="coaches">Solo Career Coaches</SelectItem>
                <SelectItem value="public">Público</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Controla quién puede ver tu perfil completo</p>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compartir Progreso</p>
              <p className="text-sm text-muted-foreground">Permitir que otros usuarios vean tu progreso</p>
            </div>
            <Switch
              checked={privacy.shareProgress}
              onCheckedChange={(checked) => setPrivacy({...privacy, shareProgress: checked})}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Contacto de Career Coaches</p>
              <p className="text-sm text-muted-foreground">Permitir que career coaches te contacten directamente</p>
            </div>
            <Switch
              checked={privacy.allowCoachContact}
              onCheckedChange={(checked) => setPrivacy({...privacy, allowCoachContact: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Gestión de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Cambiar Contraseña
            </Button>
            
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Gestionar Suscripción
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium text-destructive">Zona de Peligro</h4>
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-2">
                <p className="font-medium">Eliminar Cuenta</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos.
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

      {/* Support */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Soporte y Ayuda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline">
              Centro de Ayuda
            </Button>
            <Button variant="outline">
              Contactar Soporte
            </Button>
            <Button variant="outline">
              Reportar Problema
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}