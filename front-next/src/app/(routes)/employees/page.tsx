"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, PlusCircle, Pencil, Trash2, Eye } from "lucide-react";
import { useGetEmployees } from "@/services/api/employee/queries";
import { useGetDepartments } from "@/services/api/department/queries";
import { useGetManagers } from "@/services/api/employee/queries";
import { useDeleteEmployee } from "@/services/api/employee/queries";
import { useAuth } from "@/hooks/use-auth";
import { EmployeeFilters } from "@/services/api/employee";
import { Employee, EmployeeRole } from "@/types/employee";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<EmployeeFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
  });
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch data with queries
  const { data: employeesData, isLoading, isError } = useGetEmployees(filters);
  const { data: departments } = useGetDepartments();
  const { data: managers } = useGetManagers();
  const deleteEmployee = useDeleteEmployee();

  // Check permissions
  const isDirector = user?.role === EmployeeRole.Director;
  const isLeaderOrDirector = user?.role === EmployeeRole.Leader || user?.role === EmployeeRole.Director;

  // Handle department filter
  const handleDepartmentChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      department: value || undefined,
      pageNumber: 1,
    }));
  };

  // Handle manager filter
  const handleManagerChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      managerId: value || undefined,
      pageNumber: 1,
    }));
  };

  // Handle search
  const handleSearch = (term: string) => {
    setFilters((prev) => ({ 
      ...prev, 
      searchTerm: term, 
      pageNumber: 1 
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setEmployeeToDelete(id);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      await deleteEmployee.mutateAsync(employeeToDelete);
      toast.success("Funcionário excluído com sucesso!");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Erro ao excluir funcionário.");
      console.error(error);
    }
  };

  // Get role display name
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

  // Get role badge variant
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Funcionários</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
        </div>
        
        <div className="animate-pulse mb-6 h-10 w-full max-w-sm bg-gray-200 rounded"></div>
        
        <Card>
          <CardHeader>
            <div className="animate-pulse h-6 w-1/4 bg-gray-200 rounded mb-2"></div>
            <div className="animate-pulse h-4 w-1/3 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Funcionários</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-500">
              Erro ao carregar funcionários. Por favor, tente novamente mais tarde.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.refresh()}
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Funcionários</h1>
        <Link href="/employees/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Funcionário
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre os funcionários por departamento ou gerente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <Select
                onValueChange={handleDepartmentChange}
                value={filters.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {departments?.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gerente</label>
              <Select
                onValueChange={handleManagerChange}
                value={filters.managerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os gerentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gerentes</SelectItem>
                  {managers?.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="relative w-full max-w-sm mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar funcionários..."
          className="pl-8"
          value={filters.searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            Gerenciar todos os funcionários da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesData?.items?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(employee.role)}>
                      {getRoleDisplay(employee.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.managerName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/employees/${employee.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>
                      
                      {isLeaderOrDirector && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/employees/${employee.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                      )}
                      
                      {isDirector && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(employee.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {employeesData?.items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum funcionário encontrado.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {employeesData && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Mostrando {employeesData?.items?.length} de {employeesData?.totalCount} resultados
          </div>
          <div className="flex space-x-1">
            <Button
              disabled={!employeesData?.hasPreviousPage}
              onClick={() => handlePageChange(employeesData?.pageNumber - 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
              size="sm"
              variant="outline"
            >
              Anterior
            </Button>
            
            {Array.from({ length: employeesData.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                className={page === employeesData.pageNumber ? "bg-primary text-primary-foreground" : ""}
                size="sm"
                variant={page === employeesData.pageNumber ? "default" : "outline"}
              >
                {page}
              </Button>
            ))}
            
            <Button
              disabled={!employeesData.hasNextPage}
              onClick={() => handlePageChange(employeesData.pageNumber + 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
              size="sm"
              variant="outline"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este funcionário?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}