"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { EmployeeFilters } from "@/services/employee";
import { Employee, EmployeeRole } from "@/types/employee";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useDeleteEmployee, useGetEmployees, useGetManagers } from '@/services/employee/queries';
import { useGetDepartments } from '@/services/department/queries';

import { EmployeeHeader } from "@/components/pages/employees/employee-header";
import { EmployeeTable } from "@/components/pages/employees/employee-table";
import { FilterBar } from "@/components/shared/filters/filter-bar";
import { ConfirmDeleteDialog } from "@/components/shared/dialogs/confirm-delete-dialog";
import { EmployeeStatsData, EmployeeStatsOverview } from "@/components/pages/employees/stats-overview";

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
  });
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState<EmployeeStatsData>({
    totalEmployees: 0,
    topDepartment: '',
    departmentDistribution: {}
  });

  // Fetch data with queries
  const { data: employeesData, isLoading, isError } = useGetEmployees(filters);
  const { data: departments } = useGetDepartments();
  const { data: managers } = useGetManagers();
  const deleteEmployee = useDeleteEmployee();

  // Check permissions - assume default to Employee if user role is null
  const userRole = user?.role || EmployeeRole.Employee;
  const isDirector = userRole === EmployeeRole.Director;
  const isLeaderOrDirector = userRole === EmployeeRole.Leader || userRole === EmployeeRole.Director;

  // Handle department filter
  const handleDepartmentChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      department: value === "all" ? undefined : value,
      pageNumber: 1,
    }));
  };

  // Handle manager filter
  const handleManagerChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      managerId: value === "all" ? undefined : value,
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

  // Handle view employee
  const handleViewEmployee = (id: string) => {
    router.push(`/employees/${id}`);
  };

  // Handle edit employee
  const handleEditEmployee = (id: string) => {
    router.push(`/employees/${id}`);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    const employee = employeesData?.items.find(emp => emp.id === id);
    if (employee) {
      setEmployeeToDelete(employee);
      setShowDeleteDialog(true);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!employeeToDelete || !employeeToDelete.id) return;
    
    try {
      await deleteEmployee.mutateAsync(employeeToDelete.id);
      toast.success("Funcionário excluído com sucesso!");
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir funcionário.");
      console.error(error);
    }
  };

  // Calculate stats
  useEffect(() => {
    if (employeesData && departments) {
      // Estatísticas básicas sem depender de hireDate
      const totalEmployees = employeesData.items.length;
      const departmentCounts = employeesData.items.reduce((acc, emp) => {
        if (emp.department) {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Encontrar o departamento com mais funcionários
      let topDepartment = '';
      let maxCount = 0;
      
      Object.entries(departmentCounts).forEach(([dept, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topDepartment = dept;
        }
      });
      
      setStats({
        totalEmployees,
        topDepartment,
        departmentDistribution: departmentCounts
      });
    }
  }, [employeesData, departments]);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <EmployeeHeader 
        title="Gerenciamento de Funcionários" 
        subtitle="Visualize, crie e gerencie os funcionários da empresa" 
      />

      {/* Main Content */}
      <div className="container px-6 py-8">
        {/* Stats Overview */}
        <EmployeeStatsOverview 
          data={stats} 
          isLoading={isLoading} 
        />

        {/* Filters and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
          <FilterBar 
            searchTerm={filters.searchTerm || ""}
            onSearchChange={handleSearch}
            searchPlaceholder="Buscar funcionários..."
            filters={[
              {
                name: "Departamentos",
                placeholder: "Departamento",
                value: filters.department,
                onChange: handleDepartmentChange,
                options: departments ? departments.map(dept => ({
                  id: dept.id,
                  name: dept.name,
                  value: dept.name
                })) : []
              },
              {
                name: "Gerentes",
                placeholder: "Gerente",
                value: filters.managerId,
                onChange: handleManagerChange,
                options: managers ? managers.map(manager => ({
                  id: manager.id || "",
                  name: `${manager.firstName} ${manager.lastName}`,
                  value: manager.id || ""
                })) : []
              }
            ]}
          />
          
          {isDirector && (
            <Button 
              onClick={() => router.push("/employees/create")}
              className="rounded-full whitespace-nowrap"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
          )}
        </div>

        {/* Employees Table */}
        <div className="mt-6">
          <EmployeeTable
            employees={employeesData?.items}
            isLoading={isLoading}
            onView={handleViewEmployee}
            onEdit={handleEditEmployee}
            onDelete={handleDelete}
            canEdit={isLeaderOrDirector}
            canDelete={isDirector}
          />
        </div>

        {/* Pagination */}
        {employeesData && employeesData.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {[...Array(employeesData.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={filters.pageNumber === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className="rounded-full w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Funcionário"
        itemName={employeeToDelete ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}` : ""}
        onConfirm={confirmDelete}
        isLoading={deleteEmployee.isPending}
      />
    </div>
  );
}