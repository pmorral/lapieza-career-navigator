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
      title: 'Master Your CV: From Average to Outstanding',
      description: 'Learn how to create compelling CVs that get noticed by recruiters and pass ATS systems.',
      instructor: 'Maria Rodriguez',
      duration: '2h 30m',
      lessons: 12,
      rating: 4.8,
      enrolled: 1250,
      progress: 75,
      category: 'CV',
      thumbnail: 'cv-course',
      isPremium: false
    },
    {
      id: '2',
      title: 'LinkedIn Mastery: Building Your Professional Brand',
      description: 'Transform your LinkedIn profile into a powerful career tool that attracts opportunities.',
      instructor: 'Carlos Mendez',
      duration: '3h 15m',
      lessons: 18,
      rating: 4.9,
      enrolled: 950,
      progress: 45,
      category: 'LinkedIn',
      thumbnail: 'linkedin-course',
      isPremium: true
    },
    {
      id: '3',
      title: 'Interview Success: Ace Any Interview',
      description: 'Master the art of interviewing with proven techniques and real-world scenarios.',
      instructor: 'Ana Silva',
      duration: '4h 45m',
      lessons: 25,
      rating: 4.7,
      enrolled: 2100,
      progress: 0,
      category: 'Interview',
      thumbnail: 'interview-course',
      isPremium: false
    },
    {
      id: '4',
      title: 'Negotiation Skills for Better Offers',
      description: 'Learn how to negotiate salary and benefits effectively in your career.',
      instructor: 'Roberto Garcia',
      duration: '2h 10m',
      lessons: 10,
      rating: 4.6,
      enrolled: 800,
      progress: 20,
      category: 'Negotiation',
      thumbnail: 'negotiation-course',
      isPremium: true
    },
    {
      id: '5',
      title: 'Job Search Strategy: Finding Hidden Opportunities',
      description: 'Discover advanced job search techniques and tap into the hidden job market.',
      instructor: 'Elena Morales',
      duration: '3h 30m',
      lessons: 16,
      rating: 4.8,
      enrolled: 1500,
      progress: 60,
      category: 'Job Search',
      thumbnail: 'job-search-course',
      isPremium: false
    }
  ]);

  const categories = ['All', 'CV', 'LinkedIn', 'Interview', 'Negotiation', 'Job Search'];
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
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