"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetEmployees } from "@/services/api/employee/queries";
import { EmployeeRole } from "@/types/employee";

export function RoleDistribution() {
  const { data, isLoading, isError } = useGetEmployees({
    pageNumber: 1,
    pageSize: 100, // Get a larger sample for accurate role distribution
  });

  const getRoleData = () => {
    if (!data?.items?.length) return [];

    // Initialize counters
    const roleCount = {
      [EmployeeRole.Director]: 0,
      [EmployeeRole.Leader]: 0,
      [EmployeeRole.Employee]: 0,
    };

    // Count by role
    data.items.forEach(employee => {
      if (roleCount[employee.role] !== undefined) {
        roleCount[employee.role]++;
      }
    });

    // Create the data array
    return [
      {
        role: "Diretores",
        count: roleCount[EmployeeRole.Director],
        color: "bg-red-500",
        textColor: "text-red-500",
      },
      {
        role: "Líderes",
        count: roleCount[EmployeeRole.Leader],
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
      },
      {
        role: "Funcionários",
        count: roleCount[EmployeeRole.Employee],
        color: "bg-blue-500",
        textColor: "text-blue-500",
      },
    ];
  };

  const roleData = getRoleData();
  const total = roleData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader>
        <CardTitle>Distribuição por Cargo</CardTitle>
        <CardDescription>
          Proporção de diretores, líderes e funcionários
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : isError ? (
          <div className="p-4 text-center text-red-500">Erro ao carregar dados</div>
        ) : (
          <div className="space-y-6">
            {/* Pie chart visualization */}
            <div className="flex justify-center items-center">
              <div className="relative h-40 w-40">
                {roleData.map((item, index) => {
                  // Calculate the total percentage of this role
                  const percentage = total === 0 ? 0 : (item.count / total) * 100;
                  const cumulativePercentage = roleData
                    .slice(0, index)
                    .reduce((sum, prevItem) => sum + (prevItem.count / total) * 100, 0);
                  
                  // Skip if percentage is 0
                  if (percentage === 0) return null;
                  
                  return (
                    <div
                      key={item.role}
                      className={`absolute rounded-full ${item.color}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        clipPath: `conic-gradient(
                          from ${cumulativePercentage * 3.6}deg, 
                          ${item.color} 0deg, 
                          ${item.color} ${percentage * 3.6}deg, 
                          transparent ${percentage * 3.6}deg
                        )`,
                      }}
                    ></div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-card flex items-center justify-center text-sm">
                    Total: {total}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2">
              {roleData.map((item) => (
                <div key={item.role} className="flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm">{item.role}</span>
                  </div>
                  <div className={`text-lg font-bold ${item.textColor}`}>
                    {item.count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {total === 0
                      ? "0%"
                      : `${Math.round((item.count / total) * 100)}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}