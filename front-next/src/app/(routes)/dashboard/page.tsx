"use client";

import { useEffect, useState } from "react";

import { DashboardCharts } from '@/components/pages/dashboard/dashboard-chart';
import { DashboardHeader } from '@/components/pages/dashboard/dashboard-header';
import { StatsData, StatsOverview } from '@/components/pages/dashboard/stats-overview';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDepartments } from "@/services/department/queries";
import { useGetEmployees } from "@/services/employee/queries";
import { EmployeeRole } from "@/types/employee";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees({
    pageNumber: 1,
    pageSize: 100, 
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartments();

  
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
      
      const totalEmployees = employeesData.totalCount;
      
      
      const managersCount = employeesData.items.filter(
        (e) => e.role === EmployeeRole.Leader || e.role === EmployeeRole.Director
      ).length;
      
      
      const totalDepartments = departmentsData.length;
      
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const newEmployeesLastMonth = employeesData.items.filter((e) => {
        if (!e.createdAt) return false;
        const createdAt = new Date(e.createdAt);
        return createdAt >= oneMonthAgo;
      }).length;
      
      
      const averageTeamSize = managersCount > 0 
        ? Math.round((totalEmployees - managersCount) / managersCount) 
        : 0;

      
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
      {}
      <DashboardHeader 
        title="Dashboard Administrativo" 
        subtitle="Visão geral do sistema de gerenciamento de funcionários - AB InBev" 
      />

      {}
      <div className="container px-6 py-8">
        {}
        <StatsOverview 
          data={stats} 
          isLoadingEmployees={isLoadingEmployees} 
          isLoadingDepartments={isLoadingDepartments} 
        />

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className="rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Gerenciamento de Funcionários</CardTitle>
              <CardDescription>Adicione, edite e gerencie funcionários</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse a lista completa de funcionários e realize operações de gerenciamento.
              </p>
              <Button 
                onClick={() => router.push("/employees")}
                className="w-full rounded-full"
              >
                Acessar Funcionários
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Gerenciamento de Departamentos</CardTitle>
              <CardDescription>Organize a estrutura da empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visualize e gerencie os departamentos e suas respectivas equipes.
              </p>
              <Button 
                onClick={() => router.push("/departments")}
                className="w-full rounded-full"
              >
                Acessar Departamentos
              </Button>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Análise de Dados</h2>
          <DashboardCharts />
        </div>
      </div>
    </div>
  );
}