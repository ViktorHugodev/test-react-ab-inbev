import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/types/deparment';
import { api } from "../index";
import { Employee } from '@/types/employee';



export const departmentService = {
  /**
   * Get all departments
   */
  getAll: async (): Promise<Department[]> => {
    return api.get<Department[]>("/Departments");
  },
  
  /**
   * Get department by ID
   */
  getById: async (id: string): Promise<Department> => {
    return api.get<Department>(`/Departments/${id}`);
  },
  
  /**
   * Create a new department
   */
  create: async (data: CreateDepartmentDto): Promise<Department> => {
    return api.post<Department>("/Departments", data);
  },
  
  /**
   * Update an existing department
   */
  update: async (id: string, data: UpdateDepartmentDto): Promise<Department> => {
    return api.put<Department>(`/Departments/${id}`, data);
  },
  
  /**
   * Delete a department
   */
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/Departments/${id}`);
  },
 
};