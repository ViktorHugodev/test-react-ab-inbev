import { Pencil, Trash2, Eye } from "lucide-react";
import { Employee, EmployeeRole } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeTableProps {
  employees: Employee[] | undefined;
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function EmployeeTable({
  employees,
  isLoading,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: EmployeeTableProps) {
  
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

  
  const getRoleBadgeVariant = (role: EmployeeRole) => {
    switch (role) {
      case EmployeeRole.Director:
        return "default";
      case EmployeeRole.Leader:
        return "secondary";
      case EmployeeRole.Employee:
        return "outline";
      default:
        return "outline";
    }
  };

  
  const getFullName = (employee: Employee): string => {
    if (employee.fullName) return employee.fullName;
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-9 w-[120px] ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhum funcionário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                {getFullName(employee)}
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.department || "N/A"}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(employee.role) as any}>
                  {getRoleDisplay(employee.role)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => employee.id && onView(employee.id)}
                    className="h-8 w-8 rounded-full"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver</span>
                  </Button>
                  
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => employee.id && onEdit(employee.id)}
                      className="h-8 w-8 rounded-full"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  )}
                  
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => employee.id && onDelete(employee.id)}
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
