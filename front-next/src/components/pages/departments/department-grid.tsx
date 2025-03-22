import React from "react";
import { Department, DepartmentCard } from './department-card';

export interface DepartmentGridProps {
  departments: Department[];
}

export function DepartmentGrid({ departments }: DepartmentGridProps) {
  if (departments?.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-muted-foreground">Nenhum departamento encontrado.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments?.map((department) => (
        <DepartmentCard key={department.id} department={department} />
      ))}
    </div>
  );
}