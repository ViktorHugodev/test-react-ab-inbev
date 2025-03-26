"use client";

import { useState, useEffect } from "react";
import { Search, PlusCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { EmployeeRole } from "@/types/employee";

import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/shared/filters/filter-bar";

import { useGetEmployees } from '@/services/employee/queries';
import { useCreateDepartment, useGetDepartments, useDeleteDepartment, useUpdateDepartment } from '@/services/department/queries';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "@/types/deparment";

import { DepartmentHeader } from "@/components/pages/departments/department-header";
import { DepartmentGrid } from "@/components/pages/departments/department-grid";
import { DepartmentDialog } from "@/components/pages/departments/department-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/dialogs/confirm-delete-dialog";
import { DepartmentStatsData, DepartmentStatsOverview } from "@/components/pages/departments/stats-overview";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
  
  // API hooks
  const { data: departments, isLoading: isLoadingDepts } = useGetDepartments();
  const { data: employees, isLoading: isLoadingEmployees } = useGetEmployees();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment(selectedDepartment?.id || "");
  const deleteDepartment = useDeleteDepartment();

  // Stats calculations
  const [stats, setStats] = useState<DepartmentStatsData>({
    totalDepartments: 0,
    activeDepartments: 0,
    totalEmployees: 0,
    averageEmployeesPerDepartment: 0,
    newestDepartment: "",
    oldestDepartment: "",
  });

  // Calculate employee counts per department
  const employeeCounts: Record<string, number> = {};
  if (departments && employees) {
    departments.forEach(dept => {
      employeeCounts[dept.id] = employees.items.filter(emp => emp.department === dept.name).length || 0;
    });
  }

  // Filter departments based on search term
  const filteredDepartments = departments?.filter(
    (department) => department.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Only directors can create departments
  const canManageDepartments = user?.role === EmployeeRole.Director;

  // Handle department creation/update
  const handleSubmitDepartment = async (data: CreateDepartmentDto | UpdateDepartmentDto) => {
    if ('id' in data) {
      await updateDepartment.mutateAsync(data);
      setSelectedDepartment(undefined);
    } else {
      await createDepartment.mutateAsync(data);
    }
    setIsCreateDialogOpen(false);
  };

  // Handle department deletion
  const handleDeleteDepartment = async () => {
    if (selectedDepartment) {
      await deleteDepartment.mutateAsync(selectedDepartment.id);
      setSelectedDepartment(undefined);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle edit button click
  const handleEditDepartment = (id: string) => {
    const department = departments?.find(d => d.id === id);
    if (department) {
      setSelectedDepartment(department);
      setIsCreateDialogOpen(true);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    const department = departments?.find(d => d.id === id);
    if (department) {
      setSelectedDepartment(department);
      setIsDeleteDialogOpen(true);
    }
  };

  // Calculate stats
  useEffect(() => {
    if (departments && employees) {
      // Sort departments by creation date
      const sortedDepartments = [...departments].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Calculate stats
      const totalDepartments = departments.length;
      const activeDepartments = departments.filter(d => d.isActive).length;
      const totalEmployees = employees.totalCount;
      const averageEmployeesPerDepartment = totalDepartments > 0 
        ? Math.round(totalEmployees / totalDepartments) 
        : 0;
      const oldestDepartment = sortedDepartments[0]?.name || "N/A";
      const newestDepartment = sortedDepartments[sortedDepartments.length - 1]?.name || "N/A";

      setStats({
        totalDepartments,
        activeDepartments,
        totalEmployees,
        averageEmployeesPerDepartment,
        newestDepartment,
        oldestDepartment,
      });
    }
  }, [departments, employees]);

  // Renderização condicional para estado de carregamento
  if (isLoadingDepts || isLoadingEmployees) {
    return (
      <main className="bg-background min-h-screen">
        <DepartmentHeader 
          title="Gerenciamento de Departamentos" 
          subtitle="Visualize, crie e gerencie os departamentos da empresa" 
        />
        <div className="container px-6 py-8">
          <DepartmentStatsOverview 
            data={stats} 
            isLoading={true} 
          />
          <div className="mt-8 animate-pulse">
            <div className="h-10 bg-muted rounded-full w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <DepartmentHeader 
        title="Gerenciamento de Departamentos" 
        subtitle="Visualize, crie e gerencie os departamentos da empresa" 
      />

      {/* Main Content */}
      <div className="container px-6 py-8">
        {/* Stats Overview */}
        <DepartmentStatsOverview 
          data={stats} 
          isLoading={false} 
        />

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar departamentos..."
          />
          
          {canManageDepartments && (
            <Button 
              onClick={() => {
                setSelectedDepartment(undefined);
                setIsCreateDialogOpen(true);
              }}
              className="rounded-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Departamento
            </Button>
          )}
        </div>

        {/* Departments Grid */}
        <div className="mt-6">
          <DepartmentGrid 
            departments={filteredDepartments} 
            employeeCounts={employeeCounts}
            isLoading={false}
            onEdit={canManageDepartments ? handleEditDepartment : undefined}
            onDelete={canManageDepartments ? handleDeleteClick : undefined}
          />
        </div>
      </div>

      {/* Department Create/Edit Dialog */}
      <DepartmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        department={selectedDepartment}
        onSubmit={handleSubmitDepartment}
        isLoading={createDepartment.isPending || updateDepartment.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Confirmar exclusão"
        itemName={selectedDepartment?.name || ""}
        description={`Tem certeza que deseja excluir o departamento <strong>${selectedDepartment?.name || ""}</strong>? Esta ação não pode ser desfeita e pode afetar funcionários vinculados a este departamento.`}
        onConfirm={handleDeleteDepartment}
        isLoading={deleteDepartment.isPending}
      />
    </main>
  );
}