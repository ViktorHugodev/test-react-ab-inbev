import { api } from "@/services/api";
import { 
  CreateEmployeeDTO, 
  Employee, 
  EmployeeRole, 
  PagedResult, 
  UpdateEmployeeDTO,
  UpdatePasswordDTO
} from "@/types/employee";

// Mock delay for testing
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock para validação de documento
const isDocumentUnique = async (document: string): Promise<boolean> => {
  // Em uma aplicação real, isso seria uma chamada à API
  await mockDelay(500);
  
  // Para testes, considere apenas estes documentos como "já em uso"
  const takenDocuments = ["12345678900", "98765432100"];
  return !takenDocuments.includes(document);
};

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(800);
      return mockEmployees;
    }
    
    return api.get<Employee[]>("/Employees");
  },
  
  getPaged: async (
    pageNumber = 1, 
    pageSize = 10, 
    searchTerm = "", 
    department?: string, 
    managerId?: string
  ): Promise<PagedResult<Employee>> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(800);
      
      const filteredItems = mockEmployees.filter(e => {
        const matchesSearch = searchTerm ? 
          (e.firstName + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
          e.email.toLowerCase().includes(searchTerm.toLowerCase()) : 
          true;
          
        const matchesDepartment = department ? 
          e.department.toLowerCase() === department.toLowerCase() : 
          true;
          
        const matchesManager = managerId ? 
          e.managerId === managerId : 
          true;
          
        return matchesSearch && matchesDepartment && matchesManager;
      });
      
      const totalCount = filteredItems.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (pageNumber - 1) * pageSize;
      const items = filteredItems.slice(startIndex, startIndex + pageSize);
      
      return {
        items,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber < totalPages
      };
    }
    
    // Constrói os parâmetros da consulta
    const queryParams = new URLSearchParams();
    queryParams.append("pageNumber", pageNumber.toString());
    queryParams.append("pageSize", pageSize.toString());
    if (searchTerm) queryParams.append("searchTerm", searchTerm);
    if (department) queryParams.append("department", department);
    if (managerId) queryParams.append("managerId", managerId);
    
    return api.get<PagedResult<Employee>>(`/Employees/paged?${queryParams.toString()}`);
  },
  
  getById: async (id: string): Promise<Employee> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(500);
      const employee = mockEmployees.find(e => e.id === id);
      if (!employee) throw new Error("Funcionário não encontrado");
      return employee;
    }
    
    return api.get<Employee>(`/Employees/${id}`);
  },
  
  getByDepartment: async (department: string): Promise<Employee[]> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(500);
      return mockEmployees.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }
    
    return api.get<Employee[]>(`/Employees/department/${department}`);
  },
  
  getByManager: async (managerId: string): Promise<Employee[]> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(500);
      return mockEmployees.filter(e => e.managerId === managerId);
    }
    
    return api.get<Employee[]>(`/Employees/manager/${managerId}`);
  },
  
  create: async (employeeData: CreateEmployeeDTO): Promise<Employee> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(1000);
      
      // Verifica se o documento é único
      const isUnique = await isDocumentUnique(employeeData.documentNumber);
      if (!isUnique) {
        throw new Error("Documento já cadastrado no sistema");
      }
      
      // Simula criação do funcionário
      const newEmployee: Employee = {
        id: Math.random().toString(36).substring(2, 9),
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        fullName: `${employeeData.firstName} ${employeeData.lastName}`,
        email: employeeData.email,
        documentNumber: employeeData.documentNumber,
        birthDate: new Date(employeeData.birthDate),
        role: employeeData.role,
        department: employeeData.department,
        managerId: employeeData.managerId,
        phoneNumbers: employeeData.phoneNumbers.map(p => ({
          id: Math.random().toString(36).substring(2, 9),
          number: p.number,
          type: p.type
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Adicionar ao mock
      mockEmployees.push(newEmployee);
      
      return newEmployee;
    }
    
    return api.post<Employee>("/Employees", employeeData);
  },
  
  update: async (employeeData: UpdateEmployeeDTO): Promise<Employee> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(1000);
      
      const index = mockEmployees.findIndex(e => e.id === employeeData.id);
      if (index === -1) throw new Error("Funcionário não encontrado");
      
      // Atualiza o funcionário
      const updatedEmployee: Employee = {
        ...mockEmployees[index],
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        fullName: `${employeeData.firstName} ${employeeData.lastName}`,
        email: employeeData.email,
        birthDate: new Date(employeeData.birthDate),
        role: employeeData.role,
        department: employeeData.department,
        managerId: employeeData.managerId,
        phoneNumbers: employeeData.phoneNumbers.map(p => ({
          id: p.id || Math.random().toString(36).substring(2, 9),
          number: p.number,
          type: p.type
        })),
        updatedAt: new Date(),
      };
      
      mockEmployees[index] = updatedEmployee;
      
      return updatedEmployee;
    }
    
    return api.put<Employee>(`/Employees/${employeeData.id}`, employeeData);
  },
  
  updatePassword: async (passwordData: UpdatePasswordDTO): Promise<boolean> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(800);
      
      // Simula a validação da senha atual
      if (passwordData.currentPassword !== "password123") {
        throw new Error("Senha atual incorreta");
      }
      
      // Simula a validação das senhas
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        throw new Error("As senhas não coincidem");
      }
      
      // Simula validação de complexidade
      if (passwordData.newPassword.length < 8) {
        throw new Error("A nova senha deve ter pelo menos 8 caracteres");
      }
      
      return true;
    }
    
    await api.put<void>(`/Employees/${passwordData.employeeId}/password`, passwordData);
    return true;
  },
  
  delete: async (id: string): Promise<boolean> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(800);
      
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) throw new Error("Funcionário não encontrado");
      
      // Verifica se tem subordinados
      const hasSubordinates = mockEmployees.some(e => e.managerId === id);
      if (hasSubordinates) {
        throw new Error("Não é possível excluir funcionário que possui subordinados");
      }
      
      // Remove o funcionário
      mockEmployees.splice(index, 1);
      
      return true;
    }
    
    await api.delete<void>(`/Employees/${id}`);
    return true;
  },
  
  validateDocument: async (document: string): Promise<boolean> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      return isDocumentUnique(document);
    }
    
    // Em produção, chama o endpoint de validação
    try {
      await api.get<{ isValid: boolean }>(`/Employees/validate-document/${document}`);
      return true;
    } catch {
      return false;
    }
  },
  
  getDepartments: async (): Promise<{ id: string; name: string }[]> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(300);
      return mockDepartments;
    }
    
    // No backend real, pode haver um endpoint específico para departamentos
    // ou você pode extrair dos funcionários
    const employees = await api.get<Employee[]>("/Employees");
    // Create a unique list of departments without using spread on Set
    const departmentSet = new Set<string>();
    employees.forEach(e => departmentSet.add(e.department));
    const departments = Array.from(departmentSet);
    return departments.map(name => ({ id: name, name }));
  },
  
  getManagers: async (): Promise<{ id: string; name: string }[]> => {
    // Em desenvolvimento, usando mock ou API real dependendo da configuração
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      await mockDelay(300);
      return mockEmployees
        .filter(e => e.role !== EmployeeRole.Employee)
        .map(e => ({ 
          id: e.id!,
          name: e.fullName || `${e.firstName} ${e.lastName}`
        }));
    }
    
    // No backend real, poderia haver um endpoint específico para gerentes
    const employees = await api.get<Employee[]>("/Employees");
    return employees
      .filter(e => e.role !== EmployeeRole.Employee)
      .map(e => ({ 
        id: e.id!, 
        name: e.fullName || `${e.firstName} ${e.lastName}`
      }));
  }
};

// Mock data para desenvolvimento
const mockDepartments = [
  { id: "TI", name: "TI" },
  { id: "RH", name: "RH" },
  { id: "Marketing", name: "Marketing" },
  { id: "Financeiro", name: "Financeiro" },
  { id: "Operações", name: "Operações" },
];

const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "john.doe@company.com",
    documentNumber: "12345678900",
    birthDate: new Date("1985-05-15"),
    age: 38,
    role: EmployeeRole.Director,
    department: "TI",
    phoneNumbers: [
      { id: "1", number: "11999999999", type: 1 },
    ],
    createdAt: new Date("2022-01-10"),
    updatedAt: new Date("2022-01-10"),
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    fullName: "Jane Smith",
    email: "jane.smith@company.com",
    documentNumber: "98765432100",
    birthDate: new Date("1990-10-20"),
    age: 33,
    role: EmployeeRole.Leader,
    department: "RH",
    managerId: "1",
    managerName: "John Doe",
    phoneNumbers: [
      { id: "2", number: "11988888888", type: 1 },
      { id: "3", number: "1140001111", type: 3 },
    ],
    createdAt: new Date("2022-03-15"),
    updatedAt: new Date("2022-03-15"),
  },
];