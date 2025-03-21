"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, PlusCircle, Building2, Users } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { EmployeeRole } from "@/types/employee";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetEmployees } from '@/services/employee/queries';
import { useCreateDepartment, useGetDepartments } from '@/services/department/queries';

export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", description: "" });
  
  const { data: departments, isLoading: isLoadingDepts, isError, error } = useGetDepartments();
  const { data: employees } = useGetEmployees();
  const createDepartment = useCreateDepartment();

  // Calcular a contagem de funcionários por departamento
  const departmentsWithCount = departments?.map(department => {
    const count = employees?.items?.filter(emp => emp.department === department.name).length || 0;
    return {
      ...department,
      employeeCount: count
    };
  });
  
  // Filter departments based on search term
  const filteredDepartments = departmentsWithCount?.filter(
    (department) => department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only directors can create departments
  const canCreateDepartment = user?.role === EmployeeRole.Director;

  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do departamento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createDepartment.mutateAsync({
        name: newDepartment.name.trim(),
        description: newDepartment?.description?.trim() || undefined
      });

      setNewDepartment({ name: "", description: "" });
      setIsCreateDialogOpen(false);
    } catch (error) { 
      console.error("Erro ao criar departamento:", error);
    }
  };

  if (isLoadingDepts) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Departamentos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Departamentos</h1>
        </div>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-500">
              Erro ao carregar departamentos: {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Departamentos</h1>
        
        {canCreateDepartment && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Departamento
          </Button>
        )}
      </div>
      
      <div className="relative w-full max-w-sm mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar departamentos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments?.map((department) => (
          <Link key={department.id} href={`/departments/${department.id}`}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>{department.name}</CardTitle>
                </div>
                <CardDescription>
                  {department.description || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {department.employeeCount || 0} funcionários
                  </Badge>
                  
                  {department.isActive === false && (
                    <Badge variant="destructive" className="text-xs">
                      Inativo
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
        
        {filteredDepartments?.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Nenhum departamento encontrado.</p>
          </div>
        )}
      </div>

      {/* Dialog para criar novo departamento */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Departamento</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para criar um novo departamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="department-name">Nome do Departamento *</Label>
              <Input 
                id="department-name" 
                placeholder="Ex: Recursos Humanos"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department-description">Descrição</Label>
              <Textarea 
                id="department-description" 
                placeholder="Descrição do departamento e suas funções principais..."
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateDepartment}
              disabled={createDepartment.isPending || !newDepartment.name.trim()}
            >
              {createDepartment.isPending ? "Criando..." : "Criar Departamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}