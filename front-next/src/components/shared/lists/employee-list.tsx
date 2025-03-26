"use client";

import { useState, useEffect } from "react";
import { useGetEmployees } from "@/services/employee/queries";
import { EmployeeFilters } from "@/services/employee";
import { Employee, EmployeeRole } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

interface EmployeeListProps {
  filters?: EmployeeFilters;
  onViewEmployee?: (id: string) => void;
  onEditEmployee?: (id: string) => void;
  onDeleteEmployee?: (id: string) => void;
  className?: string;
}

export function EmployeeList({ 
  filters: externalFilters, 
  onViewEmployee, 
  onEditEmployee, 
  onDeleteEmployee,
  className
}: EmployeeListProps) {
  // State for filters
  const [filters, setFilters] = useState<EmployeeFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
    ...externalFilters
  });

  // Update internal filters when external filters change
  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({
        ...prev,
        ...externalFilters
      }));
    }
  }, [externalFilters]);

  // Use the query hook
  const { data, isLoading, isError, error } = useGetEmployees(filters);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };
  
  // Handle search
  const handleSearch = (term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term, pageNumber: 1 }));
  };
  
  // Get the role as string
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
  
  if (isLoading) {
    return <div className="p-8 text-center">Carregando funcionários...</div>;
  }
  
  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Erro ao carregar funcionários: {error instanceof Error ? error.message : "Erro desconhecido"}
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar funcionários..."
            className="pl-8 rounded-full w-full"
            value={filters.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      
      {/* Employees table */}
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
            {data?.items?.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  {employee.firstName} {employee.lastName}
                </TableCell>
                <TableCell>
                  {employee.email}
                </TableCell>
                <TableCell>
                  {employee.department}
                </TableCell>
                <TableCell>
                  {getRoleDisplay(employee.role)}
                </TableCell>
                <TableCell className="text-right">
                  {onViewEmployee && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewEmployee(employee.id || '')} 
                      className="mr-1"
                    >
                      Ver
                    </Button>
                  )}
                  {onEditEmployee && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditEmployee(employee.id || '')} 
                      className="mr-1"
                    >
                      Editar
                    </Button>
                  )}
                  {onDeleteEmployee && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeleteEmployee(employee.id || '')}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      Excluir
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(data?.items?.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum funcionário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {data.items.length} de {data.totalCount} resultados
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasPreviousPage}
              onClick={() => handlePageChange(data.pageNumber - 1)}
              className="h-8 w-8 p-0 rounded-full"
            >
              &lt;
            </Button>
            
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const currentPage = data.pageNumber;
                return page === 1 || 
                       page === data.totalPages || 
                       (page >= currentPage - 1 && page <= currentPage + 1);
              })
              .map((page, index, array) => {
                // Add ellipsis
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="flex items-center px-3">
                      ...
                    </span>
                  );
                }
                
                return (
                  <Button
                    key={page}
                    variant={page === data.pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    {page}
                  </Button>
                );
              })}
            
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasNextPage}
              onClick={() => handlePageChange(data.pageNumber + 1)}
              className="h-8 w-8 p-0 rounded-full"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}