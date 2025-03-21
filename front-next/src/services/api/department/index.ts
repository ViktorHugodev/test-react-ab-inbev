import { api } from "../index";

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDepartmentDTO {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDTO {
  name: string;
  description?: string;
}

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
  create: async (data: CreateDepartmentDTO): Promise<Department> => {
    return api.post<Department>("/Departments", data);
  },
  
  /**
   * Update an existing department
   */
  update: async (id: string, data: UpdateDepartmentDTO): Promise<Department> => {
    return api.put<Department>(`/Departments/${id}`, data);
  },
  
  /**
   * Delete a department
   */
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/Departments/${id}`);
  },
};