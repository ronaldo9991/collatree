import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { AuthUser, StudentProfile, BuyerProfile } from "@/types";

interface AuthResponse {
  user: AuthUser;
  profile?: StudentProfile | BuyerProfile;
}

export function useAuth() {
  return useQuery<AuthResponse | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      // Set the auth data directly in the cache instead of invalidating
      queryClient.setQueryData(["/api/auth/me"], data);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name: string;
      role: "STUDENT" | "BUYER";
      university?: string;
      studentId?: string;
      program?: string;
      companyName?: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Set the auth data directly in the cache instead of invalidating
      queryClient.setQueryData(["/api/auth/me"], data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
