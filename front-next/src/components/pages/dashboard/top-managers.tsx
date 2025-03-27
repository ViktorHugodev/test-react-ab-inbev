"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetEmployees } from "@/services/employee/queries";
import { EmployeeRole } from "@/types/employee";
import { LoadingIndicator } from "@/components/shared/loading/loading-indicator";

export function TopManagers() {
  const { data, isLoading, isError } = useGetEmployees({
    pageNumber: 1,
    pageSize: 100, 
  });

  
  const getManagersList = () => {
    if (!data?.items?.length) return [];

    
    const managerSubordinates: Record<string, number> = {};
    const managerInfo: Record<string, { name: string; role: EmployeeRole }> = {};

    
    data.items.forEach(employee => {
      if (employee.role === EmployeeRole.Leader || employee.role === EmployeeRole.Director) {
        managerInfo[employee.id!] = {
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role
        };
      }
    });

    
    data.items.forEach(employee => {
      if (employee.managerId && managerInfo[employee.managerId]) {
        if (!managerSubordinates[employee.managerId]) {
          managerSubordinates[employee.managerId] = 0;
        }
        managerSubordinates[employee.managerId]++;
      }
    });

    
    const result = Object.entries(managerSubordinates).map(([id, count]) => ({
      id,
      name: managerInfo[id].name,
      role: managerInfo[id].role,
      subordinateCount: count
    }));

    
    return result.sort((a, b) => b.subordinateCount - a.subordinateCount).slice(0, 5);
  };

  const topManagers = getManagersList();

  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader>
        <CardTitle>Gerentes com Mais Subordinados</CardTitle>
        <CardDescription>
          Gerentes e diretores com maior número de funcionários sob sua responsabilidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingIndicator text="Carregando gerentes..." />
        ) : isError ? (
          <div className="p-4 text-center text-red-500">Erro ao carregar dados</div>
        ) : (
          <div className="space-y-4">
            {topManagers.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Não há gerentes com subordinados no sistema
              </div>
            ) : (
              topManagers.map((manager) => (
                <div key={manager.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {manager.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{manager.name}</div>
                      <div className="text-sm font-medium text-primary rounded-full bg-primary/10 px-2 py-0.5">
                        {manager.subordinateCount} subordinados
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {manager.role === EmployeeRole.Director ? "Diretor" : "Líder"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}