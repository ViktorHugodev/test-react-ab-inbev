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
    enabled: !!id, // Only run if id is provided
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
    mutationFn: async ({ id, data }) => {
      try {
        const currentEmployee = await employeeService.getEmployeeById(id);
     
        

        const completeData: UpdateEmployeeDTO = {
          id,
          firstName: data.firstName || currentEmployee.firstName,
          lastName: data.lastName || currentEmployee.lastName,
          email: data.email || currentEmployee.email,
          role: data.role || currentEmployee.role,
          department: data.department || currentEmployee.department || "",
          managerId: data.managerId || currentEmployee.managerId,
          birthDate: data.birthDate || currentEmployee.birthDate,
          phoneNumbers: data.phoneNumbers || currentEmployee.phoneNumbers || []
        };

        return employeeService.updateEmployee(id, completeData);
      } catch (error) {
        console.error("Error in update profile mutation:", error);
        throw error;
      }
    },
    onSuccess: (updatedEmployee) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["employee", updatedEmployee.id] });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      handleApiError(error, "Erro ao atualizar perfil.");
    },
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