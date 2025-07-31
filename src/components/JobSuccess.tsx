import { useState } from "react";
import { Trophy, Star, Heart, ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JobSuccessProps {
  onClose: () => void;
}

export function JobSuccess({ onClose }: JobSuccessProps) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    salary: "",
    startDate: "",
    testimonial: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la información del éxito laboral
    console.log("Job success data:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-primary">
            ¡Felicidades por tu Nuevo Empleo! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Nos alegra saber que has conseguido trabajo. Comparte tu éxito con nosotros.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm">
              Tu éxito es nuestro éxito. Gracias por confiar en Academy by LaPieza para impulsar tu carrera profesional.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  placeholder="Nombre de la empresa"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Puesto *</Label>
                <Input
                  id="position"
                  placeholder="Título del puesto"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salario (opcional)</Label>
                <Input
                  id="salary"
                  placeholder="Ej: $50,000 USD"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial">Testimonial (opcional)</Label>
              <Textarea
                id="testimonial"
                placeholder="Comparte tu experiencia con Academy by LaPieza y cómo te ayudó a conseguir este empleo..."
                value={formData.testimonial}
                onChange={(e) => setFormData({...formData, testimonial: e.target.value})}
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1">
                <Star className="w-4 h-4 mr-2" />
                Compartir mi Éxito
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Tu historia puede inspirar a otros profesionales en su búsqueda laboral. 
              Gracias por ser parte de nuestra comunidad de éxito.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}