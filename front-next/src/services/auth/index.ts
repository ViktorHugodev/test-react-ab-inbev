import { api } from "../index";
import { AuthResponseDTO, Employee, LoginDTO } from "@/types/employee";

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  
  login: async (credentials: LoginDTO): Promise<AuthResponseDTO> => {
    return api.post<AuthResponseDTO>("/auth/login", credentials);
  },
  
  
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    
    return api.get<CurrentUserResponse>("/Auth/me");
  },
  
  
  getDetailedUserInfo: async (): Promise<Employee | CurrentUserResponse> => {
    try {
      
      const basicUserInfo = await api.get<CurrentUserResponse>("/Auth/me");
      
      if (basicUserInfo && basicUserInfo.id) {
        
        try {
          const employeeData = await api.get<Employee>(`/Employees/${basicUserInfo.id}`);
          
          if (!employeeData.id) {
            employeeData.id = basicUserInfo.id;
          }
          if (!employeeData.email) {
            employeeData.email = basicUserInfo.email;
          }
          return employeeData;
        } catch (error) {
          console.error("Erro ao buscar dados completos do usuário:", error);
          return basicUserInfo;
        }
      }
      
      return basicUserInfo;
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      throw error;
    }
  },
  
  
  saveToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("auth_token", token);
    }
  },
  
  
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("auth_token");
    }
    return null;
  },
  
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_token");
    }
  },
  
  
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
  
  
  logout: (): void => {
    authService.removeToken();
  }
};