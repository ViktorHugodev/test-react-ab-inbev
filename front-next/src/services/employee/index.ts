import { api } from "../api";
import { 
  Employee, 
  EmployeeRole, 
  CreateEmployeeDTO, 
  UpdateEmployeeDTO, 
  UpdatePasswordDTO, 
  PagedResult 
} from "@/types/employee";

export interface EmployeeFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  department?: string;
  managerId?: string;
}

// Adapta os dados do funcionário da API para o formato esperado pela UI
const adaptEmployee = (apiEmployee: any): Employee => {
  // Verifica se já está no formato esperado
  if (apiEmployee.firstName && apiEmployee.lastName) {
    return apiEmployee as Employee;
  }
  
  // Se temos só fullName, extraímos o primeiro e último nome
  if (apiEmployee.fullName) {
    const nameParts = apiEmployee.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    return {
      ...apiEmployee,
      firstName,
      lastName
    } as Employee;
  }
  
  // Caso não tenhamos nenhum dos dois, retornamos como está
  return apiEmployee as Employee;
};

// Adapta a resposta da API para o formato esperado pela UI
const adaptEmployeeResponse = (apiResponse: any): PagedResult<Employee> => {
  // Verifica se é uma lista simples ou uma resposta paginada
  if (Array.isArray(apiResponse)) {
    const adaptedEmployees = apiResponse.map(adaptEmployee);
    
    return {
      items: adaptedEmployees,
      totalCount: adaptedEmployees.length,
      pageNumber: 1,
      pageSize: adaptedEmployees.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
  }
  
  // Caso já seja uma resposta paginada
  return {
    ...apiResponse,
    items: apiResponse.items.map(adaptEmployee)
  };
};

export const employeeService = {
  /**
   * Get all employees with filters
   */
  getEmployees: async (filters?: EmployeeFilters): Promise<PagedResult<Employee>> => {
    // Verifica se temos filtros para usar paginação ou não
    if (filters && Object.keys(filters).length > 0) {
      const params = new URLSearchParams();
      
      if (filters.pageNumber) params.append("pageNumber", filters.pageNumber.toString());
      if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
      if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
      if (filters.department) params.append("department", filters.department);
      if (filters.managerId) params.append("managerId", filters.managerId);
      
      const response = await api.get<any>(`/Employees/paged?${params.toString()}`);
      return adaptEmployeeResponse(response);
    }
    
    // Sem filtros, buscamos todos
    const response = await api.get<any>('/Employees');
    return adaptEmployeeResponse(response);
  },
  
  /**
   * Get employee by ID
   */
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await api.get<any>(`/Employees/${id}`);
    return adaptEmployee(response);
  },
  
  /**
   * Get managers (Leaders and Directors)
   */
  getManagers: async (): Promise<Employee[]> => {
    const response = await api.get<any>('/Employees/leaders-directors');
    return Array.isArray(response) ? response.map(adaptEmployee) : [];
  },
  
  /**
   * Create a new employee
   */
  createEmployee: async (data: CreateEmployeeDTO): Promise<Employee> => {
    const response = await api.post<any>('/Employees', data);
    return adaptEmployee(response);
  },
  
  /**
   * Update an existing employee
   */
  updateEmployee: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    const response = await api.put<any>(`/Employees/${id}`, data);
    return adaptEmployee(response);
  },
  
  /**
   * Change employee password
   */
  changePassword: async (data: UpdatePasswordDTO): Promise<void> => {
    await api.put<void>(`/Employees/${data.employeeId}/password`, data);
  },
  
  /**
   * Delete an employee
   */
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete<void>(`/Employees/${id}`);
  },
   /**
   * Get employees by department
   */
   getByDepartment: async (departmentId: string): Promise<Employee[]> => {
    const response = await api.get<any>(`/Employees/department/${departmentId}`);
    return Array.isArray(response) ? response.map(adaptEmployee) : [];
  },
};