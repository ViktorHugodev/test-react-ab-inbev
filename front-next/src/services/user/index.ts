import { api } from "../api";
import { 
  Employee, 
  UpdateEmployeeDTO, 
  UpdatePasswordDTO 
} from "@/types/employee";

/**
 * Serviços específicos para o usuário autenticado atual
 * Diferentemente do employeeService, este módulo trata apenas do usuário logado
 */
export const userService = {
  /**
   * Obtém os dados do usuário atual
   */
  getCurrentUser: async (): Promise<Employee> => {
    const response = await api.get<Employee>('/Auth/me');
    return response;
  },

  /**
   * Atualiza informações do perfil do usuário atual
   */
  updateProfile: async (userId: string, data: Partial<UpdateEmployeeDTO>): Promise<Employee> => {
    // Primeiro buscamos os dados atuais do usuário para não perder informações
    const currentUser = await api.get<Employee>(`/Employees/${userId}`);
    
    // Preparamos o objeto com os dados atualizados
    const updateData: UpdateEmployeeDTO = {
      id: userId,
      firstName: data.firstName || currentUser.firstName || "",
      lastName: data.lastName || currentUser.lastName || "",
      email: data.email || currentUser.email,
      birthDate: data.birthDate || currentUser.birthDate,
      role: currentUser.role,
      department: currentUser.department || "",
      managerId: currentUser.managerId,
      phoneNumbers: data.phoneNumbers || currentUser.phoneNumbers || []
    };
    
    // Enviamos a requisição de atualização
    const response = await api.put<Employee>(`/Employees/${userId}`, updateData);
    return response;
  },
  
  /**
   * Altera a senha do usuário atual
   */
  changePassword: async (data: UpdatePasswordDTO): Promise<void> => {
    await api.put<void>(`/Employees/${data.employeeId}/password`, data);
  }
}