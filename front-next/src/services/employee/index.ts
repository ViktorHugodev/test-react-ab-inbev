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


const adaptEmployee = (apiEmployee: any): Employee => {

  if (apiEmployee.firstName && apiEmployee.lastName) {
    return apiEmployee as Employee;
  }
  
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

  return apiEmployee as Employee;
};

const adaptEmployeeResponse = (apiResponse: any): PagedResult<Employee> => {
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
  
    return {
    ...apiResponse,
    items: apiResponse.items.map(adaptEmployee)
  };
};

export const employeeService = {
  getEmployees: async (filters?: EmployeeFilters): Promise<PagedResult<Employee>> => {
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
  

  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await api.get<any>(`/Employees/${id}`);
    return adaptEmployee(response);
  },

  getManagers: async (): Promise<Employee[]> => {
    const response = await api.get<any>('/Employees/leaders-directors');
    return Array.isArray(response) ? response.map(adaptEmployee) : [];
  },

  createEmployee: async (data: CreateEmployeeDTO): Promise<Employee> => {
    const response = await api.post<any>('/Employees', data);
    return adaptEmployee(response);
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    const response = await api.put<any>(`/Employees/${id}`, data);
    return adaptEmployee(response);
  },
  

  changePassword: async (data: UpdatePasswordDTO): Promise<void> => {
    await api.put<void>(`/Employees/${data.employeeId}/password`, data);
  },
  
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete<void>(`/Employees/${id}`);
  },

 getByDepartment: async (departmentId: string): Promise<Employee[]> => {
  try {

    const department = await api.get<any>(`/Departments/${departmentId}`);
    
    if (!department || !department.name) {
      console.error("Departamento não encontrado ou sem nome");
      return [];
    }
    
    const response = await api.get<any>(`/Employees/department/${department.name}`);
    return Array.isArray(response) ? response.map(adaptEmployee) : [];
  } catch (error) {
    console.error("Erro ao buscar funcionários por departamento:", error);
    return [];
  }
},
};