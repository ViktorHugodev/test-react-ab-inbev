import { api } from "../index";
import { AuthResponseDTO, LoginDTO } from "@/types/employee";

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
    return api.get<CurrentUserResponse>("/Auth/me");
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