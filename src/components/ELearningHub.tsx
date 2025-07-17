import { useState } from "react";
import { BookOpen, Play, Clock, Star, Users, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  lessons: number;
  rating: number;
  enrolled: number;
  progress: number;
  category: string;
  thumbnail: string;
  isPremium: boolean;
}

export function ELearningHub() {
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Onboarding',
      description: 'Introducción a la plataforma y conceptos básicos de empleabilidad',
      instructor: 'Maria Rodriguez',
      duration: '1h',
      lessons: 4,
      rating: 4.8,
      enrolled: 1250,
      progress: 100,
      category: 'Onboarding',
      thumbnail: 'onboarding-course',
      isPremium: false
    },
    {
      id: '2',
      title: 'Define tu perfil profesional',
      description: 'Identifica tus fortalezas, valores y objetivos profesionales',
      instructor: 'Carlos Mendez',
      duration: '2h',
      lessons: 8,
      rating: 4.9,
      enrolled: 950,
      progress: 75,
      category: 'Perfil',
      thumbnail: 'profile-course',
      isPremium: false
    },
    {
      id: '3',
      title: 'CV & ATS',
      description: 'Crea un CV optimizado para sistemas de seguimiento de candidatos',
      instructor: 'Ana Silva',
      duration: '2.5h',
      lessons: 10,
      rating: 4.7,
      enrolled: 2100,
      progress: 50,
      category: 'CV',
      thumbnail: 'cv-course',
      isPremium: false
    },
    {
      id: '4',
      title: 'LinkedIn Boost: Potencia tu Marca Personal',
      description: 'Maximiza tu presencia profesional en LinkedIn para atraer oportunidades',
      instructor: 'Roberto Garcia',
      duration: '2h',
      lessons: 8,
      rating: 4.6,
      enrolled: 800,
      progress: 25,
      category: 'LinkedIn',
      thumbnail: 'linkedin-course',
      isPremium: false
    },
    {
      id: '5',
      title: 'Dominando la estrategia de búsqueda laboral',
      description: 'Técnicas efectivas para encontrar y aplicar a las mejores oportunidades',
      instructor: 'Elena Morales',
      duration: '3h',
      lessons: 12,
      rating: 4.8,
      enrolled: 1500,
      progress: 0,
      category: 'Búsqueda',
      thumbnail: 'job-search-course',
      isPremium: false
    },
    {
      id: '6',
      title: 'Proceso de selección: Entrevistas y Seguimiento para el éxito laboral',
      description: 'Domina las entrevistas laborales y el seguimiento post-entrevista',
      instructor: 'Luis Herrera',
      duration: '3.5h',
      lessons: 14,
      rating: 4.7,
      enrolled: 1200,
      progress: 0,
      category: 'Entrevistas',
      thumbnail: 'interview-course',
      isPremium: false
    },
    {
      id: '7',
      title: 'Soporte emocional en la búsqueda de empleo',
      description: 'Mantén la motivación y gestiona el estrés durante tu búsqueda laboral',
      instructor: 'Carmen López',
      duration: '1.5h',
      lessons: 6,
      rating: 4.9,
      enrolled: 890,
      progress: 0,
      category: 'Bienestar',
      thumbnail: 'emotional-course',
      isPremium: false
    },
    {
      id: '8',
      title: 'Oferta Laboral, Negociación y Adaptación exitosa',
      description: 'Negocia ofertas laborales y adáptate exitosamente a tu nuevo empleo',
      instructor: 'Miguel Torres',
      duration: '2h',
      lessons: 8,
      rating: 4.8,
      enrolled: 750,
      progress: 0,
      category: 'Negociación',
      thumbnail: 'negotiation-course',
      isPremium: false
    }
  ]);

  const categories = ['All', 'Onboarding', 'Perfil', 'CV', 'LinkedIn', 'Búsqueda', 'Entrevistas', 'Bienestar', 'Negociación'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCourses = selectedCategory === 'All' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getCourseStatus = (progress: number) => {
    if (progress === 0) return 'Not Started';
    if (progress < 100) return 'In Progress';
    return 'Completed';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">E-Learning Hub</h2>
          <p className="text-muted-foreground">Advance your career with our comprehensive courses</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            My Courses
          </Button>
          <Button variant="professional">
            <Star className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>

      {/* Course Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
          {categories.slice(0, 5).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.length > 5 && (
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 mt-2">
            {categories.slice(5).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        
        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold">{filteredCourses.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success">
                      {filteredCourses.filter(c => c.progress === 100).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-primary">
                      {filteredCourses.filter(c => c.progress > 0 && c.progress < 100).length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="relative">
                    <div className="w-full h-32 bg-gradient-subtle rounded-lg mb-4 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    {course.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-gradient-primary">
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.instructor}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolled}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {getCourseStatus(course.progress)} • {course.lessons} lessons
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {course.progress === 0 ? (
                      <Button 
                        className="w-full"
                        variant={course.isPremium ? "outline" : "professional"}
                        disabled={course.isPremium}
                      >
                        {course.isPremium ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Premium Required
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Course
                          </>
                        )}
                      </Button>
                    ) : course.progress < 100 ? (
                      <Button className="w-full" variant="professional">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    ) : (
                      <Button className="w-full" variant="success">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}