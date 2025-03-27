"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeRole } from "@/types/employee";
import { useGetEmployees } from "@/services/employee/queries";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentEmployees() {
  const { data, isLoading, isError } = useGetEmployees({
    pageNumber: 1,
    pageSize: 5,
  });

  
  const getRoleDisplay = (role: EmployeeRole): string => {
    switch (role) {
      case EmployeeRole.Director:
        return "Diretor";
      case EmployeeRole.Leader:
        return "Líder";
      case EmployeeRole.Employee:
        return "Funcionário";
      default:
        return "Desconhecido";
    }
  };

  const getRoleBadgeColor = (role: EmployeeRole): string => {
    switch (role) {
      case EmployeeRole.Director:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case EmployeeRole.Leader:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case EmployeeRole.Employee:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Card className="col-span-full md:col-span-6 border-none">
      <CardHeader>
        <CardTitle>Funcionários Recentes</CardTitle>
        <CardDescription>
          Os 5 funcionários mais recentes adicionados ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : isError ? (
          <div className="p-4 text-center text-red-500">Erro ao carregar dados</div>
        ) : (
          <div className="space-y-4">
            {data?.items?.map((employee) => (
              <div key={employee.id} className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {employee.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(employee.role)}>
                    {getRoleDisplay(employee.role)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {employee.createdAt && format(new Date(employee.createdAt), "dd MMM yyyy", { locale: ptBR })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}