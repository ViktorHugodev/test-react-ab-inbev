import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeService, EmployeeFilters } from "./index";
import { 
  CreateEmployeeDTO, 
  UpdateEmployeeDTO, 
  UpdatePasswordDTO,
  Employee,
  PagedResult
} from "@/types/employee";
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
 * Get all employees hook with pagination and filtering
 */
export const useGetEmployees = (filters: EmployeeFilters = {}) => {
  return useQuery<PagedResult<Employee>, ApiError>({
    queryKey: ["employees", filters],
    queryFn: () => employeeService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get employee by ID hook
 */
export const useGetEmployee = (id: string) => {
  return useQuery<Employee, ApiError>({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
};

/**
 * Create employee hook
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<Employee, ApiError, CreateEmployeeDTO>({
    mutationFn: (data) => employeeService.create(data),
    onSuccess: () => {
      toast.success("Funcionário cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao cadastrar funcionário.");
    },
  });
};

/**
 * Update employee hook
 */
export const useUpdateEmployee = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<Employee, ApiError, UpdateEmployeeDTO>({
    mutationFn: (data) => employeeService.update(id, data),
    onSuccess: (updatedEmployee) => {
      toast.success("Funcionário atualizado com sucesso!");
      
      // Update specific employee query
      queryClient.setQueryData(["employee", id], updatedEmployee);
      
      // Invalidate all employee lists that might include this employee
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar funcionário.");
    },
  });
};

/**
 * Update employee password hook
 */
export const useUpdateEmployeePassword = (id: string) => {
  return useMutation<void, ApiError, UpdatePasswordDTO>({
    mutationFn: (data) => employeeService.updatePassword(id, data),
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso!");
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar senha.");
    },
  });
};

/**
 * Delete employee hook
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => employeeService.delete(id),
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

/**
 * Get employees by department hook
 */
export const useGetEmployeesByDepartment = (department: string) => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["employees", "department", department],
    queryFn: () => employeeService.getByDepartment(department),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!department, // Only run if department is provided
  });
};

/**
 * Get employees by manager hook
 */
export const useGetEmployeesByManager = (managerId: string) => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["employees", "manager", managerId],
    queryFn: () => employeeService.getByManager(managerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!managerId, // Only run if managerId is provided
  });
};

/**
 * Validate document uniqueness hook
 */
export const useValidateDocument = (documentNumber: string) => {
  return useQuery<boolean, ApiError>({
    queryKey: ["validate-document", documentNumber],
    queryFn: () => employeeService.validateDocument(documentNumber),
    enabled: documentNumber.length >= 8, // Only validate when document has sufficient length
    staleTime: 0, // Always check freshly
  });
};

/**
 * Get departments hook
 */
export const useGetDepartments = () => {
  return useQuery<{ id: string; name: string }[], ApiError>({
    queryKey: ["departments"],
    queryFn: () => employeeService.getDepartments(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Get managers hook
 */
export const useGetManagers = () => {
  return useQuery<{ id: string; name: string }[], ApiError>({
    queryKey: ["managers"],
    queryFn: () => employeeService.getManagers(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};