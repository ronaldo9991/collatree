import { Network, Bell, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth, useLogout } from "@/lib/auth";
import { Link, useLocation } from "wouter";

interface NavHeaderProps {
  onRoleChange?: (role: "STUDENT" | "BUYER" | "ADMIN") => void;
  currentRole?: "STUDENT" | "BUYER" | "ADMIN";
}

export function NavHeader({ onRoleChange, currentRole }: NavHeaderProps) {
  const { data: authData } = useAuth();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      },
    });
  };

  const user = authData?.user;

  // Public navigation for non-authenticated users
  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
              <img 
                src="/collabotree-logo.png" 
                alt="CollaboTree Logo" 
                className="w-8 h-8 object-contain" 
              />
              <span className="font-bold text-xl text-gray-900 tracking-tight">CollaboTree</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                How it Works
              </a>
              <a href="#featured-projects" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Featured Projects
              </a>
              <a href="#support" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Support
              </a>
            </div>

            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/auth")}
                data-testid="button-login"
                className="rounded-xl"
              >
                Login
              </Button>
              <Button 
                onClick={() => setLocation("/auth")}
                data-testid="button-signup"
                className="bg-brand-gradient rounded-xl"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <img 
              src="/collabotree-logo.png" 
              alt="CollaboTree Logo" 
              className="w-8 h-8 object-contain" 
            />
            <span className="font-bold text-xl text-gray-900 tracking-tight">CollaboTree</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="link-marketplace">
              Marketplace
            </Link>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              How it Works
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Support
            </a>
          </div>

          {/* User Menu & Role Switcher */}
          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            {user.role === "ADMIN" && onRoleChange && (
              <div className="hidden lg:flex bg-gray-100 rounded-xl p-1">
                <Button
                  size="sm"
                  variant={currentRole === "STUDENT" ? "default" : "ghost"}
                  className={currentRole === "STUDENT" ? "bg-brand-gradient text-white" : ""}
                  onClick={() => onRoleChange("STUDENT")}
                  data-testid="button-role-student"
                >
                  Student
                </Button>
                <Button
                  size="sm"
                  variant={currentRole === "BUYER" ? "default" : "ghost"}
                  className={currentRole === "BUYER" ? "bg-brand-gradient text-white" : ""}
                  onClick={() => onRoleChange("BUYER")}
                  data-testid="button-role-buyer"
                >
                  Buyer
                </Button>
                <Button
                  size="sm"
                  variant={currentRole === "ADMIN" ? "default" : "ghost"}
                  className={currentRole === "ADMIN" ? "bg-brand-gradient text-white" : ""}
                  onClick={() => onRoleChange("ADMIN")}
                  data-testid="button-role-admin"
                >
                  Admin
                </Button>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-500 text-white">
                  1
                </Badge>
              </Button>
            </div>

            {/* User Avatar & Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role.toLowerCase()}`} data-testid="link-dashboard">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" data-testid="link-settings">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
