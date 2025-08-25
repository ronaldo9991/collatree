import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["STUDENT", "BUYER"]),
  university: z.string().optional(),
  studentId: z.string().optional(),
  program: z.string().optional(),
  companyName: z.string().optional(),
}).refine((data) => {
  if (data.role === "STUDENT") {
    return data.university && data.studentId && data.program;
  }
  return true;
}, {
  message: "University, Student ID, and Program are required for students",
  path: ["university"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "BUYER">("STUDENT");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const login = useLogin();
  const register = useRegister();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "STUDENT",
      university: "",
      studentId: "",
      program: "",
      companyName: "",
    },
  });

  const onLogin = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: (response) => {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        // Redirect based on role
        const role = response.user.role.toLowerCase();
        setLocation(`/${role}`);
      },
      onError: (error: any) => {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const onRegister = (data: RegisterForm) => {
    // Validate student email domain
    if (data.role === "STUDENT") {
      const allowedDomains = [".edu", ".ac.uk", ".org"];
      const isValidDomain = allowedDomains.some(domain => data.email.endsWith(domain));
      if (!isValidDomain) {
        toast({
          title: "Invalid email",
          description: "Student registration requires an educational email address (.edu, .ac.uk, .org)",
          variant: "destructive",
        });
        return;
      }
    }

    register.mutate(data, {
      onSuccess: (response) => {
        toast({
          title: "Account created!",
          description: data.role === "STUDENT" 
            ? "Please upload your student ID for verification."
            : "Welcome to CollaboTree!",
        });
        // Redirect based on role
        const role = response.user.role.toLowerCase();
        setLocation(`/${role}`);
      },
      onError: (error: any) => {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/collabotree-logo.png" 
              alt="CollaboTree Logo" 
              className="w-12 h-12 rounded-xl" 
            />
            <span className="font-bold text-2xl text-gray-900">CollaboTree</span>
          </div>
          <p className="text-gray-600">Student-only freelancing marketplace</p>
        </div>

        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {activeTab === "login" ? "Welcome Back" : "Join CollaboTree"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      {...loginForm.register("email")}
                      className="rounded-xl"
                      data-testid="input-login-email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...loginForm.register("password")}
                      className="rounded-xl"
                      data-testid="input-login-password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-gradient text-white rounded-xl py-3 font-semibold"
                    disabled={login.isPending}
                    data-testid="button-login"
                  >
                    {login.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>Student:</strong> alex.kim@mit.edu / password123</p>
                    <p><strong>Buyer:</strong> buyer1@company.com / password123</p>
                    <p><strong>Admin:</strong> admin@collabotree.com / admin123</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <Label>I am a...</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="button"
                        variant={selectedRole === "STUDENT" ? "default" : "outline"}
                        className="flex-1 rounded-xl"
                        onClick={() => {
                          setSelectedRole("STUDENT");
                          registerForm.setValue("role", "STUDENT");
                        }}
                        data-testid="button-role-student"
                      >
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={selectedRole === "BUYER" ? "default" : "outline"}
                        className="flex-1 rounded-xl"
                        onClick={() => {
                          setSelectedRole("BUYER");
                          registerForm.setValue("role", "BUYER");
                        }}
                        data-testid="button-role-buyer"
                      >
                        Buyer
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      {...registerForm.register("name")}
                      className="rounded-xl"
                      data-testid="input-register-name"
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-email">
                      Email {selectedRole === "STUDENT" && "(Use .edu, .ac.uk, or .org)"}
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      {...registerForm.register("email")}
                      className="rounded-xl"
                      placeholder={selectedRole === "STUDENT" ? "you@university.edu" : "you@company.com"}
                      data-testid="input-register-email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                      className="rounded-xl"
                      data-testid="input-register-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Student-specific fields */}
                  {selectedRole === "STUDENT" && (
                    <>
                      <div>
                        <Label htmlFor="register-university">University</Label>
                        <Input
                          id="register-university"
                          {...registerForm.register("university")}
                          className="rounded-xl"
                          placeholder="Massachusetts Institute of Technology"
                          data-testid="input-register-university"
                        />
                        {registerForm.formState.errors.university && (
                          <p className="text-red-500 text-sm mt-1">
                            {registerForm.formState.errors.university.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="register-student-id">Student ID</Label>
                        <Input
                          id="register-student-id"
                          {...registerForm.register("studentId")}
                          className="rounded-xl"
                          placeholder="STU-2024-123456"
                          data-testid="input-register-student-id"
                        />
                      </div>

                      <div>
                        <Label htmlFor="register-program">Program/Major</Label>
                        <Input
                          id="register-program"
                          {...registerForm.register("program")}
                          className="rounded-xl"
                          placeholder="Computer Science"
                          data-testid="input-register-program"
                        />
                      </div>
                    </>
                  )}

                  {/* Buyer-specific fields */}
                  {selectedRole === "BUYER" && (
                    <div>
                      <Label htmlFor="register-company">Company Name (Optional)</Label>
                      <Input
                        id="register-company"
                        {...registerForm.register("companyName")}
                        className="rounded-xl"
                        placeholder="Your Company"
                        data-testid="input-register-company"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-brand-gradient text-white rounded-xl py-3 font-semibold"
                    disabled={register.isPending}
                    data-testid="button-register"
                  >
                    {register.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
