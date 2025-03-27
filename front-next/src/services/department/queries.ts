import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../index";
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/types/deparment';
import { departmentService } from '.';

const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error(defaultMessage);
  }
  console.error(error);
};


export const useGetDepartments = () => {
  return useQuery<Department[], ApiError>({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    staleTime: 1000 * 60 * 15, 
  });
};


export const useGetDepartment = (id: string) => {
  return useQuery<Department, ApiError>({
    queryKey: ["department", id],
    queryFn: () => departmentService.getById(id),
    staleTime: 1000 * 60 * 5, 
    enabled: !!id,
  });
};


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


export const useUpdateDepartment = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<Department, ApiError, UpdateDepartmentDto>({
    mutationFn: (data) => departmentService.update(id, data),
    onSuccess: (updatedDepartment) => {
      toast.success("Departamento atualizado com sucesso!");
      
      queryClient.setQueryData(["department", id], updatedDepartment);
      
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao atualizar departamento.");
    },
  });
};


export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id) => departmentService.delete(id),
    onSuccess: () => {
      toast.success("Departamento excluído com sucesso!");
      
      
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error) => {
      handleApiError(error, "Erro ao excluir departamento.");
    },
  });
};

