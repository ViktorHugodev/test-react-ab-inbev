import React from "react";
import { 
  Building, 
  Users, 
  CalendarDays, 
  Clock, 
  Briefcase,
  CheckCircle
} from "lucide-react";
import { StatCard } from './stat-card';

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
  return (
    <>
      {/* Primeira linha de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 -mt-8">
        <StatCard
          title="Total de Departamentos"
          value={isLoading ? "..." : data.totalDepartments}
          description="Departamentos cadastrados"
          icon={Building}
        />
        
        <StatCard
          title="Departamentos Ativos"
          value={isLoading ? "..." : data.activeDepartments}
          description="Em operação atualmente"
          icon={CheckCircle}
        />
        
        <StatCard
          title="Total de Funcionários"
          value={isLoading ? "..." : data.totalEmployees}
          description="Distribuídos nos departamentos"
          icon={Users}
        />
      </div>

      {/* Segunda linha de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Média de Funcionários"
          value={isLoading ? "..." : data.averageEmployeesPerDepartment}
          description="Funcionários por departamento"
          icon={Briefcase}
        />
        
        <StatCard
          title="Departamento Mais Recente"
          value={isLoading ? "..." : data.newestDepartment}
          description="Última adição à estrutura"
          icon={CalendarDays}
        />
        
        <StatCard
          title="Departamento Mais Antigo"
          value={isLoading ? "..." : data.oldestDepartment}
          description="Primeira estrutura criada"
          icon={Clock}
        />
      </div>
    </>
  );
}
