import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RecentEmployees } from "@/components/pages/dashboard/recent-employees";
import { DepartmentChart } from "@/components/pages/dashboard/department-chart";
import { RoleDistribution } from "@/components/pages/dashboard/role-distribution";
import { TopManagers } from "@/components/pages/dashboard/top-managers";

export function DashboardCharts() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <Card className="lg:col-span-7 rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Funcionários Recentes</CardTitle>
            <CardDescription>Últimas contratações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEmployees />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-5 rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Distribuição por Departamento</CardTitle>
            <CardDescription>Alocação de funcionários por área</CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <Card className="lg:col-span-5 rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Distribuição por Cargo</CardTitle>
            <CardDescription>Análise da hierarquia organizacional</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleDistribution />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-7 rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Gestores com Mais Subordinados</CardTitle>
            <CardDescription>Top líderes por tamanho de equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <TopManagers />
          </CardContent>
        </Card>
      </div>
    </>
  );
}