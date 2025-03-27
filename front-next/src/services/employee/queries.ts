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
    staleTime: 1000 * 60 * 5, 
  });
};

export const useGetEmployee = (id: string) => {
  return useQuery<Employee, ApiError>({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployeeById(id),
    staleTime: 1000 * 60 * 5, 
    enabled: !!id, 
  });
};


export const useGetManagers = () => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["managers"],
    queryFn: () => employeeService.getManagers(),
    staleTime: 1000 * 60 * 5, 
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
    
    mutationFn: async ({ id, data }) => {
      try {
        
        const maxRetries = 3;
        let retryCount = 0;
        let lastError = null;
        
        const executeWithRetry = async (): Promise<Employee> => {
          try {
            
            const currentEmployee = await employeeService.getEmployeeById(id);
            
            
            let updatedPhoneNumbers = [];
            
            if (data.phoneNumbers && data.phoneNumbers.length > 0) {
              
              const currentPhoneMap = new Map();
              
              
              if (currentEmployee.phoneNumbers && currentEmployee.phoneNumbers.length > 0) {
                currentEmployee.phoneNumbers.forEach(phone => {
                  if (phone.id) {
                    currentPhoneMap.set(phone.number, phone.id);
                  }
                });
              }
              
              
              updatedPhoneNumbers = data.phoneNumbers.map(phone => {
                
                const phoneObj: any = {
                  number: phone.number,
                  type: phone.type
                };
                
                
                if (phone.id && typeof phone.id === 'string' && phone.id.trim() !== '') {
                  
                  const isValidId = isValidGuid(phone.id.trim());
                  if (isValidId) {
                    phoneObj.id = phone.id.trim();
                  }
                }
                
                return phoneObj;
              });
            } else {
              
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
            
            if (error instanceof ApiError && 
                error.message.includes('concorrência') && 
                retryCount < maxRetries) {
              
              retryCount++;
              lastError = error;
              
              
              const waitTime = Math.pow(2, retryCount) * 1000; 
              await new Promise(resolve => setTimeout(resolve, waitTime));
              
              
              return executeWithRetry();
            }
            
            
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
      
      await queryClient.cancelQueries({ queryKey: ["employee", id] });
      await queryClient.cancelQueries({ queryKey: ["detailedUserInfo"] });
      
      
      const previousData = queryClient.getQueryData(["employee", id]);
      const previousDetailedData = queryClient.getQueryData(["detailedUserInfo"]);
      
      
      return { previousData, previousDetailedData };
    },
    onSuccess: (updatedEmployee) => {
      
      queryClient.setQueryData(["employee", updatedEmployee.id], updatedEmployee);
      queryClient.setQueryData(["detailedUserInfo"], updatedEmployee);
      
      
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error, _variables, context) => {
      console.error("Profile update error:", error);
      
      // Type assertion for the context
      const typedContext = context as RollbackContext | undefined;
      
      if (typedContext?.previousData && typedContext.previousDetailedData) {
        queryClient.setQueryData(["employee", _variables.id], typedContext.previousData);
        queryClient.setQueryData(["detailedUserInfo"], typedContext.previousDetailedData);
      }
      
      
      if (error instanceof ApiError && error.message.includes('concorrência')) {
        toast.error("Erro de concorrência: Outra pessoa pode ter editado os dados. Tente novamente.");
        
        
        queryClient.invalidateQueries({ queryKey: ["employee", _variables.id] });
        queryClient.invalidateQueries({ queryKey: ["detailedUserInfo"] });
      } else {
        handleApiError(error, "Erro ao atualizar perfil.");
      }
    },
    onSettled: (_data, _error, variables) => {
      
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


export const useGetEmployeesByDepartment = (departmentId: string) => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["employees", "department", departmentId],
    queryFn: () => employeeService.getByDepartment(departmentId),
    staleTime: 1000 * 60 * 5, 
    enabled: !!departmentId,
  });
};