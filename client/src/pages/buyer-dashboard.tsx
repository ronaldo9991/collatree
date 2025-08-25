import { NavHeader } from "@/components/nav-header";
import { StatCard } from "@/components/stat-card";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Eye, 
  DollarSign,
  History,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Project, Stats, Order, Favorite } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

export default function BuyerDashboard() {
  const { data: authData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedUniversity, setSelectedUniversity] = useState("All Universities");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Price Range");

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats", { credentials: "include" });
      return response.json();
    },
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects", "marketplace", searchQuery, selectedCategory, selectedUniversity, selectedPriceRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (selectedUniversity !== "All Universities") params.append("university", selectedUniversity);
      if (selectedPriceRange !== "Price Range") params.append("priceRange", selectedPriceRange);
      
      const response = await fetch(`/api/projects?${params.toString()}`, {
        credentials: "include",
      });
      return response.json();
    },
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders", "buyer"],
    queryFn: async () => {
      const response = await fetch("/api/orders", { credentials: "include" });
      return response.json();
    },
  });

  const { data: favorites } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites", { credentials: "include" });
      return response.json();
    },
  });

  const createOrder = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", "/api/orders", { projectId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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

  const handleHireStudent = (project: Project) => {
    createOrder.mutate(project.id);
  };

  const handleProjectView = (project: Project) => {
    setLocation(`/project/${project.slug}`);
  };

  const handleSearch = () => {
    // Query will automatically update due to searchQuery dependency
  };

  const recentOrders = orders?.slice(0, 2) || [];
  const recentFavorites = favorites?.slice(0, 2) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-dashboard-title">
            Buyer Dashboard
          </h1>
          <p className="text-gray-600">Browse projects and manage your purchases</p>
        </div>

        {/* Marketplace Filters */}
        <Card className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search projects, skills..."
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  data-testid="input-search-projects"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 rounded-xl" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger className="w-48 rounded-xl" data-testid="select-university">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Universities">All Universities</SelectItem>
                <SelectItem value="MIT">MIT</SelectItem>
                <SelectItem value="Stanford">Stanford</SelectItem>
                <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                <SelectItem value="Harvard">Harvard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger className="w-48 rounded-xl" data-testid="select-price-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Price Range">Price Range</SelectItem>
                <SelectItem value="$0 - $100">$0 - $100</SelectItem>
                <SelectItem value="$100 - $300">$100 - $300</SelectItem>
                <SelectItem value="$300 - $500">$300 - $500</SelectItem>
                <SelectItem value="$500+">$500+</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSearch}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
              data-testid="button-search"
            >
              Search
            </Button>
          </div>
        </Card>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onHire={handleHireStudent}
              onView={handleProjectView}
              showFavoriteButton={true}
              showHireButton={true}
            />
          ))}
        </div>

        {/* Empty state */}
        {projects?.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedUniversity("All Universities");
                setSelectedPriceRange("Price Range");
              }}
              variant="outline"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Purchases */}
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-gray-900">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No purchases yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      data-testid={`order-item-${order.id}`}
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm" data-testid={`text-order-title-${order.id}`}>
                          {order.project?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.student?.name} • ${order.amount}
                        </p>
                      </div>
                      <Badge
                        className={
                          order.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }
                        data-testid={`badge-order-status-${order.id}`}
                      >
                        {order.status === "PAID" ? "Delivered" : order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-gray-900">Favorites</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {recentFavorites.length === 0 ? (
                <div className="text-center py-4">
                  <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No favorites yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentFavorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                      onClick={() => favorite.project && handleProjectView(favorite.project)}
                      data-testid={`favorite-item-${favorite.id}`}
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm" data-testid={`text-favorite-title-${favorite.id}`}>
                          {favorite.project?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {favorite.project?.owner?.name} • ${favorite.project?.price}
                        </p>
                      </div>
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 justify-start"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  data-testid="button-quick-browse"
                >
                  <Search className="w-4 h-4 mr-3" />
                  Browse Projects
                </Button>
                <Button
                  variant="ghost"
                  className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  data-testid="button-quick-order-history"
                >
                  <History className="w-4 h-4 mr-3" />
                  Order History
                </Button>
                <Button
                  variant="ghost"
                  className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  data-testid="button-quick-settings"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
