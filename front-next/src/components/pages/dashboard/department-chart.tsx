"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetEmployees } from '@/services/employee/queries';


interface DepartmentCount {
  name: string;
  count: number;
  color: string;
}

export function DepartmentChart() {
  const { data, isLoading, isError } = useGetEmployees({
    pageNumber: 1,
    pageSize: 100, // Get a larger sample for accurate department counts
  });

  // Count employees by department and sort by count
  const departmentCounts: DepartmentCount[] = [];
  
  if (data?.items) {
    const counts = data.items.reduce((acc, employee) => {
      const dept = employee.department || 'Sem Departamento';
      if (!acc[dept]) {
        acc[dept] = 0;
      }
      acc[dept]++;
      return acc;
    }, {} as Record<string, number>);

    // Colors for departments
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];

    let colorIndex = 0;
    Object.entries(counts).forEach(([name, count]) => {
      departmentCounts.push({
        name,
        count,
        color: colors[colorIndex % colors.length],
      });
      colorIndex++;
    });

    // Sort by count (highest first)
    departmentCounts.sort((a, b) => b.count - a.count);
  }

  // Calculate maximum count for percentage calculations
  const maxCount = departmentCounts.length > 0 
    ? Math.max(...departmentCounts.map(dept => dept.count))
    : 0;

  return (
    <Card className="col-span-full md:col-span-6 border-none">
      <CardHeader>
        <CardTitle>Distribuição por Departamento</CardTitle>
        <CardDescription>
          Número de funcionários por departamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : isError ? (
          <div className="p-4 text-center text-red-500">Erro ao carregar dados</div>
        ) : (
          <div className="space-y-4">
            {departmentCounts.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <span className="text-sm text-muted-foreground">{dept.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${dept.color} rounded-full`}
                    style={{ width: `${(dept.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}