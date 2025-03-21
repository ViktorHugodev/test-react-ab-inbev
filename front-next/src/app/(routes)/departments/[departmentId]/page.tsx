"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Search, Users, UserPlus, PenSquare, Trash2 } from "lucide-react";
import { useGetDepartment } from "@/services/api/department/queries";
import { useGetEmployeesByDepartment } from "@/services/api/employee/queries";
import { useAuth } from "@/hooks/use-auth";
import { EmployeeRole } from "@/types/employee";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const departmentId = params.departmentId as string;
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch department details
  const { 
    data: department, 
    isLoading: isLoadingDepartment, 
    isError: isDepartmentError 
  } = useGetDepartment(departmentId);
  
  // Fetch employees in this department
  const { 
    data: employees, 
    isLoading: isLoadingEmployees, 
    isError: isEmployeesError 
  } = useGetEmployeesByDepartment(departmentId);
  
  // Filter employees based on search term
  const filteredEmployees = employees?.filter(
    (employee) => 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isLoading = isLoadingDepartment || isLoadingEmployees;
  const isError = isDepartmentError || isEmployeesError;
  
  // Check user permissions
  const isDirector = user?.role === EmployeeRole.Director;
  const isLeaderOrDirector = user?.role === EmployeeRole.Leader || user?.role === EmployeeRole.Director;
  
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
        <div className="flex items-center mb-6">
          <Link href="/departments">
            <Button variant="ghost" className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Carregando...</h1>
        </div>
        
        <Card className="mb-6 animate-pulse">
          <CardHeader>
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Funcionários</h2>
        </div>
        
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Link href="/departments">
            <Button variant="ghost" className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Departamento não encontrado</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-500">
              O departamento solicitado não foi encontrado ou ocorreu um erro ao carregar os dados.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/departments')}
            >
              Voltar para Departamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/departments">
          <Button variant="ghost" className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{department.name}</h1>
        
        {isDirector && (
          <div className="ml-auto flex space-x-2">
            <Button variant="outline" size="sm">
              <PenSquare className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmação de exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir o departamento <strong>{department.name}</strong>?
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="destructive">Excluir</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Informações do Departamento
          </CardTitle>
          <CardDescription>
            Detalhes e estatísticas sobre o departamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total de Funcionários</p>
              <p className="text-2xl font-bold">{filteredEmployees?.length || 0}</p>
            </div>
            
            {department.description && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p>{department.description}</p>
              </div>
            )}
            
            {department.createdAt && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                <p>{new Date(department.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            
            {department.updatedAt && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                <p>{new Date(department.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Funcionários</h2>
        
        {isLeaderOrDirector && (
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Funcionário
          </Button>
        )}
      </div>
      
      <div className="relative w-full max-w-sm mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar funcionários..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees?.map((employee) => (
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
                  <TableCell>{employee.managerName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/employees/${employee.id}`}>
                          Ver
                        </Link>
                      </Button>
                      
                      {isLeaderOrDirector && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/employees/${employee.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredEmployees?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum funcionário encontrado neste departamento.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}