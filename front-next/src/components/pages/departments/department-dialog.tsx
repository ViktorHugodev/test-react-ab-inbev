import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "@/types/deparment";
import { DepartmentForm } from "./department-form";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department;
  onSubmit: (data: CreateDepartmentDto | UpdateDepartmentDto) => void;
  isLoading: boolean;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
  onSubmit,
  isLoading,
}: DepartmentDialogProps) {
  const isEditing = !!department;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Departamento" : "Criar Novo Departamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do departamento existente."
              : "Preencha os campos abaixo para criar um novo departamento."}
          </DialogDescription>
        </DialogHeader>
        <DepartmentForm
          department={department}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
