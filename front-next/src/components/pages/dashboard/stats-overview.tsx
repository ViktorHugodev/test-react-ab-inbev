import React from "react";
import { 
  Users, 
  UserCog, 
  Building, 
  CalendarDays, 
  TrendingUp, 
  BarChart3 
} from "lucide-react";
;
import { EmployeeRole } from "@/types/employee";
import { StatCard } from './stat-card';

export interface StatsData {
  totalEmployees: number;
  totalManagers: number;
  totalDepartments: number;
  newEmployeesLastMonth: number;
  averageTeamSize: number;
  employeePercentage?: number;
}

export interface StatsOverviewProps {
  data: StatsData;
  isLoadingEmployees: boolean;
  isLoadingDepartments: boolean;
}

export function StatsOverview({ 
  data, 
  isLoadingEmployees, 
  isLoadingDepartments 
}: StatsOverviewProps) {
  return (
    <>
      {/* Primeira linha de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-8">
        <StatCard
          title="Total de Funcionários"
          value={isLoadingEmployees ? "..." : data.totalEmployees}
          description="Funcionários ativos no sistema"
          icon={Users}
        />
        
        <StatCard
          title="Gerentes e Diretores"
          value={isLoadingEmployees ? "..." : data.totalManagers}
          description="Em posições de liderança"
          icon={UserCog}
        />
        
        <StatCard
          title="Departamentos"
          value={isLoadingDepartments ? "..." : data.totalDepartments}
          description="Áreas da empresa"
          icon={Building}
        />
        
        <StatCard
          title="Novas Contratações"
          value={isLoadingEmployees ? "..." : data.newEmployeesLastMonth}
          description="Nos últimos 30 dias"
          icon={CalendarDays}
        />
      </div>

      {/* Segunda linha de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <StatCard
          title="Tamanho Médio de Equipe"
          value={isLoadingEmployees ? "..." : data.averageTeamSize}
          description="Funcionários por gerente"
          icon={TrendingUp}
        />
        
        <StatCard
          title="Composição da Força de Trabalho"
          value={isLoadingEmployees ? "..." : 
            data.employeePercentage !== undefined ? 
            `${data.employeePercentage}% Funcionários` : 
            "N/A"
          }
          description="Percentual de colaboradores operacionais"
          icon={BarChart3}
        />
      </div>
    </>
  );
}