import { CurrentUserResponse } from "@/services/auth";

export enum EmployeeRole {
  Employee = 1,
  Leader = 2,
  Director = 3,
}

export enum PhoneType {
  Mobile = 1,
  Home = 2,
  Work = 3,
  Other = 4,
}

export interface Phone {
  id?: string;
  number: string;
  type: PhoneType;
}

export interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  documentNumber: string;
  birthDate: Date | string;
  age?: number;
  role: EmployeeRole | number;
  department?: string;
  managerId?: string;
  managerName?: string;
  phoneNumbers: Phone[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  name?: string;
}


export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string;
  birthDate: string; 
  password: string;
  role: EmployeeRole;
  department: string;
  managerId?: string;
  phoneNumbers: {
    number: string;
    type: PhoneType;
  }[];
}

export interface RegisterEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentNumber: string;
  phoneNumbers: {
    number: string;
    type: PhoneType;
  }[];
  department: string;
  role: EmployeeRole;
}

export interface UpdateEmployeeDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole | number;
  department?: string;
  managerId?: string;
  birthDate: string | Date
  phoneNumbers: {
    
    id?: string;
    number: string;
    type: PhoneType | number;
  }[];
}

export interface UpdatePasswordDTO {
  employeeId: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  expiresAt: string;
  employee: Employee;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}


export interface UnifiedUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  role: number;
  documentNumber?: string;
  birthDate?: Date;
  age?: number;
  department?: string;
  phoneNumbers: Phone[];
}


export type UserDataSource = Employee | CurrentUserResponse | UnifiedUserData | null | undefined;


export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string;
  birthDate: Date;
  password: string;
  role: EmployeeRole;
  department: string;
  managerId?: string;
  phoneNumbers: Phone[];
}