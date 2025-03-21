// Enums alinhados com o backend
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

// Interfaces para representar o modelo de negócio
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
  birthDate: Date;
  age?: number;
  role: EmployeeRole;
  department: string;
  managerId?: string;
  managerName?: string;
  phoneNumbers: Phone[];
  createdAt?: Date;
  updatedAt?: Date;
}

// DTOs para comunicação com a API
export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string;
  birthDate: string; // ISO string format for API
  password: string;
  role: EmployeeRole;
  department: string;
  managerId?: string;
  phoneNumbers: {
    number: string;
    type: PhoneType;
  }[];
}

export interface UpdateEmployeeDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department: string;
  managerId?: string;
  birthDate: string | Date
  phoneNumbers: {
    id?: string;
    number: string;
    type: PhoneType;
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

// UI state interfaces
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