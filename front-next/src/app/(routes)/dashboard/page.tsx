"use client";

import { useState, useEffect } from "react";
import { BarChart3, Building, Users, UserCog, CalendarDays, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentEmployees } from "@/components/dashboard/recent-employees";
import { DepartmentChart } from "@/components/dashboard/department-chart";
import { RoleDistribution } from "@/components/dashboard/role-distribution";
import { TopManagers } from "@/components/dashboard/top-managers";
import { useGetEmployees } from "@/services/api/employee/queries";
import { useGetDepartments } from "@/services/api/department/queries";
import { EmployeeRole } from "@/types/employee";

export default function DashboardPage() {
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees({
    pageNumber: 1,
    pageSize: 100, // Get a larger sample for complete stats
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartments();

  // Stats calculations
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    totalDepartments: 0,
    newEmployeesLastMonth: 0,
    averageTeamSize: 0,
  });

  useEffect(() => {
    if (employeesData?.items && departmentsData) {
      // Total employees
      const totalEmployees = employeesData.totalCount;
      
      // Count managers
      const managersCount = employeesData.items.filter(
        (e) => e.role === EmployeeRole.Leader || e.role === EmployeeRole.Director
      ).length;
      
      // Total departments
      const totalDepartments = departmentsData.length;
      
      // Count new employees in the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const newEmployeesLastMonth = employeesData.items.filter((e) => {
        if (!e.createdAt) return false;
        const createdAt = new Date(e.createdAt);
        return createdAt >= oneMonthAgo;
      }).length;
      
      // Calculate average team size
      const averageTeamSize = managersCount > 0 
        ? Math.round((totalEmployees - managersCount) / managersCount) 
        : 0;
      
      setStats({
        totalEmployees,
        totalManagers: managersCount,
        totalDepartments,
        newEmployeesLastMonth,
        averageTeamSize,
      });
    }
  }, [employeesData, departmentsData]);

  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gerenciamento de funcionários
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Funcionários"
          value={isLoadingEmployees ? "..." : stats.totalEmployees}
          description="Funcionários ativos no sistema"
          icon={Users}
        />
        
        <StatCard
          title="Gerentes e Diretores"
          value={isLoadingEmployees ? "..." : stats.totalManagers}
          description="Em posições de liderança"
          icon={UserCog}
        />
        
        <StatCard
          title="Departamentos"
          value={isLoadingDepartments ? "..." : stats.totalDepartments}
          description="Áreas da empresa"
          icon={Building}
        />
        
        <StatCard
          title="Novas Contratações"
          value={isLoadingEmployees ? "..." : stats.newEmployeesLastMonth}
          description="Nos últimos 30 dias"
          icon={CalendarDays}
          trend={stats.newEmployeesLastMonth > 0 ? "up" : "neutral"}
          trendValue={stats.newEmployeesLastMonth > 0 ? `+${stats.newEmployeesLastMonth}` : "0"}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Tamanho Médio de Equipe"
          value={isLoadingEmployees ? "..." : stats.averageTeamSize}
          description="Funcionários por gerente"
          icon={TrendingUp}
        />
        
        <StatCard
          title="Composição da Força de Trabalho"
          value={isLoadingEmployees ? "..." : 
            employeesData?.items ? 
            `${Math.round((employeesData.items.filter(e => e.role === EmployeeRole.Employee).length / employeesData.totalCount) * 100)}% Funcionários` : 
            "N/A"
          }
          description="Percentual de colaboradores operacionais"
          icon={BarChart3}
        />
      </div>

      {/* Charts and data tables */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <RecentEmployees />
        <DepartmentChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <RoleDistribution />
        <TopManagers />
      </div>
    </div>
  );
}