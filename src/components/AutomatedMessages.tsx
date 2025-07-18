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
      description: "Mensajes para hacer networking profesional",
      icon: Users,
      examples: [
        "Hola (Nombre del Perfil),\nHe solicitado el puesto de (nombre de la vacante) en (compañía) y estoy muy interesado en aportar a su equipo. ¿Podríamos coordinar una breve charla para explorar cómo puedo contribuir?\nSaludos,\n[Tu Nombre]",
        "Hola [Nombre], me gustaría conectar contigo para expandir mi red profesional en [Industria].",
        "Hola [Nombre], estoy explorando oportunidades en [Empresa/Industria] y me encantaría conocer tu perspectiva."
      ]
    },
    {
      id: "follow-up",
      title: "Seguimiento de Procesos",
      description: "Mensajes para dar seguimiento a aplicaciones",
      icon: MessageSquare,
      examples: [
        "Buen día [Nombre], espero te encuentres bien. Quería dar seguimiento a mi aplicación para la posición de [Puesto]. Estoy interesado en conocer los siguientes pasos."
      ]
    },
    {
      id: "emails",
      title: "Correos Profesionales",
      description: "Templates para correos formales y seguimiento",
      icon: Mail,
      examples: [
        "Asunto: Aplicación para la posición de [Puesto] - [Tu nombre]\n\nHola (nombre del reclutador), soy (nombre y perfil profesional), te contacto porque he visto la vacante de (nombre de la vacante) en (página de careers, LinkedIn, OCC, bolsas de trabajo, correo, etc.).\n\nEstoy sumamente interesado en esta oferta de trabajo, ya que he seguido de cerca el crecimiento de (nombre de la empresa/organización) como (mencionar algunos proyectos, cultura laboral, etc.,) y me encantaría formar parte del equipo.\n\nA lo largo de mi carrera, he desarrollado habilidades en (mencionar habilidades relevantes para la posición), además, mi experiencia en (mencionar experiencia relevante y logros, si es cuantificable, mejor) me ha permitido enfrentar desafíos y trabajar eficazmente en entornos dinámicos.\n\nAdjunto mi CV y (portafolio dependerá del perfil) para tu/su consideración, ya que me encantaría ser parte del proceso de selección para la vacante.\nAgradezco la oportunidad de considerar mi candidatura para esta posición. Estoy disponible para programar una entrevista y hablar sobre mi experiencia y habilidades.\n\nExcelente día.\nSaludos.\n\nNombre\nPerfil profesional\nContacto",
        "Asunto: Seguimiento - Entrevista [Puesto] - [Fecha]\nNota: Dar seguimiento a entrevista después de 24 hrs\n\nHola [Nombre] ¿Cómo estás? Solo quería agradecerte por tu tiempo ayer. Me gustó mucho poder platicar contigo y conocer más acerca de la vacante.\n\nMe siento muy identificado con lo que están haciendo en [compañía] y los proyectos como [explicar lo que hablaron en la entrevista]. Me emociona la idea de poder formar parte del equipo y ayudarles en su crecimiento.\n\nPor favor, avísame si tienes cualquier duda adicional acerca de mi. Mientras seguiré al pendiente de las noticias del proceso.\nExcelente día.\nSaludos.\n\nNombre"
      ]
    },
    {
      id: "negotiation",
      title: "Negociación",
      description: "Templates para negociar ofertas laborales",
      icon: "💼",
      examples: [
        "Asunto: Revisión de propuesta salarial – [Tu nombre]\n\nHola [Nombre]\n\nMuchas gracias por la oferta, estoy muy emocionado por la oportunidad y realmente me interesa ser parte de (nombre de la compañía).\n\nDespués de revisar la carta oferta, el salario es menos de lo que estoy buscando en mi siguiente posición.\n\nDe acuerdo a mi experiencia y habilidades como (..ajustándolos a la vacante..) estoy entre $XXXX a $XXXX.\n\n¿Hay alguna manera de acercarse al rango? De igual manera, me encuentro abierto a escuchar otros beneficios que pueden ofrecer.\n\nMuchas gracias por la atención.\n\nNombre\nPerfil profesional\nContacto",
        "Asunto: Posible ajuste en términos de la oferta\n\nHola [Nombre]\n\nMuchas gracias por la oferta, estoy muy emocionado por la oportunidad y realmente me interesa ser parte de (nombre de la compañía). Estoy muy entusiasmado con la posibilidad de contribuir al equipo y realmente me interesa la oportunidad de trabajar con ustedes.\n\nQuisiera mencionar que he recibido otra oferta de empleo con un paquete compensatorio más alto. Dada mi experiencia y las habilidades específicas que aporto, especialmente en (mencionar las habilidades relevantes), estaba evaluando ofertas en el rango de $XXXX a $XXXX.\n\n¿Existe la posibilidad de revisar el salario ofrecido o discutir otros beneficios complementarios que podrían hacer que su oferta sea más competitiva? Estoy abierto a explorar diferentes opciones y me gustaría encontrar un acuerdo que beneficie a ambas partes.\n\nAgradezco su consideración y espero que podamos encontrar un término medio que refleje el valor que puedo aportar, además, estoy muy interesando en (compañía) por (hablar sobre el interés con la empresa).\n\nNombre\nPerfil profesional\nContacto"
      ]
    },
    {
      id: "rejection",
      title: "Rechazar Oferta",
      description: "Templates para rechazar ofertas profesionalmente",
      icon: "❌",
      examples: [
        "Asunto: Agradecimiento por la oferta – [Tu nombre]\n\nHola [Nombre],\n\nGracias por la oportunidad de considerarme para el proceso de (vacante) en (empresa).\n\nDisfruté aprendiendo más sobre el rol, y la cultura de la organización.\n\nDespués de una cuidadosa consideración, he llegado a una decisión difícil. Desafortunadamente, tengo que rechazar esta oportunidad en este momento debido a que tengo otros objetivos profesionales que me gustaría enfocarme. (opcional agregar los objetivos profesionales).\n\nAgradezco sinceramente la oferta y quiero expresar mi gratitud por la oportunidad de conocer al equipo, esperando que en el futuro podamos coincidir para colaborar juntos.\n\nLes deseo todo lo mejor para encontrar al candidato adecuado para el puesto.\n\n¡Saludos!\n\nNombre\nPerfil profesional\nContacto",
        "Asunto: Seguimiento sobre propuesta de trabajo\n\nHola [Nombre]\n\nGracias por la oportunidad de considerarme para el proceso de (vacante) en (empresa).\n\nDisfruté aprendiendo más sobre el rol, y la cultura de la organización.\n\nDespués de una cuidadosa consideración, he llegado a una decisión difícil. Desafortunadamente, tengo que rechazar esta oportunidad en este momento debido a que estoy buscando otro tipo de retos profesionales que me permitan crecer como (perfil profesional).\n\nSin embargo, me gustaría referir a estos candidatos que considero hacen buen fit con lo que buscan:\n\n-Nombre, LinkedIn, Contacto\n-Nombre, LinkedIn, Contacto\n\nAgradezco sinceramente la oferta y quiero expresar mi gratitud por la oportunidad de conocer a su equipo. Le deseo todo lo mejor y espero que en un futuro podamos volver a coincidir en otra oportunidad.\n\n¡Saludos!\n\nNombre\nPerfil profesional\nContacto"
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