import { api } from "../api";
import {
  Employee,
  UpdateEmployeeDTO,
  UpdatePasswordDTO
} from "@/types/employee";


export const userService = {

  getCurrentUser: async (): Promise<Employee> => {
    const response = await api.get<Employee>('/Auth/me');
    return response;
  },


  updateProfile: async (userId: string, data: Partial<UpdateEmployeeDTO>): Promise<Employee> => {

    const currentUser = await api.get<Employee>(`/Employees/${userId}`);

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


    const response = await api.put<Employee>(`/Employees/${userId}`, updateData);
    return response;
  },

  changePassword: async (data: UpdatePasswordDTO): Promise<void> => {
    await api.put<void>(`/Employees/${data.employeeId}/password`, data);
  }
}