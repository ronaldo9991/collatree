import { NavHeader } from "@/components/nav-header";
import { VerificationStatus } from "@/components/verification-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Check, 
  MessageCircle,
  Clock,
  RotateCcw,
  GraduationCap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Project } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

interface ProjectDetailProps {
  slug: string;
}

export default function ProjectDetail({ slug }: ProjectDetailProps) {
  const { data: authData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", slug],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${slug}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Project not found");
      }
      return response.json();
    },
  });

  const { data: relatedProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects", "related", project?.ownerId],
    queryFn: async () => {
      if (!project?.ownerId) return [];
      const response = await fetch(`/api/projects?ownerId=${project.ownerId}&limit=2`, {
        credentials: "include",
      });
      return response.json();
    },
    enabled: !!project?.ownerId,
  });

  const createOrder = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", "/api/orders", { projectId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order created!",
        description: "Your order has been placed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!project) return;
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${project.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { projectId: project.id });
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: `${project?.title} ${isFavorited ? "removed from" : "added to"} your favorites.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleHireStudent = () => {
    if (!project) return;
    createOrder.mutate(project.id);
  };

  const handleBackClick = () => {
    setLocation("/buyer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h1>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
            <Button onClick={handleBackClick}>
              Go back to marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const category = project.tags[0] || "Other";
  const filteredRelatedProjects = relatedProjects?.filter(p => p.id !== project.id) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
          data-testid="button-back-to-marketplace"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
              <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-6xl font-bold text-blue-600 opacity-20">
                  {category.charAt(0)}
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2 font-medium">
                    {category}
                  </Badge>
                  {authData?.user.role === "BUYER" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite.mutate()}
                      className={`transition-colors ${isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                      data-testid="button-toggle-favorite"
                    >
                      <Heart className={`w-6 h-6 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-project-title">
                  {project.title}
                </h1>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6" data-testid="text-project-description">
                  {project.description}
                </p>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700"
                      data-testid={`badge-skill-${index}`}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Student Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={project.owner?.avatarUrl || undefined} />
                    <AvatarFallback>
                      {project.owner?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900" data-testid="text-student-name">
                      {project.owner?.name}
                    </h3>
                    <p className="text-gray-600">Computer Science Student</p>
                    <p className="text-blue-600 font-medium" data-testid="text-student-university">
                      {project.studentProfile?.university}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">4.9</span>
                        <span className="text-gray-500">(24 reviews)</span>
                      </div>
                      {project.studentProfile && (
                        <VerificationStatus 
                          status={project.studentProfile.verificationStatus}
                          showDetails={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Complete full-stack web application with modern React frontend</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">RESTful API backend with Node.js and Express</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Database design and implementation with MongoDB</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">User authentication and authorization system</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Responsive design that works on all devices</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Deployment setup and documentation</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Source code with detailed comments and README</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">Development Process</h3>
                  <p className="text-gray-700 mb-4">I follow an agile development approach with regular updates and milestone reviews:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Week 1-2: Planning & Setup</h4>
                      <p className="text-sm text-gray-600">Requirements gathering, architecture design, project setup</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Week 3-4: Backend Development</h4>
                      <p className="text-sm text-gray-600">API development, database schema, authentication</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Week 5-6: Frontend Development</h4>
                      <p className="text-sm text-gray-600">React components, UI/UX implementation, integration</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Week 7-8: Testing & Deployment</h4>
                      <p className="text-sm text-gray-600">Quality assurance, deployment, documentation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2" data-testid="text-project-price">
                  ${project.price}
                </div>
                <p className="text-gray-600">Complete project price</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Time:</span>
                  <span className="font-medium" data-testid="text-delivery-time">
                    {project.deliveryTime} weeks
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revisions:</span>
                  <span className="font-medium" data-testid="text-revisions">
                    {project.revisions} included
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">University:</span>
                  <span className="font-medium" data-testid="text-sidebar-university">
                    {project.studentProfile?.university}
                  </span>
                </div>
              </div>

              {authData?.user.role === "BUYER" && (
                <>
                  <Button
                    onClick={handleHireStudent}
                    disabled={createOrder.isPending}
                    className="w-full bg-brand-gradient text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 mb-4"
                    data-testid="button-hire-student"
                  >
                    {createOrder.isPending ? "Processing..." : `Hire ${project.owner?.name.split(' ')[0]}`}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
                    data-testid="button-contact-student"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Student
                  </Button>
                </>
              )}

              {authData?.user.role === "STUDENT" && project.ownerId === authData.user.id && (
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 py-3 rounded-xl font-medium hover:bg-blue-50"
                  data-testid="button-edit-project"
                >
                  Edit Project
                </Button>
              )}
            </Card>

            {/* Student Stats */}
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Student Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">&lt; 2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Orders:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">On-time Delivery:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
              </div>
            </Card>

            {/* Related Projects */}
            {filteredRelatedProjects.length > 0 && (
              <Card className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  More from {project.owner?.name.split(' ')[0]}
                </h3>
                <div className="space-y-4">
                  {filteredRelatedProjects.map((relatedProject) => (
                    <div
                      key={relatedProject.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/project/${relatedProject.slug}`)}
                      data-testid={`related-project-${relatedProject.id}`}
                    >
                      <h4 className="font-medium text-gray-900 mb-1" data-testid={`text-related-title-${relatedProject.id}`}>
                        {relatedProject.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {relatedProject.tags[0]} • {relatedProject.deliveryTime} weeks
                      </p>
                      <span className="text-blue-600 font-bold" data-testid={`text-related-price-${relatedProject.id}`}>
                        ${relatedProject.price}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
