import React from "react";
import { 
  Building, 
  Users, 
  CalendarDays, 
  Clock, 
  Briefcase,
  CheckCircle
} from "lucide-react";
import { StatCard } from '@/components/shared/data-display/stat-card';
import { Skeleton } from "@/components/ui/skeleton";

export interface DepartmentStatsData {
  totalDepartments: number;
  activeDepartments: number;
  totalEmployees: number;
  averageEmployeesPerDepartment: number;
  newestDepartment: string;
  oldestDepartment: string;
}

export interface DepartmentStatsOverviewProps {
  data: DepartmentStatsData;
  isLoading: boolean;
}

export function DepartmentStatsOverview({ 
  data, 
  isLoading 
}: DepartmentStatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total de Departamentos"
        value={data.totalDepartments}
        icon={Building}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Departamentos Ativos"
        value={data.activeDepartments}
        description={`${Math.round((data.activeDepartments / data.totalDepartments) * 100)}% do total`}
        icon={CheckCircle}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Total de Funcionários"
        value={data.totalEmployees}
        description={`Distribuídos em ${data.totalDepartments} departamentos`}
        icon={Users}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Média por Departamento"
        value={data.averageEmployeesPerDepartment}
        description="Funcionários por departamento"
        icon={Briefcase}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Departamento Mais Recente"
        value={data.newestDepartment}
        description="Última adição à estrutura"
        icon={CalendarDays}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
    </div>
  );
}
