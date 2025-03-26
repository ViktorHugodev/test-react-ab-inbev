import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeService, EmployeeFilters } from "./index";
import { 
  Employee, 
  CreateEmployeeDTO, 
  UpdateEmployeeDTO, 
  UpdatePasswordDTO,
  PagedResult
} from "@/types/employee";
import { ApiError } from '..';
import { isValidGuid } from '@/lib/utils';

// Interface para o contexto de rollback
interface RollbackContext {
  previousData?: Employee;
  previousDetailedData?: Employee;
}

const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof ApiError) {
    console.error('API Error Details:', error);
    toast.error(`Erro: ${error.message}`);
  } else {
    console.error('Unknown Error:', error);
    toast.error(defaultMessage);
  }
};

export const useGetEmployees = (filters?: EmployeeFilters) => {
  return useQuery<PagedResult<Employee>, ApiError>({
    queryKey: ["employees", filters],
    queryFn: () => employeeService.getEmployees(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetEmployee = (id: string) => {
  return useQuery<Employee, ApiError>({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployeeById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, 
  });
};


export const useGetManagers = () => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["managers"],
    queryFn: () => employeeService.getManagers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Employee, ApiError, CreateEmployeeDTO>({
    mutationFn: (data) => employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao criar funcionário.");
    },
  });
};


export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    Employee, 
    ApiError, 
    { id: string; data: UpdateEmployeeDTO }
  >({
    mutationFn: ({ id, data }) => employeeService.updateEmployee(id, data),
    onSuccess: (updatedEmployee) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", updatedEmployee.id] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar funcionário.");
    },
  });
};

export const useUpdateEmployeeProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    Employee, 
    ApiError, 
    { id: string; data: Partial<UpdateEmployeeDTO> }
  >({
    // Usar o contexto da mutação para implementar optimistic updates
    mutationFn: async ({ id, data }) => {
      try {
        // Implementar um mecanismo de retry com backoff exponencial
        const maxRetries = 3;
        let retryCount = 0;
        let lastError = null;
        
        const executeWithRetry = async (): Promise<Employee> => {
          try {
            // Obter versão mais recente do funcionário antes de atualizar
            const currentEmployee = await employeeService.getEmployeeById(id);
            
            // Preservar os IDs de telefone existentes ou adicionar novos conforme necessário
            let updatedPhoneNumbers = [];
            
            if (data.phoneNumbers && data.phoneNumbers.length > 0) {
              // Mapear por número de telefone para preservar os IDs
              const currentPhoneMap = new Map();
              
              // Indexar os telefones atuais pelo número
              if (currentEmployee.phoneNumbers && currentEmployee.phoneNumbers.length > 0) {
                currentEmployee.phoneNumbers.forEach(phone => {
                  if (phone.id) {
                    currentPhoneMap.set(phone.number, phone.id);
                  }
                });
              }
              
              // Atualizar ou manter os IDs existentes
              updatedPhoneNumbers = data.phoneNumbers.map(phone => {
                // Criar um objeto sem ID
                const phoneObj: any = {
                  number: phone.number,
                  type: phone.type
                };
                
                // Se tiver ID e for uma string válida, incluir no objeto
                if (phone.id && typeof phone.id === 'string' && phone.id.trim() !== '') {
                  // Verificar se é um GUID válido (usando função utilitária)
                  const isValidId = isValidGuid(phone.id.trim());
                  if (isValidId) {
                    phoneObj.id = phone.id.trim();
                  }
                }
                
                return phoneObj;
              });
            } else {
              // Se não houver telefones no payload, manter os existentes
              updatedPhoneNumbers = currentEmployee.phoneNumbers || [];
            }

            const completeData: UpdateEmployeeDTO = {
              id,
              firstName: data.firstName || currentEmployee.firstName,
              lastName: data.lastName || currentEmployee.lastName,
              email: data.email || currentEmployee.email,
              role: data.role || currentEmployee.role,
              department: data.department || currentEmployee.department || "",
              managerId: data.managerId || currentEmployee.managerId,
              birthDate: data.birthDate || currentEmployee.birthDate,
              phoneNumbers: updatedPhoneNumbers
            };

            return employeeService.updateEmployee(id, completeData);
          } catch (error) {
            // Se for um erro de concorrência e ainda não atingimos o número máximo de tentativas
            if (error instanceof ApiError && 
                error.message.includes('concorrência') && 
                retryCount < maxRetries) {
              
              retryCount++;
              lastError = error;
              
              // Aguardar um tempo crescente antes de tentar novamente (backoff exponencial)
              const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
              await new Promise(resolve => setTimeout(resolve, waitTime));
              
              // Tentar novamente
              return executeWithRetry();
            }
            
            // Se não for erro de concorrência ou atingiu máximo de tentativas, propagar o erro
            throw error;
          }
        };
        
        return executeWithRetry();
      } catch (error) {
        console.error("Error in update profile mutation:", error);
        throw error;
      }
    },
    onMutate: async ({ id, data }) => {
      // Cancelar consultas em andamento para evitar sobrescrever nossa atualização otimista
      await queryClient.cancelQueries({ queryKey: ["employee", id] });
      await queryClient.cancelQueries({ queryKey: ["detailedUserInfo"] });
      
      // Guardar o estado anterior para rollback em caso de erro
      const previousData = queryClient.getQueryData(["employee", id]);
      const previousDetailedData = queryClient.getQueryData(["detailedUserInfo"]);
      
      // Retornar o contexto com os dados anteriores para rollback se necessário
      return { previousData, previousDetailedData };
    },
    onSuccess: (updatedEmployee) => {
      // Atualizar o cache com os novos dados
      queryClient.setQueryData(["employee", updatedEmployee.id], updatedEmployee);
      queryClient.setQueryData(["detailedUserInfo"], updatedEmployee);
      
      // Invalidar outras queries relacionadas para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error, _variables, context: RollbackContext) => {
      console.error("Profile update error:", error);
      
      // Restaurar os dados anteriores do cache para rollback em caso de erro
      if (context?.previousData && context.previousDetailedData) {
        queryClient.setQueryData(["employee", _variables.id], context.previousData);
        queryClient.setQueryData(["detailedUserInfo"], context.previousDetailedData);
      }
      
      // Tratar o erro específico
      if (error instanceof ApiError && error.message.includes('concorrência')) {
        toast.error("Erro de concorrência: Outra pessoa pode ter editado os dados. Tente novamente.");
        
        // Recarregar dados atualizados
        queryClient.invalidateQueries({ queryKey: ["employee", _variables.id] });
        queryClient.invalidateQueries({ queryKey: ["detailedUserInfo"] });
      } else {
        handleApiError(error, "Erro ao atualizar perfil.");
      }
    },
    onSettled: (_data, _error, variables) => {
      // Independentemente do resultado (sucesso ou falha), garantir que os dados estejam atualizados
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["detailedUserInfo"] });
    }
  });
};


export const useChangePassword = () => {
  return useMutation<void, ApiError, UpdatePasswordDTO>({
    mutationFn: (data) => employeeService.changePassword(data),
    onError: (error) => {
      handleApiError(error, "Erro ao alterar senha.");
    },
  });
};


export const useUpdateEmployeePassword = () => {
  return useMutation<void, ApiError, UpdatePasswordDTO>({
    mutationFn: (data) => employeeService.changePassword(data),
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar senha. Verifique se sua senha atual está correta.");
    },
  });
};


export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao excluir funcionário.");
    },
  });
};

/**
 * Get employees by department hook
 */
export const useGetEmployeesByDepartment = (departmentId: string) => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["employees", "department", departmentId],
    queryFn: () => employeeService.getByDepartment(departmentId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!departmentId,
  });
};