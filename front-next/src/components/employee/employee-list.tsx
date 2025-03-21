"use client";

import { useState, useEffect } from "react";
import { useGetEmployees } from "@/services/employee/queries";
import { EmployeeFilters } from "@/services/employee";
import { Employee, EmployeeRole } from "@/types/employee";

interface EmployeeListProps {
  filters?: EmployeeFilters;
}

export function EmployeeList({ filters: externalFilters }: EmployeeListProps) {
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
      <div className="p-8 text-center text-red-500">
        Erro ao carregar funcionários: {error instanceof Error ? error.message : "Erro desconhecido"}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Pesquisar funcionários..."
          className="w-full px-4 py-2 border rounded-md"
          value={filters.searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      {/* Employees table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.items?.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleDisplay(employee.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                    Ver
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-900 mr-2">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {data && (
        <div className="flex justify-between items-center">
          <div>
            Mostrando {data.items.length} de {data.totalCount} resultados
          </div>
          <div className="flex space-x-1">
            <button
              disabled={!data.hasPreviousPage}
              onClick={() => handlePageChange(data.pageNumber - 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Anterior
            </button>
            
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded border ${
                  page === data.pageNumber
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={!data.hasNextPage}
              onClick={() => handlePageChange(data.pageNumber + 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}