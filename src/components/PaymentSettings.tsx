import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Trash2, CheckCircle, Calendar, Lock } from "lucide-react";
import { toast } from "sonner";

export const PaymentSettings = () => {
  const [cards, setCards] = useState([
    {
      id: "1",
      last4: "4242",
      brand: "Visa",
      expMonth: 12,
      expYear: 2026,
      isDefault: true
    },
    {
      id: "2", 
      last4: "1234",
      brand: "Mastercard",
      expMonth: 8,
      expYear: 2025,
      isDefault: false
    }
  ]);

  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate adding card
    toast.success("Tarjeta agregada exitosamente");
    setIsAddingCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId));
    toast.success("Tarjeta eliminada");
  };

  const handleSetDefault = (cardId: string) => {
    setCards(cards.map(card => ({ 
      ...card, 
      isDefault: card.id === cardId 
    })));
    toast.success("Tarjeta predeterminada actualizada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Métodos de pago</h2>
        <p className="text-muted-foreground">
          Gestiona tus tarjetas de crédito y débito para servicios adicionales
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Suscripción activa
          </CardTitle>
          <CardDescription>
            Tu plan actual y próximo cobro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-lg">Plan Premium</div>
              <div className="text-sm text-muted-foreground">
                Próximo cobro: 15 de Febrero, 2024
              </div>
              <div className="text-sm text-muted-foreground">
                $49 USD/mes
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Activa
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Saved Cards */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tarjetas guardadas</CardTitle>
              <CardDescription>
                Administra tus métodos de pago para servicios adicionales
              </CardDescription>
            </div>
            <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar tarjeta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar nueva tarjeta</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos de tu tarjeta de forma segura
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newCardNumber">Número de tarjeta</Label>
                    <Input 
                      id="newCardNumber" 
                      placeholder="1234 1234 1234 1234" 
                      maxLength={19}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newExpiry">Fecha de vencimiento</Label>
                      <Input id="newExpiry" placeholder="MM/AA" maxLength={5} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newCvc">CVC</Label>
                      <Input id="newCvc" placeholder="123" maxLength={4} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newName">Nombre en la tarjeta</Label>
                    <Input id="newName" placeholder="Nombre completo" required />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    Tus datos están protegidos con encriptación SSL
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Agregar tarjeta
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddingCard(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {card.brand} •••• {card.last4}
                      {card.isDefault && (
                        <Badge variant="secondary" className="ml-2">
                          Predeterminada
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Vence {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!card.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetDefault(card.id)}
                    >
                      Hacer predeterminada
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de facturación</CardTitle>
          <CardDescription>
            Revisa tus pagos y descargas facturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "15 Ene 2024", amount: "$49.00", status: "Pagado", invoice: "INV-001" },
              { date: "15 Dic 2023", amount: "$49.00", status: "Pagado", invoice: "INV-002" },
              { date: "05 Dic 2023", amount: "$35.00", status: "Pagado", invoice: "INV-003", description: "Entrevista con Career Coach" },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{payment.amount} USD</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.date} • {payment.description || "Suscripción mensual"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {payment.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Descargar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};