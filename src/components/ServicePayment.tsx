import { useState } from "react";
import { ArrowLeft, CreditCard, Check, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ServicePaymentProps {
  service: {
    id: string;
    title: string;
    price: string | number;
    duration?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ServicePayment({ service, isOpen, onClose }: ServicePaymentProps) {
  const [step, setStep] = useState<'payment' | 'terms'>('payment');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    country: ''
  });

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setStep('terms');
    }, 1000);
  };

  const handleClose = () => {
    setStep('payment');
    setPaymentData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      email: '',
      country: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'payment' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Pago del Servicio
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Service Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  {service.duration && (
                    <CardDescription>{service.duration}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {typeof service.price === 'number' ? `$${service.price}` : service.price} USD
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select value={paymentData.country} onValueChange={(value) => setPaymentData({...paymentData, country: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MX">México</SelectItem>
                        <SelectItem value="US">Estados Unidos</SelectItem>
                        <SelectItem value="CO">Colombia</SelectItem>
                        <SelectItem value="AR">Argentina</SelectItem>
                        <SelectItem value="PE">Perú</SelectItem>
                        <SelectItem value="CL">Chile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                  <Input
                    id="cardName"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                    placeholder="Nombre Apellido"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de tarjeta</Label>
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                    <Input
                      id="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                      placeholder="MM/AA"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handlePayment} className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Procesar Pago
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Pago Exitoso
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Success Message */}
              <Card className="border-success/20 bg-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <p className="font-medium">¡Pago procesado correctamente!</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El equipo de Academy by LaPieza se pondrá en contacto contigo en un plazo no mayor a 24 horas hábiles después de tu pago, para agendar tu sesión y coordinar los detalles. Revisa tu correo electrónico (incluyendo la bandeja de spam) y/o WhatsApp para asegurar una comunicación oportuna.
                  </p>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Términos y Condiciones de la Asesoría</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">1. Agenda y vigencia</h4>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>• Una vez realizado el pago, tendrás hasta 15 días naturales para agendar tu sesión.</li>
                      <li>• La agenda está sujeta a disponibilidad. Te recomendamos elegir tu fecha lo antes posible para asegurar el espacio.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Política de cambios y cancelaciones</h4>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>• Puedes reprogramar tu sesión con al menos 24 horas de anticipación</li>
                      <li>• En caso de no asistir sin previo aviso, la sesión se considerará como tomada y no habrá reembolso ni reprogramación.</li>
                      <li>• Si llegas más de 15 minutos tarde, se descontará ese tiempo de la duración total de la sesión.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">4. Reembolsos</h4>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>• No se realizan reembolsos una vez efectuado el pago.</li>
                      <li>• En caso de fuerza mayor, podrás solicitar una reprogramación excepcional, la cual será evaluada caso por caso.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">5. Uso de la información</h4>
                    <p className="text-muted-foreground">
                      Toda la información compartida durante la sesión es confidencial y será utilizada únicamente con fines de orientación profesional.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">6. Preparación previa del usuario</h4>
                    <p className="text-muted-foreground">
                      Es responsabilidad del usuario asistir a la sesión con dudas, preguntas o temas específicos que desee trabajar, a fin de aprovechar al máximo el tiempo disponible.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">7. Limitación de responsabilidad</h4>
                    <p className="text-muted-foreground">
                      La asesoría tiene fines informativos y de acompañamiento. No garantiza ofertas laborales, entrevistas reales ni contrataciones. El resultado dependerá de tu proceso, contexto y acciones posteriores.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleClose} className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Entendido
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}