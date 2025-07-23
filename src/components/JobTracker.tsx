import { useState } from "react";
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
  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      platform: 'LinkedIn',
      url: 'https://linkedin.com/jobs/123456',
      status: 'advancing',
      dateApplied: '2024-01-15',
      notes: [
        {
          id: '1',
          text: 'Great interview with the team lead. Discussed React architecture and scalability challenges.',
          date: '2024-01-16',
          type: 'interview'
        },
        {
          id: '2',
          text: 'Follow-up email sent with portfolio examples.',
          date: '2024-01-17',
          type: 'general'
        }
      ]
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      platform: 'AngelList',
      url: 'https://angel.co/jobs/789012',
      status: 'first-call',
      dateApplied: '2024-01-20',
      notes: [
        {
          id: '3',
          text: 'Initial screening call scheduled for next week.',
          date: '2024-01-20',
          type: 'general'
        }
      ]
    }
  ]);

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
    { key: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { key: 'first-call', label: 'First Call', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'advancing', label: 'Advancing', color: 'bg-purple-100 text-purple-800' },
    { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { key: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800' }
  ];

  const addApplication = () => {
    if (newApplication.title && newApplication.company) {
      const application: JobApplication = {
        id: Date.now().toString(),
        title: newApplication.title!,
        company: newApplication.company!,
        platform: newApplication.platform || 'Other',
        url: newApplication.url || '',
        status: newApplication.status as JobApplication['status'] || 'applied',
        dateApplied: new Date().toISOString().split('T')[0],
        notes: []
      };
      
      setApplications([...applications, application]);
      setNewApplication({
        title: '',
        company: '',
        platform: '',
        url: '',
        status: 'applied',
        notes: []
      });
      setIsDialogOpen(false);
    }
  };

  const moveApplication = (id: string, newStatus: JobApplication['status']) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  const deleteApplication = (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
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
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Job Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newApplication.title}
                  onChange={(e) => setNewApplication({...newApplication, title: e.target.value})}
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newApplication.company}
                  onChange={(e) => setNewApplication({...newApplication, company: e.target.value})}
                  placeholder="e.g., Tech Corp"
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={newApplication.platform} onValueChange={(value) => setNewApplication({...newApplication, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Indeed">Indeed</SelectItem>
                    <SelectItem value="OCC">OCC</SelectItem>
                    <SelectItem value="Computrabajo">Computrabajo</SelectItem>
                    <SelectItem value="AngelList">AngelList</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="url">Job URL</Label>
                <Input
                  id="url"
                  value={newApplication.url}
                  onChange={(e) => setNewApplication({...newApplication, url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Initial Notes</Label>
                <Textarea
                  id="notes"
                  value=""
                  onChange={() => {}}
                  placeholder="Add notes after creating the application..."
                  rows={3}
                  disabled
                />
              </div>
              
              <Button onClick={addApplication} className="w-full">
                Add Application
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
                  No applications
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}