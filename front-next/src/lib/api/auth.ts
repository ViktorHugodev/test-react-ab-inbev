import { api } from "@/services/api";
import { AuthResponseDTO, LoginDTO, RegisterEmployeeDTO, EmployeeRole, Employee } from "@/types/employee";

// Simula um erro de rede ou servidor
const simulateNetworkDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function loginUser(credentials: LoginDTO): Promise<AuthResponseDTO> {
  try {

    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await simulateNetworkDelay(Math.floor(Math.random() * 500) + 300);
      
      // Credenciais de administrador
      if (credentials.email === "admin@companymanager.com" && credentials.password === "Admin@123") {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas depois
        
        return {
          token: "mock-admin-jwt-token",
          expiresAt: expiresAt.toISOString(),
          employee: {
            id: "admin-123",
            firstName: "Administrador",
            lastName: "Sistema",
            fullName: "Administrador Sistema",
            email: credentials.email,
            documentNumber: "98765432100",
            birthDate: new Date("1985-01-01"),
            age: 40,
            role: 3, // Director (Administrador)
            department: "Diretoria",
            phoneNumbers: [
              { id: "1", number: "11988888888", type: 1 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }

      if (credentials.email === "test@example.com" && credentials.password === "password123") {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas depois
        
        return {
          token: "mock-jwt-token",
          expiresAt: expiresAt.toISOString(),
          employee: {
            id: "123",
            firstName: "Usuário",
            lastName: "Teste",
            fullName: "Usuário Teste",
            email: credentials.email,
            documentNumber: "12345678900",
            birthDate: new Date("1990-01-01"),
            age: 33,
            role: 2, // Leader
            department: "TI",
            phoneNumbers: [
              { id: "1", number: "11999999999", type: 1 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }
      
      throw new Error("Email ou senha inválidos");
    }
    

    return await api.post<AuthResponseDTO>("/Auth/login", credentials);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  try {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await simulateNetworkDelay(Math.floor(Math.random() * 300) + 200);
      
      // Verificar se o token é do administrador (simulação)
      const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
      
      if (token === "mock-admin-jwt-token") {
        return {
          id: "admin-123",
          email: "admin@companymanager.com",
          name: "Administrador Sistema",
          role: "Director"
        };
      }
      
      return {
        id: "123",
        email: "test@example.com",
        name: "Usuário Teste",
        role: "Leader"
      };
    }
    
    return await api.get<CurrentUserResponse>("/Auth/me");
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    throw error;
  }
}


export async function registerEmployee(employeeData: RegisterEmployeeDTO): Promise<Employee> {
  try {
 
    const currentUser = await getCurrentUser();
    
    if (parseInt(currentUser.role) !== EmployeeRole.Director) {
      throw new Error("Apenas Diretores podem registrar novos funcionários");
    }
    
  
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await simulateNetworkDelay(Math.floor(Math.random() * 800) + 500);
      

      if (!employeeData.email.endsWith('@nossaempresa.com')) {
        throw new Error("O email deve ser corporativo (@nossaempresa.com)");
      }
      
      // Simula um registro bem-sucedido
      return {
        id: Math.random().toString(36).substring(2, 15),
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        documentNumber: employeeData.documentNumber,
        birthDate: new Date(),
        role: employeeData.role,
        department: employeeData.department,
        phoneNumbers: employeeData.phoneNumbers,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    

    const apiPayload = {
      ...employeeData,
      birthDate: new Date().toISOString()
    };
    
    return await api.post<Employee>("/Auth/register", apiPayload);
  } catch (error) {
    console.error("Erro ao registrar funcionário:", error);
    throw error;
  }
}