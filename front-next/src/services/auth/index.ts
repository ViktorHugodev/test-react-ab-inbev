import { api } from "../index";
import { AuthResponseDTO, Employee, LoginDTO } from "@/types/employee";

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  /**
   * Login user and get JWT token
   */
  login: async (credentials: LoginDTO): Promise<AuthResponseDTO> => {
    return api.post<AuthResponseDTO>("/Auth/login", credentials);
  },
  
  /**
   * Get currently authenticated user info
   */
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    // Busca apenas as informações básicas do usuário
    return api.get<CurrentUserResponse>("/Auth/me");
  },
  
  /**
   * Get detailed user info with employee data
   */
  getDetailedUserInfo: async (): Promise<Employee | CurrentUserResponse> => {
    try {
      // Primeiro tenta obter o ID do usuário atual pelo endpoint /Auth/me
      const basicUserInfo = await api.get<CurrentUserResponse>("/Auth/me");
      
      if (basicUserInfo && basicUserInfo.id) {
        // Se tiver ID, busca informações completas pelo endpoint /Employees/{id}
        try {
          const employeeData = await api.get<Employee>(`/Employees/${basicUserInfo.id}`);
          // Certifique-se de que o empregado tem pelo menos o ID e email
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
  
  /**
   * Save JWT token to localStorage
   */
  saveToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("auth_token", token);
    }
  },
  
  /**
   * Get JWT token from localStorage
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("auth_token");
    }
    return null;
  },
  
  /**
   * Remove JWT token from localStorage
   */
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_token");
    }
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
  
  /**
   * Logout user
   */
  logout: (): void => {
    authService.removeToken();
  }
};