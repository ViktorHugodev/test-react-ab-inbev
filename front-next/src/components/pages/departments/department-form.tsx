import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "@/types/deparment";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { departmentFormSchema, DepartmentFormValues } from "@/schemas/department";

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: CreateDepartmentDto | UpdateDepartmentDto) => void;
  isLoading: boolean;
}

export function DepartmentForm({ department, onSubmit, isLoading }: DepartmentFormProps) {
  
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
      isActive: department?.isActive ?? true,
    },
  });

  
  function handleSubmit(data: DepartmentFormValues) {
    if (department) {
      
      onSubmit({
        id: department.id,
        ...data,
      } as UpdateDepartmentDto);
    } else {
      
      onSubmit({
        ...data,
      } as CreateDepartmentDto);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Departamento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Recursos Humanos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a função e responsabilidades deste departamento..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {department && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Status do Departamento</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {field.value ? "Ativo" : "Inativo"}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {department ? "Atualizar Departamento" : "Criar Departamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
