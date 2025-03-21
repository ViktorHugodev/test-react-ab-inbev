import { api } from "../index";
import {
  Employee,
  PagedResult,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  UpdatePasswordDTO
} from "@/types/employee";

export interface EmployeeFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  department?: string;
  managerId?: string;
}

export const employeeService = {
  /**
   * Get all employees with optional filters and pagination
   */
  getAll: async (filters?: EmployeeFilters): Promise<PagedResult<Employee>> => {
    const {
      pageNumber = 1,
      pageSize = 10,
      searchTerm = "",
      department,
      managerId
    } = filters || {};

    // Constrói os parâmetros da consulta
    const queryParams = new URLSearchParams();
    queryParams.append("pageNumber", pageNumber.toString());
    queryParams.append("pageSize", pageSize.toString());
    if (searchTerm) queryParams.append("searchTerm", searchTerm);
    if (department) queryParams.append("department", department);
    if (managerId) queryParams.append("managerId", managerId);
    
    return api.get<PagedResult<Employee>>(`/Employees?${queryParams.toString()}`);
  },
  
  /**
   * Get an employee by ID
   */
  getById: async (id: string): Promise<Employee> => {
    return api.get<Employee>(`/Employees/${id}`);
  },
  
  /**
   * Create a new employee
   */
  create: async (data: CreateEmployeeDTO): Promise<Employee> => {
    return api.post<Employee>("/Employees", data);
  },
  
  /**
   * Update an existing employee
   */
  update: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    return api.put<Employee>(`/Employees/${id}`, data);
  },
  
  /**
   * Update employee password
   */
  updatePassword: async (id: string, data: UpdatePasswordDTO): Promise<void> => {
    return api.put<void>(`/Employees/${id}/password`, data);
  },
  
  /**
   * Delete an employee
   */
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/Employees/${id}`);
  },
  
  /**
   * Get employees by department
   */
  getByDepartment: async (department: string): Promise<Employee[]> => {
    return api.get<Employee[]>(`/Employees/department/${department}`);
  },
  
  /**
   * Get employees by manager
   */
  getByManager: async (managerId: string): Promise<Employee[]> => {
    return api.get<Employee[]>(`/Employees/manager/${managerId}`);
  },
  
  /**
   * Validate if a document number is unique
   */
  validateDocument: async (document: string): Promise<boolean> => {
    try {
      await api.get<{ isValid: boolean }>(`/Employees/validate-document/${document}`);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Get departments list
   */
  getDepartments: async (): Promise<{ id: string; name: string }[]> => {
    // Here we assume there's a dedicated endpoint for departments
    // If not, this could be modified to extract from employee data
    return api.get<{ id: string; name: string }[]>("/Departments");
  },
  
  /**
   * Get potential managers (employees with Leader or Director role)
   */
  getManagers: async (): Promise<{ id: string; name: string }[]> => {
    // Here we assume there's a dedicated endpoint for managers
    // If not, this could be modified to filter employees by role
    return api.get<{ id: string; name: string }[]>("/Employees/managers");
  }
};