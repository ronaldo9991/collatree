import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/project-card";
import { Network, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function Home() {
  const { data: authData } = useAuth();
  const [, setLocation] = useLocation();

  const { data: featuredProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects?limit=6", {
        credentials: "include",
      });
      return response.json();
    },
  });

  const handleViewAll = () => setLocation("/projects");

  const handleProjectView = (project: Project) => {
    setLocation(`/project/${project.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      {/* Hero Section */}
      <section className="bg-brand-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Student-Only <br />Freelancing Marketplace
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with verified students worldwide. Hire talented students for your projects or showcase your skills to global buyers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50"
              onClick={handleViewAll}
              data-testid="button-cta-projects"
            >
              Explore Projects
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-900 border border-blue-600"
              onClick={() => setLocation("/contact")}
              data-testid="button-cta-contact"
            >
              Contact Us
            </Button>
          </div>

          {/* Live Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-4">
                <Search className="text-gray-400 text-lg" />
                <Input 
                  type="text" 
                  placeholder="Search projects, skills, or universities..." 
                  className="flex-1 text-lg border-none outline-none text-gray-700 bg-transparent"
                  data-testid="input-search"
                />
                <Button 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
                  data-testid="button-search"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Services / Top 5 */}
      <section id="featured-projects" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Top Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most popular student projects right now
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects?.slice(0, 5).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleProjectView}
                showFavoriteButton={authData?.user.role === "BUYER"}
                showHireButton={authData?.user.role === "BUYER"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects (Recent) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Recently Added Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing work from verified students at top universities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleProjectView}
                showFavoriteButton={authData?.user.role === "BUYER"}
                showHireButton={authData?.user.role === "BUYER"}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700"
              onClick={handleViewAll}
              data-testid="button-view-all"
            >
              View All Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <img 
                  src="/collabotree-logo.png" 
                  alt="CollaboTree Logo" 
                  className="h-14 w-auto object-contain" 
                />
                <span className="font-bold text-2xl text-white">CollaboTree</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The world's first student-only freelancing marketplace. Connect with verified students from top universities.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">For Students</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How to Get Started</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Verification Process</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Student Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">For Buyers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CollaboTree. All rights reserved. Student-verified freelancing platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
