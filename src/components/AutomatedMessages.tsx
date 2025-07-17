import { useState } from "react";
import { Send, MessageSquare, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function AutomatedMessages() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  const templates = [
    {
      id: "networking",
      title: "Networking",
      description: "Mensajes para establecer conexiones profesionales",
      icon: Users,
      examples: [
        "Hola [Nombre], me gustaría conectar contigo para expandir mi red profesional en [Industria].",
        "Vi tu perfil y me interesa mucho tu experiencia en [Área]. ¿Podríamos conectar?",
        "Hola [Nombre], estoy explorando oportunidades en [Empresa/Industria] y me encantaría conocer tu perspectiva."
      ]
    },
    {
      id: "follow-up",
      title: "Seguimiento de procesos",
      description: "Mensajes para dar seguimiento a aplicaciones y entrevistas",
      icon: MessageSquare,
      examples: [
        "Estimado/a [Nombre], espero se encuentre bien. Quería dar seguimiento a mi aplicación para la posición de [Puesto].",
        "Hola [Nombre], muchas gracias por la entrevista del [Fecha]. Quedo a la espera de los siguientes pasos.",
        "Buenos días [Nombre], ¿hay alguna actualización sobre el proceso de selección para [Puesto]?"
      ]
    },
    {
      id: "emails",
      title: "Correos profesionales",
      description: "Templates para correos formales y de negocios",
      icon: Mail,
      examples: [
        "Asunto: Aplicación para la posición de [Puesto] - [Tu nombre]",
        "Asunto: Seguimiento - Entrevista [Puesto] - [Fecha]",
        "Asunto: Agradecimiento por la oportunidad - [Tu nombre]"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mensajes Automatizados</h2>
        <p className="text-muted-foreground">
          Templates y ejemplos para facilitar tu comunicación profesional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all shadow-card hover:shadow-lg ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <template.icon className="w-5 h-5 text-primary" />
                {template.title}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {template.examples.length} templates
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>
              {templates.find(t => t.id === selectedTemplate)?.title} Templates
            </CardTitle>
            <CardDescription>
              Personaliza estos mensajes según tu situación específica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates
              .find(t => t.id === selectedTemplate)
              ?.examples.map((example, index) => (
                <div key={index} className="p-4 bg-accent rounded-lg">
                  <p className="text-sm">{example}</p>
                  <Button
                    onClick={() => setCustomMessage(example)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Usar template
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Personalizar mensaje</CardTitle>
          <CardDescription>
            Edita el template seleccionado o crea tu propio mensaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escribe o personaliza tu mensaje aquí..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={6}
          />
          <div className="flex gap-2">
            <Button className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Copiar mensaje
            </Button>
            <Button variant="outline" onClick={() => setCustomMessage("")}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}