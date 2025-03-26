import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService, CurrentUserResponse } from "./index";
import { LoginDTO, AuthResponseDTO } from "@/types/employee";
import { ApiError } from "../index";
import { useRouter } from 'next/navigation';


const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error(defaultMessage);
  }
  console.error(error);
};


export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponseDTO, ApiError, LoginDTO>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {

      authService.saveToken(data.token);
      
     
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      
      toast.success("Login realizado com sucesso!");
    },
    onError: (error) => {
      handleApiError(error, "Erro ao fazer login. Verifique suas credenciais.");
    },
  });
};


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


export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return () => {

    authService.logout();
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    toast.success("Logout realizado com sucesso!");
    router.push('/auth/login');
  };
};