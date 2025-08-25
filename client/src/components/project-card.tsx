import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart } from "lucide-react";
import { Project } from "@/types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: Project;
  onHire?: (project: Project) => void;
  onView?: (project: Project) => void;
  showFavoriteButton?: boolean;
  showHireButton?: boolean;
}

const categoryColors: Record<string, string> = {
  "Web Development": "bg-blue-100 text-blue-700",
  "Design": "bg-purple-100 text-purple-700",
  "Data Science": "bg-green-100 text-green-700",
  "Mobile Development": "bg-orange-100 text-orange-700",
  "Marketing": "bg-pink-100 text-pink-700",
  "Writing": "bg-yellow-100 text-yellow-700",
};

export function ProjectCard({ 
  project, 
  onHire, 
  onView,
  showFavoriteButton = true,
  showHireButton = true
}: ProjectCardProps) {
  const { data: authData } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
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
        description: `${project.title} ${isFavorited ? "removed from" : "added to"} your favorites.`,
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

  const category = project.tags[0] || "Other";
  const categoryStyle = categoryColors[category] || "bg-gray-100 text-gray-700";

  return (
    <Card 
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      onClick={() => onView?.(project)}
      data-testid={`card-project-${project.id}`}
    >
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-6xl font-bold text-blue-600 opacity-20">
          {category.charAt(0)}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={categoryStyle}>
            {category}
          </Badge>
          {showFavoriteButton && authData?.user.role === "BUYER" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate();
              }}
              className={`transition-colors ${isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
              data-testid={`button-favorite-${project.id}`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>

        <h3 className="font-bold text-lg text-gray-900 mb-2" data-testid={`text-title-${project.id}`}>
          {project.title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3" data-testid={`text-description-${project.id}`}>
          {project.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={project.owner?.avatarUrl || undefined} />
              <AvatarFallback>
                {project.owner?.name.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900" data-testid={`text-owner-${project.id}`}>
                {project.owner?.name}
              </p>
              <p className="text-xs text-gray-500" data-testid={`text-university-${project.id}`}>
                {project.studentProfile?.university}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">4.9</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-bold text-xl" data-testid={`text-price-${project.id}`}>
            ${project.price}
          </span>
          {showHireButton && authData?.user.role === "BUYER" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onHire?.(project);
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
              data-testid={`button-hire-${project.id}`}
            >
              Hire Student
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
