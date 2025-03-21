
// DTOs para criação e atualização
export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  id: string;
  name: string;
  description: string;
}
// Interfaces
export interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}
