"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeRole } from "@/types/employee";
import { useGetEmployees } from "@/services/employee/queries";
import { useGetDepartments } from "@/services/department/queries";
import { DashboardHeader } from '@/components/pages/dashboard/dashboard-header';
import { StatsData, StatsOverview } from '@/components/pages/dashboard/stats-overview';
import { DashboardCharts } from '@/components/pages/dashboard/dashboard-chart';

// Componentes do Dashboard

export default function DashboardPage() {
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees({
    pageNumber: 1,
    pageSize: 100, // Get a larger sample for complete stats
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartments();

  // Stats calculations
  const [stats, setStats] = useState<StatsData>({
    totalEmployees: 0,
    totalManagers: 0,
    totalDepartments: 0,
    newEmployeesLastMonth: 0,
    averageTeamSize: 0,
    employeePercentage: 0,
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

      // Calculate employee percentage
      const employeePercentage = totalEmployees > 0
        ? Math.round((employeesData.items.filter(e => e.role === EmployeeRole.Employee).length / totalEmployees) * 100)
        : 0;
      
      setStats({
        totalEmployees,
        totalManagers: managersCount,
        totalDepartments,
        newEmployeesLastMonth,
        averageTeamSize,
        employeePercentage,
      });
    }
  }, [employeesData, departmentsData]);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <DashboardHeader 
        title="Dashboard Administrativo" 
        subtitle="Visão geral do sistema de gerenciamento de funcionários - AB InBev" 
      />

      {/* Main Content */}
      <div className="container px-6 py-8">
        {/* Stats Overview */}
        <StatsOverview 
          data={stats} 
          isLoadingEmployees={isLoadingEmployees} 
          isLoadingDepartments={isLoadingDepartments} 
        />

        {/* Botão Ver relatórios */}
        <div className="flex justify-end mt-8">
          <Button variant="outline" className="rounded-full">
            Ver relatórios completos <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Dashboard Charts */}
        <DashboardCharts />
      </div>
    </div>
  );
}