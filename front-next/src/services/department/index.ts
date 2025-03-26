import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/types/deparment';
import { api } from "../index";


export const departmentService = {
 
  getAll: async (): Promise<Department[]> => {
    return api.get<Department[]>("/Departments");
  },
  

  getById: async (id: string): Promise<Department> => {
    return api.get<Department>(`/Departments/${id}`);
  },
  

  create: async (data: CreateDepartmentDto): Promise<Department> => {
    return api.post<Department>("/Departments", data);
  },

  update: async (id: string, data: UpdateDepartmentDto): Promise<Department> => {
    return api.put<Department>(`/Departments/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/Departments/${id}`);
  },
 
};