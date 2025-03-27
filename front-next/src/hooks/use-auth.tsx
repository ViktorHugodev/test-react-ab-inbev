"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { EmployeeRole, AuthResponseDTO, LoginDTO, RegisterEmployeeDTO, Employee } from "@/types/employee";
import { loginUser, getCurrentUser, CurrentUserResponse, registerEmployee as apiRegisterEmployee } from "@/lib/api/auth";
import { clearAuthToken } from "@/lib/token-sync";
import Cookies from "js-cookie";

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
  registerEmployee: (employeeData: RegisterEmployeeDTO) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  canCreateRole: () => false,
  registerEmployee: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
  mockRole?: EmployeeRole;
}

const convertRoleToEnum = (role: string | number): EmployeeRole => {
  if (typeof role === 'number') {
    if (Object.values(EmployeeRole).includes(role)) {
      return role as EmployeeRole;
    }
    console.warn(`Valor de role inválido recebido: ${role}, usando Employee como fallback`);
    return EmployeeRole.Employee;
  }
  
  if (role === "Director") return EmployeeRole.Director;
  if (role === "Leader") return EmployeeRole.Leader;
  return EmployeeRole.Employee;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children,
  mockRole = EmployeeRole.Leader
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  
  useEffect(() => {
    if (authChecked) return;
    
    const checkAuth = async () => {
      try {
        let token = null;
        
        if (typeof window !== 'undefined') {
          token = localStorage.getItem("auth_token");
        }
        
        if (token) {
          try {
            const userData: CurrentUserResponse = await getCurrentUser();
            
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: convertRoleToEnum(userData.role)
            });
          } catch (error) {
            console.error("Error fetching user data:", error);
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
    
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [authChecked]);
  
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const authResponse: AuthResponseDTO = await loginUser({ email, password });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("auth_token", authResponse.token);
        Cookies.set("auth_token", authResponse.token, {
          expires: 1,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
      
      const userData = authResponse.employee;
      
      
      const userInfo = {
        id: userData.id!,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: convertRoleToEnum(userData.role)
      };
      
      setUser(userInfo);
      
      
      setAuthChecked(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = (): void => {
    clearAuthToken();
    setUser(null);
  };
  
  const canCreateRole = (role: EmployeeRole): boolean => {
    if (!user) return false;
    
    const roleHierarchy: Record<EmployeeRole, number> = {
      [EmployeeRole.Director]: 3,
      [EmployeeRole.Leader]: 2,
      [EmployeeRole.Employee]: 1
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[role];
  };
  
  const registerEmployee = async (employeeData: RegisterEmployeeDTO): Promise<void> => {
    setIsLoading(true);
    try {
      if (!user || user.role !== EmployeeRole.Director) {
        throw new Error("Apenas Diretores podem registrar novos funcionários");
      }
      
      if (!canCreateRole(employeeData.role)) {
        throw new Error("Você não pode criar funcionários com este nível de acesso");
      }
      
      await apiRegisterEmployee(employeeData);
    } catch (error) {
      console.error("Error registering employee:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, canCreateRole, registerEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);