import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../index";
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/types/deparment';
import { departmentService } from '.';

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
 * Get all departments hook
 */
export const useGetDepartments = () => {
  return useQuery<Department[], ApiError>({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Get department by ID hook
 */
export const useGetDepartment = (id: string) => {
  return useQuery<Department, ApiError>({
    queryKey: ["department", id],
    queryFn: () => departmentService.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
};

/**
 * Create department hook
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<Department, ApiError, CreateDepartmentDto>({
    mutationFn: (data) => departmentService.create(data),
    onSuccess: () => {
      toast.success("Departamento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao criar departamento.");
    },
  });
};

/**
 * Update department hook
 */
export const useUpdateDepartment = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<Department, ApiError, UpdateDepartmentDto>({
    mutationFn: (data) => departmentService.update(id, data),
    onSuccess: (updatedDepartment) => {
      toast.success("Departamento atualizado com sucesso!");
      
      // Update specific department query
      queryClient.setQueryData(["department", id], updatedDepartment);
      
      // Invalidate all department lists
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar departamento.");
    },
  });
};

/**
 * Delete department hook
 */
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => departmentService.delete(id),
    onSuccess: () => {
      toast.success("Departamento excluído com sucesso!");
      
      // Invalidate cached data
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao excluir departamento.");
    },
  });
};

export const useGetEmployeesByDepartment = (departmentId: string) => {
  return useQuery<Employee[], ApiError>({
    queryKey: ["employees", "department", departmentId],
    queryFn: () => employeeService.getByDepartment(departmentId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!departmentId, // Only run if departmentId is provided
  });
};