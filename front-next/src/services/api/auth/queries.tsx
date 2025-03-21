import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService, CurrentUserResponse } from "./index";
import { LoginDTO, AuthResponseDTO } from "@/types/employee";
import { ApiError } from "../index";

// Error handler utility
const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error(defaultMessage);
  }
  console.error(error);
};

/**
 * Login hook
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponseDTO, ApiError, LoginDTO>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Save token to localStorage
      authService.saveToken(data.token);
      
      // Invalidate currentUser query to refetch with new token
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      
      toast.success("Login realizado com sucesso!");
    },
    onError: (error) => {
      handleApiError(error, "Erro ao fazer login. Verifique suas credenciais.");
    },
  });
};

/**
 * Get current user hook
 */
export const useCurrentUser = () => {
  return useQuery<CurrentUserResponse, ApiError>({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: authService.isAuthenticated(), // Only run if user is authenticated
    retry: (failureCount, error) => {
      // Don't retry on 401 (Unauthorized)
      if (error instanceof ApiError && error.status === 401) {
        authService.removeToken(); // Clear invalid token
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Logout hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    // Clear token
    authService.logout();
    
    // Reset auth-related queries
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    
    // Optional: Reset all queries if needed
    // queryClient.clear();
    
    toast.success("Logout realizado com sucesso!");
  };
};