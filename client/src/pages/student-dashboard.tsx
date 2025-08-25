import { NavHeader } from "@/components/nav-header";
import { StatCard } from "@/components/stat-card";
import { VerificationStatus } from "@/components/verification-status";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DollarSign, 
  Briefcase, 
  FolderOpen, 
  Users, 
  Plus, 
  Code, 
  PaintbrushVertical, 
  BarChart3,
  Settings,
  ChartLine,
  Upload
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Project, Stats } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  skills: z.string().min(1, "Skills are required"),
  tags: z.string().min(1, "Category is required"),
  price: z.number().min(1, "Price must be at least $1"),
  deliveryTime: z.number().min(1, "Delivery time must be at least 1 week"),
  revisions: z.number().min(0, "Revisions cannot be negative").default(3),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function StudentDashboard() {
  const { data: authData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showCreateProject, setShowCreateProject] = useState(false);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats", { credentials: "include" });
      return response.json();
    },
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects", "student"],
    queryFn: async () => {
      const response = await fetch(`/api/projects?ownerId=${authData?.user.id}`, {
        credentials: "include",
      });
      return response.json();
    },
    enabled: !!authData?.user.id,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders", "student"],
    queryFn: async () => {
      const response = await fetch("/api/orders", { credentials: "include" });
      return response.json();
    },
  });

  const createProject = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const skillsArray = data.skills.split(",").map(s => s.trim());
      const tagsArray = [data.tags];
      
      const response = await apiRequest("POST", "/api/projects", {
        ...data,
        skills: skillsArray,
        tags: tagsArray,
        status: "LISTED",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowCreateProject(false);
      toast({
        title: "Project created!",
        description: "Your project has been listed on the marketplace.",
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

  const uploadIdDoc = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/student/verify-id", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "ID document uploaded",
        description: "Your verification is now pending admin review.",
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

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      skills: "",
      tags: "",
      price: 0,
      deliveryTime: 1,
      revisions: 3,
    },
  });

  const handleProjectView = (project: Project) => {
    setLocation(`/project/${project.slug}`);
  };

  const studentProfile = authData?.user.role === "STUDENT" ? authData?.profile as any : null;
  const isVerified = studentProfile?.verificationStatus === "APPROVED";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-dashboard-title">
            Student Dashboard
          </h1>
          <p className="text-gray-600">Manage your projects, earnings, and profile</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earnings"
            value={`$${stats?.totalEarnings || 0}`}
            icon={DollarSign}
            change="+12%"
            changeType="positive"
            iconBgColor="bg-green-100"
            iconTextColor="text-green-600"
          />
          <StatCard
            title="Active Orders"
            value={stats?.activeOrders || 0}
            icon={Briefcase}
            change="+2"
            changeType="positive"
            iconBgColor="bg-blue-100"
            iconTextColor="text-blue-600"
          />
          <StatCard
            title="My Projects"
            value={stats?.totalProjects || 0}
            icon={FolderOpen}
            change={`${stats?.activeProjects || 0}`}
            changeType="neutral"
            iconBgColor="bg-purple-100"
            iconTextColor="text-purple-600"
          />
          <StatCard
            title="Team Invites"
            value="5"
            icon={Users}
            change="3"
            changeType="neutral"
            iconBgColor="bg-orange-100"
            iconTextColor="text-orange-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
              <CardHeader className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">My Projects</CardTitle>
                  <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        data-testid="button-create-project"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={form.handleSubmit((data) => createProject.mutate(data))} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Project Title</Label>
                          <Input
                            id="title"
                            {...form.register("title")}
                            placeholder="e.g., Full-Stack React Application"
                            data-testid="input-project-title"
                          />
                          {form.formState.errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Describe what you'll deliver..."
                            rows={4}
                            data-testid="input-project-description"
                          />
                          {form.formState.errors.description && (
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.description.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="skills">Skills (comma-separated)</Label>
                            <Input
                              id="skills"
                              {...form.register("skills")}
                              placeholder="React, Node.js, MongoDB"
                              data-testid="input-project-skills"
                            />
                            {form.formState.errors.skills && (
                              <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.skills.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="tags">Category</Label>
                            <Input
                              id="tags"
                              {...form.register("tags")}
                              placeholder="Web Development"
                              data-testid="input-project-category"
                            />
                            {form.formState.errors.tags && (
                              <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.tags.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                              id="price"
                              type="number"
                              {...form.register("price", { valueAsNumber: true })}
                              placeholder="299"
                              data-testid="input-project-price"
                            />
                            {form.formState.errors.price && (
                              <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.price.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="deliveryTime">Delivery (weeks)</Label>
                            <Input
                              id="deliveryTime"
                              type="number"
                              {...form.register("deliveryTime", { valueAsNumber: true })}
                              placeholder="8"
                              data-testid="input-project-delivery"
                            />
                            {form.formState.errors.deliveryTime && (
                              <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.deliveryTime.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="revisions">Revisions</Label>
                            <Input
                              id="revisions"
                              type="number"
                              {...form.register("revisions", { valueAsNumber: true })}
                              placeholder="3"
                              data-testid="input-project-revisions"
                            />
                            {form.formState.errors.revisions && (
                              <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.revisions.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateProject(false)}
                            data-testid="button-cancel-project"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createProject.isPending}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            data-testid="button-submit-project"
                          >
                            {createProject.isPending ? "Creating..." : "Create Project"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {projects?.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-4">Create your first project to start earning!</p>
                    <Button
                      onClick={() => setShowCreateProject(true)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      data-testid="button-create-first-project"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects?.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleProjectView(project)}
                        data-testid={`project-item-${project.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Code className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900" data-testid={`text-project-title-${project.id}`}>
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {project.tags[0]} • ${project.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={
                              project.status === "LISTED"
                                ? "bg-green-100 text-green-700"
                                : project.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }
                            data-testid={`badge-project-status-${project.id}`}
                          >
                            {project.status === "LISTED" ? "Active" : project.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Options</span>
                            •••
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification & Quick Actions */}
          <div className="space-y-6">
            {/* Student Verification Status */}
            {studentProfile && (
              <VerificationStatus
                status={studentProfile.verificationStatus}
                university={studentProfile.university}
                studentId={studentProfile.studentId}
                showDetails={true}
              />
            )}

            {/* ID Upload for Pending Students */}
            {studentProfile?.verificationStatus === "PENDING" && (
              <Card className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Upload Student ID</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your student ID document for verification to start listing projects.
                </p>
                <Button
                  onClick={() => uploadIdDoc.mutate()}
                  disabled={uploadIdDoc.isPending}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  data-testid="button-upload-id"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadIdDoc.isPending ? "Uploading..." : "Upload ID Document"}
                </Button>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 justify-start"
                  onClick={() => setShowCreateProject(true)}
                  data-testid="button-quick-create-project"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Create New Project
                </Button>
                <Button
                  variant="ghost"
                  className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  data-testid="button-quick-manage-teams"
                >
                  <Users className="w-4 h-4 mr-3" />
                  Manage Teams
                </Button>
                <Button
                  variant="ghost"
                  className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  data-testid="button-quick-view-earnings"
                >
                  <ChartLine className="w-4 h-4 mr-3" />
                  View Earnings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start"
                  data-testid="button-quick-settings"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Account Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
