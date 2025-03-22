import { Users, UserCheck, Building2, Award, Clock } from "lucide-react";
import { StatCard } from "./stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export interface EmployeeStatsData {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  leadersCount: number;
  averageTenure: number;
}

interface EmployeeStatsOverviewProps {
  data: EmployeeStatsData;
  isLoading: boolean;
}

export function EmployeeStatsOverview({ data, isLoading }: EmployeeStatsOverviewProps) {
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
        title="Total de Funcionários"
        value={data.totalEmployees}
        icon={Users}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Funcionários Ativos"
        value={data.activeEmployees}
        description={`${Math.round((data.activeEmployees / data.totalEmployees) * 100)}% do total`}
        icon={UserCheck}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Departamentos"
        value={data.totalDepartments}
        description={`${Math.round(data.totalEmployees / data.totalDepartments)} funcionários por dept.`}
        icon={Building2}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Líderes"
        value={data.leadersCount}
        description={`${Math.round((data.leadersCount / data.totalEmployees) * 100)}% do total`}
        icon={Award}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
      <StatCard
        title="Tempo Médio"
        value={`${data.averageTenure} meses`}
        description="Tempo médio na empresa"
        icon={Clock}
        className="bg-card hover:shadow-md transition-all duration-300"
      />
    </div>
  );
}
