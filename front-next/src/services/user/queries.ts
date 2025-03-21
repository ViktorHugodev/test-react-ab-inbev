import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userService } from "./index";
import { 
  Employee, 
  UpdateEmployeeDTO, 
  UpdatePasswordDTO 
} from "@/types/employee";

import { toast } from 'sonner';
import { ApiError } from 'next/dist/server/api-utils';


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
 * Hook para obter dados do usuário atual
 */
export const useCurrentUser = () => {
  return useQuery<Employee, ApiError>({
    queryKey: ["currentUser"],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      // Não tentar novamente em caso de erro 401 (não autenticado)
      if (error instanceof ApiError && error.statusCode === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token")
  });
};

/**
 * Hook para atualizar o perfil do usuário atual
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Employee, 
    ApiError, 
    { userId: string; data: Partial<UpdateEmployeeDTO> }
  >({
    mutationFn: ({ userId, data }) => userService.updateProfile(userId, data),
    onSuccess: (updatedUser) => {
      toast.success("Perfil atualizado com sucesso!");
      
      // Atualizar dados em cache
      queryClient.setQueryData(["currentUser"], updatedUser);
      queryClient.setQueryData(["employee", updatedUser.id], updatedUser);
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar perfil.");
    },
  });
};

/**
 * Hook para alteração de senha do usuário atual
 */
export const useChangePassword = () => {
  return useMutation<void, ApiError, UpdatePasswordDTO>({
    mutationFn: (data) => userService.changePassword(data),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
    },
    onError: (error) => {
      handleApiError(error, "Erro ao alterar senha. Verifique se sua senha atual está correta.");
    },
  });
};