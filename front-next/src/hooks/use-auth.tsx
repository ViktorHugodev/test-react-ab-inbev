"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { EmployeeRole, AuthResponseDTO, LoginDTO } from "@/types/employee";
import { loginUser, getCurrentUser, CurrentUserResponse } from "@/lib/api/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canCreateRole: (role: EmployeeRole) => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  canCreateRole: () => false,
});

interface AuthProviderProps {
  children: React.ReactNode;
  mockRole?: EmployeeRole;
}

// Convert string role to enum
const convertStringRoleToEnum = (role: string): EmployeeRole => {
  if (role === "Director") return EmployeeRole.Director;
  if (role === "Leader") return EmployeeRole.Leader;
  return EmployeeRole.Employee;
};

// Provider component to wrap app
export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children,
  mockRole = EmployeeRole.Leader // Allow overriding the mock role for testing
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  
  // Check for auth token once on component mount
  useEffect(() => {
    // Skip if we already checked
    if (authChecked) return;
    
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
        
        if (token) {
          try {
            // Fetch user info from the backend
            const userData: CurrentUserResponse = await getCurrentUser();
            
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: convertStringRoleToEnum(userData.role)
            });
          } catch (error) {
            console.error("Error fetching user data:", error);
            // Token inválido ou expirado, limpar
            if (typeof window !== 'undefined') {
              localStorage.removeItem("auth_token");
            }
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [authChecked]);
  
  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const authResponse: AuthResponseDTO = await loginUser({ email, password });
      
      // Salvar token
      if (typeof window !== 'undefined') {
        localStorage.setItem("auth_token", authResponse.token);
      }
      
      // Extrair informações do usuário
      const userData = authResponse.employee;
      
      setUser({
        id: userData.id!,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("auth_token");
    }
    setUser(null);
  };
  
  // Function to check if user can create a role based on hierarchy
  const canCreateRole = (role: EmployeeRole): boolean => {
    if (!user) return false;
    
    // Role hierarchy check
    const roleHierarchy: Record<EmployeeRole, number> = {
      [EmployeeRole.Director]: 3,
      [EmployeeRole.Leader]: 2,
      [EmployeeRole.Employee]: 1
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[role];
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, canCreateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth in components
export const useAuth = (): AuthContextType => useContext(AuthContext);