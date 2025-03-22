import React from "react";
import { Department as DepartmentType } from "@/types/deparment";
import { DepartmentCard } from './department-card';

export interface DepartmentGridProps {
  departments: DepartmentType[];
  employeeCounts: Record<string, number>;
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DepartmentGrid({ 
  departments, 
  employeeCounts, 
  isLoading = false,
  onEdit,
  onDelete
}: DepartmentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-muted-foreground">Nenhum departamento encontrado.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((department) => (
        <DepartmentCard 
          key={department.id} 
          department={{
            id: department.id,
            name: department.name,
            description: department.description,
            isActive: department.isActive,
            employeeCount: employeeCounts[department.id] || 0
          }}
          onEdit={onEdit ? () => onEdit(department.id) : undefined}
          onDelete={onDelete ? () => onDelete(department.id) : undefined}
        />
      ))}
    </div>
  );
}