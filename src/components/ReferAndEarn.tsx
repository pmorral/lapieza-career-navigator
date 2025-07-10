import { Gift, Share2, DollarSign, Users, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ReferAndEarn() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://academy.lapieza.com/ref/tu-codigo-unico";
  const referralCode = "ACADEMY2024";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    totalReferrals: 12,
    successfulReferrals: 8,
    pendingReferrals: 4,
    totalEarnings: 400,
    pendingEarnings: 200
  };

  const recentReferrals = [
    { name: "Ana García", status: "paid", date: "2024-03-10", amount: 50 },
    { name: "Carlos López", status: "paid", date: "2024-03-08", amount: 50 },
    { name: "María Rodríguez", status: "pending", date: "2024-03-15", amount: 50 },
    { name: "Juan Pérez", status: "pending", date: "2024-03-12", amount: 50 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Refiere y Gana</h2>
        <p className="text-muted-foreground">Gana $50 USD por cada persona que se suscriba a través de tu enlace</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">+3 este mes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.successfulReferrals}</div>
            <p className="text-xs text-muted-foreground">{Math.round((stats.successfulReferrals / stats.totalReferrals) * 100)}% tasa de conversión</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">USD ganados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${stats.pendingEarnings}</div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Tu Enlace de Referido
          </CardTitle>
          <CardDescription>
            Comparte este enlace para que tus referidos se registren en Academy by LaPieza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enlace de Invitación</label>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="flex-1" />
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Código de Referido</label>
            <div className="flex gap-2">
              <Input value={referralCode} readOnly className="flex-1" />
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(referralCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-4">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            ¿Cómo Funciona?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium">Comparte tu enlace</h4>
                <p className="text-sm text-muted-foreground">Envía tu enlace único a amigos, familiares o contactos profesionales</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium">Se registran y pagan</h4>
                <p className="text-sm text-muted-foreground">Tu referido se registra usando tu enlace y completa el pago de su suscripción</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium">¡Ganas $50 USD!</h4>
                <p className="text-sm text-muted-foreground">Recibe tu comisión directamente en tu cuenta en un plazo de 7 días hábiles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Referidos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReferrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{referral.name}</p>
                  <p className="text-sm text-muted-foreground">Referido el {new Date(referral.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${referral.amount} USD</p>
                  <Badge 
                    variant={referral.status === 'paid' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {referral.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Earnings Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Resumen de Ganancias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Disponibles</p>
                <p className="text-2xl font-bold text-success">${stats.totalEarnings} USD</p>
              </div>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Solicitar Retiro
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-warning/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Pendientes</p>
                <p className="text-xl font-bold text-warning">${stats.pendingEarnings} USD</p>
              </div>
              <p className="text-xs text-muted-foreground">Disponibles en 3-7 días</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}