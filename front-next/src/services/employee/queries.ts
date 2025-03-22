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
 * Get all employees hook with optional filters
 */
export const useGetEmployees = (filters?: EmployeeFilters) => {
  return useQuery<PagedResult<Employee>, ApiError>({
    queryKey: ["employees", filters],
    queryFn: () => employeeService.getEmployees(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get employee by ID hook
 */
export const useGetEmployee = (id: string) => {
  return useQuery<Employee, ApiError>({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployeeById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
};

/**
 * Get managers (Leaders and Directors) hook
 */
export const useGetManagers = () => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["employees", "managers"],
    queryFn: () => employeeService.getManagers(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Create employee hook
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<Employee, ApiError, CreateEmployeeDTO>({
    mutationFn: (data) => employeeService.createEmployee(data),
    onSuccess: () => {
      toast.success("Funcionário criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao criar funcionário.");
    },
  });
};

/**
 * Update employee hook
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<Employee, ApiError, { id: string; data: UpdateEmployeeDTO }>({
    mutationFn: ({ id, data }) => employeeService.updateEmployee(id, data),
    onSuccess: (updatedEmployee) => {
      toast.success("Funcionário atualizado com sucesso!");
      
      // Update specific employee query
      queryClient.setQueryData(["employee", updatedEmployee.id], updatedEmployee);
      
      // Invalidate all employee lists
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar funcionário.");
    },
  });
};

/**
 * Change employee password hook
 */
export const useChangePassword = () => {
  return useMutation<void, ApiError, UpdatePasswordDTO>({
    mutationFn: (data) => employeeService.changePassword(data),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
    },
    onError: (error) => {
      handleApiError(error, "Erro ao alterar senha.");
    },
  });
};

/**
 * Delete employee hook
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast.success("Funcionário excluído com sucesso!");
      
      // Invalidate cached data
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!departmentId, // Only run if departmentId is provided
    retry: 1, // Limita o número de tentativas para evitar muitas chamadas em caso de erro
  });
};