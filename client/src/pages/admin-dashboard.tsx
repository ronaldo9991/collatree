import { NavHeader } from "@/components/nav-header";
import { StatCard } from "@/components/stat-card";
import { VerificationStatus } from "@/components/verification-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Clock, 
  DollarSign, 
  FolderOpen, 
  AlertTriangle,
  Check,
  X,
  IdCard,
  UserCheck,
  Plus,
  ShoppingCart,
  BarChart3,
  Settings,
  Search,
  TrendingUp
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Stats, StudentProfile, AuthUser } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface VerificationItem extends StudentProfile {
  user?: AuthUser;
}

export default function AdminDashboard() {
  const { data: authData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats", { credentials: "include" });
      return response.json();
    },
  });

  const { data: pendingVerifications } = useQuery<VerificationItem[]>({
    queryKey: ["/api/admin/verification-queue"],
    queryFn: async () => {
      const response = await fetch("/api/admin/verification-queue", {
        credentials: "include",
      });
      return response.json();
    },
  });

  const verifyStudent = useMutation({
    mutationFn: async ({ userId, status, notes }: { userId: string; status: string; notes: string }) => {
      const response = await apiRequest("POST", `/api/admin/verify/${userId}`, { status, notes });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedVerification(null);
      setVerificationNotes("");
      toast({
        title: `Student ${variables.status.toLowerCase()}`,
        description: `Verification has been ${variables.status.toLowerCase()} successfully.`,
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

  const handleVerifyStudent = (userId: string, status: "APPROVED" | "REJECTED") => {
    verifyStudent.mutate({ userId, status, notes: verificationNotes });
  };

  const openVerificationDialog = (verification: VerificationItem) => {
    setSelectedVerification(verification);
    setVerificationNotes("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Platform management and verification queue</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={Users}
            change="+23 this week"
            changeType="positive"
            iconBgColor="bg-blue-100"
            iconTextColor="text-blue-600"
          />
          <StatCard
            title="Pending Verifications"
            value={stats?.pendingVerifications || 0}
            icon={Clock}
            change="Needs review"
            changeType="neutral"
            iconBgColor="bg-orange-100"
            iconTextColor="text-orange-600"
          />
          <StatCard
            title="Monthly GMV"
            value={`$${(stats?.monthlyGMV || 0) / 1000}K`}
            icon={DollarSign}
            change="+18% vs last month"
            changeType="positive"
            iconBgColor="bg-green-100"
            iconTextColor="text-green-600"
          />
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            icon={FolderOpen}
            change="15 new today"
            changeType="positive"
            iconBgColor="bg-purple-100"
            iconTextColor="text-purple-600"
          />
          <StatCard
            title="Active Disputes"
            value="2"
            icon={AlertTriangle}
            change="Requires attention"
            changeType="negative"
            iconBgColor="bg-red-100"
            iconTextColor="text-red-600"
          />
        </div>

        {/* Verification Queue */}
        <Card className="bg-white rounded-2xl shadow-md border border-gray-100 mb-8">
          <CardHeader className="p-6 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">
              Student Verification Queue
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Review and approve student ID verifications
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {pendingVerifications?.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
                <p className="text-gray-600">All student verifications are up to date!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerifications?.map((verification) => (
                  <div
                    key={verification.id}
                    className="bg-gray-50 rounded-xl p-6"
                    data-testid={`verification-item-${verification.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={verification.user?.avatarUrl || undefined} />
                          <AvatarFallback>
                            {verification.user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900" data-testid={`text-student-name-${verification.id}`}>
                            {verification.user?.name}
                          </h3>
                          <p className="text-gray-600 mb-2" data-testid={`text-student-email-${verification.id}`}>
                            {verification.user?.email}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">University:</span>
                              <p className="font-medium" data-testid={`text-university-${verification.id}`}>
                                {verification.university}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Student ID:</span>
                              <p className="font-medium" data-testid={`text-student-id-${verification.id}`}>
                                {verification.studentId}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Program:</span>
                              <p className="font-medium" data-testid={`text-program-${verification.id}`}>
                                {verification.program}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">OCR Confidence:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: "87%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-green-600">87%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Mock student ID document thumbnail */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-20 h-14 bg-gray-200 hover:bg-gray-300"
                          onClick={() => openVerificationDialog(verification)}
                          data-testid={`button-view-document-${verification.id}`}
                        >
                          <IdCard className="w-6 h-6 text-gray-500" />
                        </Button>
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => handleVerifyStudent(verification.userId, "APPROVED")}
                            disabled={verifyStudent.isPending}
                            className="bg-green-600 text-white hover:bg-green-700"
                            data-testid={`button-approve-${verification.id}`}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => openVerificationDialog(verification)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            data-testid={`button-reject-${verification.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingVerifications && pendingVerifications.length > 2 && (
                  <div className="text-center py-4">
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700"
                      data-testid="button-view-all-verifications"
                    >
                      View All Pending Verifications ({pendingVerifications.length - 2} more)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Dialog */}
        <Dialog 
          open={!!selectedVerification} 
          onOpenChange={(open) => !open && setSelectedVerification(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Student Verification Review</DialogTitle>
            </DialogHeader>
            {selectedVerification && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedVerification.user?.avatarUrl || undefined} />
                    <AvatarFallback>
                      {selectedVerification.user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedVerification.user?.name}
                    </h3>
                    <p className="text-gray-600">{selectedVerification.user?.email}</p>
                    <p className="text-sm text-gray-500">
                      {selectedVerification.university} • {selectedVerification.program}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Document Preview</h4>
                  <div className="bg-white rounded-lg p-8 text-center">
                    <IdCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Student ID Document</p>
                    <p className="text-sm text-gray-400 mt-2">
                      In a real implementation, the uploaded document would be displayed here
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="verification-notes">Verification Notes (Optional)</Label>
                  <Textarea
                    id="verification-notes"
                    placeholder="Add any notes about this verification..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="mt-2"
                    data-testid="textarea-verification-notes"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVerification(null)}
                    data-testid="button-cancel-verification"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleVerifyStudent(selectedVerification.userId, "REJECTED")}
                    disabled={verifyStudent.isPending}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    data-testid="button-reject-verification"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleVerifyStudent(selectedVerification.userId, "APPROVED")}
                    disabled={verifyStudent.isPending}
                    className="bg-green-600 text-white hover:bg-green-700"
                    data-testid="button-approve-verification"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-bold text-gray-900">Recent Platform Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Student verified</p>
                    <p className="text-sm text-gray-500">Sarah Chen from UC Berkeley</p>
                  </div>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New project listed</p>
                    <p className="text-sm text-gray-500">React Dashboard by Alex Kim</p>
                  </div>
                  <span className="text-xs text-gray-400">4h ago</span>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Order completed</p>
                    <p className="text-sm text-gray-500">$299 Logo Design project</p>
                  </div>
                  <span className="text-xs text-gray-400">6h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Tools */}
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-bold text-gray-900">Management Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="ghost"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 justify-start p-4 h-auto"
                  data-testid="button-manage-users"
                >
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-blue-600">Search, suspend, or promote users</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start p-4 h-auto"
                  data-testid="button-moderate-projects"
                >
                  <FolderOpen className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Moderate Projects</div>
                    <div className="text-sm text-gray-600">Review and manage project listings</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start p-4 h-auto"
                  data-testid="button-analytics-dashboard"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Analytics Dashboard</div>
                    <div className="text-sm text-gray-600">Platform metrics and insights</div>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="bg-gray-50 text-gray-700 hover:bg-gray-100 justify-start p-4 h-auto"
                  data-testid="button-platform-settings"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Platform Settings</div>
                    <div className="text-sm text-gray-600">Configure domain allowlist and features</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
