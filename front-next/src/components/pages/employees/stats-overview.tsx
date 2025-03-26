import { Users, UserCheck, Building2, Award, Clock } from "lucide-react";
import { StatCard } from "@/components/shared/data-display/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export interface EmployeeStatsData {
  totalEmployees: number;
  topDepartment: string;
  departmentDistribution: Record<string, number>;
}

interface EmployeeStatsOverviewProps {
  data: EmployeeStatsData;
  isLoading: boolean;
}

export function EmployeeStatsOverview({ data, isLoading }: EmployeeStatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        title="Total de Funcionários"
        value={data.totalEmployees.toString()}
        icon={<Users className="h-5 w-5" />}
        trend="neutral"
      />
      
      <StatCard 
        title="Departamento Principal"
        value={data.topDepartment || "N/A"}
        icon={<Building2 className="h-5 w-5" />}
        trend="neutral"
        description={data.topDepartment ? `${data.departmentDistribution[data.topDepartment] || 0} funcionários` : ""}
      />
      
      <StatCard 
        title="Total de Departamentos"
        value={Object.keys(data.departmentDistribution).length.toString()}
        icon={<Building2 className="h-5 w-5" />}
        trend="neutral"
      />
    </div>
  );
}
