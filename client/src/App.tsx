import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import StudentDashboard from "@/pages/student-dashboard";
import BuyerDashboard from "@/pages/buyer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ProjectDetail from "@/pages/project-detail";
import { RoleGuard } from "@/components/role-guard";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: authData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authData?.user) {
    return <Auth />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      {/* Protected routes */}
      <Route path="/">
        <AuthGuard>
          <Home />
        </AuthGuard>
      </Route>
      
      <Route path="/student">
        <AuthGuard>
          <RoleGuard allowedRoles={["STUDENT", "ADMIN"]}>
            <StudentDashboard />
          </RoleGuard>
        </AuthGuard>
      </Route>
      
      <Route path="/buyer">
        <AuthGuard>
          <RoleGuard allowedRoles={["BUYER", "ADMIN"]}>
            <BuyerDashboard />
          </RoleGuard>
        </AuthGuard>
      </Route>
      
      <Route path="/admin">
        <AuthGuard>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleGuard>
        </AuthGuard>
      </Route>
      
      <Route path="/marketplace">
        <AuthGuard>
          <BuyerDashboard />
        </AuthGuard>
      </Route>
      
      <Route path="/project/:slug">
        {(params) => (
          <AuthGuard>
            <ProjectDetail slug={params.slug} />
          </AuthGuard>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
