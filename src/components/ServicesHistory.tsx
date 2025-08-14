import { useState } from "react";
import { Calendar, Clock, DollarSign, CheckCircle, AlertCircle, Clock as ClockIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServices, UserService } from "@/hooks/use-services";
import { LoadingSpinner } from "./LoadingSpinner";

export function ServicesHistory() {
  const { services, loading, error, refreshServices } = useServices();
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Convertir de centavos a dólares
  };

  const getStatusBadge = (service: UserService) => {
    const now = new Date();
    const expiresAt = new Date(service.expires_at);
    const isExpired = now > expiresAt;

    if (service.status === "completed") {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>;
    } else if (service.status === "scheduled") {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Programado</Badge>;
    } else if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    } else {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Activo</Badge>;
    }
  };

  const getStatusIcon = (service: UserService) => {
    const now = new Date();
    const expiresAt = new Date(service.expires_at);
    const isExpired = now > expiresAt;

    if (service.status === "completed") {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (isExpired) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <ClockIcon className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button onClick={refreshServices} variant="outline" className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No tienes servicios adicionales comprados</p>
            <p className="text-sm text-gray-400 mt-1">
              Los servicios que compres aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial de Servicios</h3>
        <Button onClick={refreshServices} variant="outline" size="sm">
          Actualizar
        </Button>
      </div>

      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(service)}
                  {service.service_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatPrice(service.amount_paid, service.currency)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(service.purchased_at)}
                  </span>
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(service)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedService(
                    expandedService === service.id ? null : service.id
                  )}
                >
                  {expandedService === service.id ? "Ocultar" : "Ver detalles"}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedService === service.id && (
            <CardContent className="pt-0">
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID de Sesión:</span>
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {service.stripe_session_id}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span>
                    <p className="text-muted-foreground">{service.status}</p>
                  </div>
                  <div>
                    <span className="font-medium">Comprado:</span>
                    <p className="text-muted-foreground">
                      {formatDate(service.purchased_at)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Expira:</span>
                    <p className="text-muted-foreground">
                      {formatDate(service.expires_at)}
                    </p>
                  </div>
                </div>

                {service.scheduled_at && (
                  <div>
                    <span className="font-medium text-sm">Programado para:</span>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(service.scheduled_at)}
                    </p>
                  </div>
                )}

                {service.completed_at && (
                  <div>
                    <span className="font-medium text-sm">Completado:</span>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(service.completed_at)}
                    </p>
                  </div>
                )}

                {Object.keys(service.metadata).length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Información adicional:</span>
                    <pre className="text-xs text-muted-foreground bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(service.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
