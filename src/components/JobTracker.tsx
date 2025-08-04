import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink, MessageSquare, FileText, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  text: string;
  date: string;
  type: 'interview' | 'general' | 'feedback';
}

interface JobApplication {
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  status: 'applied' | 'first-call' | 'advancing' | 'rejected' | 'accepted';
  dateApplied: string;
  notes: Note[];
}

export function JobTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedApplications = data?.map(app => ({
        id: app.id,
        title: app.title,
        company: app.company,
        platform: app.platform || 'Other',
        url: app.url || '',
        status: app.status as JobApplication['status'],
        dateApplied: app.applied_at || app.created_at.split('T')[0],
        notes: app.notes ? JSON.parse(app.notes as string) : []
      })) || [];

      setApplications(formattedApplications);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las aplicaciones",
        variant: "destructive",
      });
    }
  };

  const [newApplication, setNewApplication] = useState<Partial<JobApplication>>({
    title: '',
    company: '',
    platform: '',
    url: '',
    status: 'applied',
    notes: []
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ text: '', type: 'general' as Note['type'] });

  const statusColumns = [
    { key: 'applied', label: 'Aplicadas', color: 'bg-blue-100 text-blue-800' },
    { key: 'first-call', label: 'Primera llamada', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'advancing', label: 'En Proceso', color: 'bg-purple-100 text-purple-800' },
    { key: 'rejected', label: 'Rechazos', color: 'bg-red-100 text-red-800' },
    { key: 'accepted', label: 'Aceptada', color: 'bg-green-100 text-green-800' }
  ];

  const addApplication = async () => {
    if (newApplication.title && newApplication.company) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('job_applications')
          .insert([{
            user_id: user.id,
            title: newApplication.title!,
            company: newApplication.company!,
            platform: newApplication.platform || 'Other',
            url: newApplication.url || '',
            status: newApplication.status as string || 'applied',
            applied_at: new Date().toISOString().split('T')[0],
            notes: JSON.stringify([])
          }])
          .select()
          .single();

        if (error) throw error;

        await loadApplications();
        
        setNewApplication({
          title: '',
          company: '',
          platform: '',
          url: '',
          status: 'applied',
          notes: []
        });
        setIsDialogOpen(false);

        toast({
          title: "¡Aplicación agregada!",
          description: "Tu aplicación laboral ha sido guardada exitosamente",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo agregar la aplicación",
          variant: "destructive",
        });
      }
    }
  };

  const moveApplication = async (id: string, newStatus: JobApplication['status']) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Estado actualizado",
        description: "El estado de la aplicación ha sido actualizado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.filter(app => app.id !== id));

      toast({
        title: "Aplicación eliminada",
        description: "La aplicación ha sido eliminada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la aplicación",
        variant: "destructive",
      });
    }
  };

  const getApplicationsByStatus = (status: JobApplication['status']) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tablero de Vacantes</h2>
          <p className="text-muted-foreground">Organiza y da seguimiento a todas tus aplicaciones laborales</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="professional">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Vacante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Vacante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Puesto</Label>
                <Input
                  id="title"
                  value={newApplication.title}
                  onChange={(e) => setNewApplication({...newApplication, title: e.target.value})}
                  placeholder="ej., Desarrollador Frontend Senior"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={newApplication.company}
                  onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                  placeholder="ej., Tech Corp"
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Plataforma</Label>
                <Select value={newApplication.platform} onValueChange={(value) => setNewApplication({...newApplication, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Indeed">Indeed</SelectItem>
                    <SelectItem value="OCC">OCC</SelectItem>
                    <SelectItem value="Computrabajo">Computrabajo</SelectItem>
                    <SelectItem value="AngelList">AngelList</SelectItem>
                    <SelectItem value="Other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="url">URL de la Vacante</Label>
                <Input
                  id="url"
                  value={newApplication.url}
                  onChange={(e) => setNewApplication({...newApplication, url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Descripción de la Vacante</Label>
                <Textarea
                  id="notes"
                  value=""
                  onChange={() => {}}
                  placeholder="Agregar notas después de crear la aplicación..."
                  rows={3}
                  disabled
                />
              </div>
              
              <Button onClick={addApplication} className="w-full">
                Agregar Aplicación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusColumns.map((column) => (
          <Card key={column.key} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {column.label}
                <Badge variant="secondary" className="text-xs">
                  {getApplicationsByStatus(column.key as JobApplication['status']).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getApplicationsByStatus(column.key as JobApplication['status']).map((app) => (
                <div
                  key={app.id}
                  className="p-3 bg-background border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-2">{app.title}</h4>
                      <div className="flex gap-1">
                        {app.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(app.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => deleteApplication(app.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                      <Badge variant="outline" className="text-xs">{app.platform}</Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Applied: {new Date(app.dateApplied).toLocaleDateString()}
                    </div>
                    
                     {app.notes.length > 0 && (
                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                         <MessageSquare className="w-3 h-3" />
                         <span className="line-clamp-1">{app.notes.length} nota{app.notes.length > 1 ? 's' : ''}</span>
                       </div>
                     )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {statusColumns.map((status) => (
                        <Button
                          key={status.key}
                          variant={app.status === status.key ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => moveApplication(app.id, status.key as JobApplication['status'])}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
                {getApplicationsByStatus(column.key as JobApplication['status']).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Sin aplicaciones
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}