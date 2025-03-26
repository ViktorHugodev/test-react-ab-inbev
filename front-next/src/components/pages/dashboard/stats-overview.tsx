import React from "react";
import { 
  Users, 
  UserCog, 
  Building, 
  CalendarDays, 
  TrendingUp, 
  BarChart3 
} from "lucide-react";
import { EmployeeRole } from "@/types/employee";
import { StatCard } from '@/components/shared/data-display/stat-card';
import { Skeleton } from "@/components/ui/skeleton";

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
  if (isLoadingEmployees || isLoadingDepartments) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primeira linha de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-8">
        <StatCard
          title="Total de Funcionários"
          value={data.totalEmployees}
          description="Funcionários ativos no sistema"
          icon={Users}
          className="bg-card hover:shadow-md transition-all duration-300"
        />
        
        <StatCard
          title="Gerentes e Diretores"
          value={data.totalManagers}
          description="Em posições de liderança"
          icon={UserCog}
          className="bg-card hover:shadow-md transition-all duration-300"
        />
        
        <StatCard
          title="Departamentos"
          value={data.totalDepartments}
          description="Áreas da empresa"
          icon={Building}
          className="bg-card hover:shadow-md transition-all duration-300"
        />
        
        <StatCard
          title="Novas Contratações"
          value={data.newEmployeesLastMonth}
          description="Nos últimos 30 dias"
          icon={CalendarDays}
          className="bg-card hover:shadow-md transition-all duration-300"
        />
      </div>

      {/* Segunda linha de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <StatCard
          title="Tamanho Médio de Equipe"
          value={data.averageTeamSize}
          description="Funcionários por gerente"
          icon={TrendingUp}
          className="bg-card hover:shadow-md transition-all duration-300"
        />
        
        <StatCard
          title="Composição da Força de Trabalho"
          value={data.employeePercentage !== undefined ? 
            `${data.employeePercentage}% Funcionários` : 
            "N/A"
          }
          description="Percentual de colaboradores operacionais"
          icon={BarChart3}
          className="bg-card hover:shadow-md transition-all duration-300"
        />
      </div>
    </div>
  );
}