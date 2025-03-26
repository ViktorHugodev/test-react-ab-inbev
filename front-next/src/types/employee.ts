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
  birthDate: Date;
  age?: number;
  role: EmployeeRole;
  department?: string;
  managerId?: string;
  managerName?: string;
  phoneNumbers: Phone[];
  createdAt?: Date;
  updatedAt?: Date;
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
  phoneNumber: string;
  department: string;
  role: EmployeeRole;
}

export interface UpdateEmployeeDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  department?: string;
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