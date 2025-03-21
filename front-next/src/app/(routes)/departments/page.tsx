"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, PlusCircle } from "lucide-react";
import { useGetDepartments } from "@/services/api/department/queries";
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

export default function DepartmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: departments, isLoading, isError, error } = useGetDepartments();
  
  // Filter departments based on search term
  const filteredDepartments = departments?.filter(
    (department) => department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only directors can create departments
  const canCreateDepartment = user?.role === EmployeeRole.Director;

  if (isLoading) {
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
          <Button>
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
                <CardTitle>{department.name}</CardTitle>
                <CardDescription>
                  {department.description || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Total: {department.employeeCount || 0} funcionários
                  </Badge>
                  {department.updatedAt && (
                    <span className="text-xs text-muted-foreground">
                      Atualizado em {new Date(department.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
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
    </div>
  );
}