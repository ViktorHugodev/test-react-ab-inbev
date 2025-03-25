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
   
          </CardHeader>
          <CardContent>
            <RecentEmployees />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-5 rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
  
          </CardHeader>
          <CardContent>
            <DepartmentChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <Card className="lg:col-span-5 rounded-3xl shadow-sm">
          <CardHeader className="pb-0">
       
          </CardHeader>
          <CardContent>
            <RoleDistribution />
          </CardContent>
        </Card>
        
      
      </div>
    </>
  );
}