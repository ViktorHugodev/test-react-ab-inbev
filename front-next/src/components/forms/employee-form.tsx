"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { EmployeeRole } from "@/types/employee";
import { 
  CreateEmployeeFormValues, 
  createEmployeeSchema,
  formValuesToCreateEmployeeDTO
} from "@/lib/validations/employee";
import { employeeService } from "@/services/employee-service";
import { useAuth } from "@/hooks/use-auth";
import { PhoneFieldArray } from "@/components/forms/phone-field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

// Interface para os departamentos e gerentes
interface Department {
  id: string;
  name: string;
}

interface Manager {
  id: string;
  name: string;
}

export function EmployeeForm() {
  const { canCreateRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form with validation
  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      documentNumber: "",
      phoneNumbers: [],
      birthDate: undefined,
      department: "",
      managerId: "",
      password: "",
      role: EmployeeRole.Employee,
    },
    mode: "onBlur",
  });

  // Fetch departments and managers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsData, managersData] = await Promise.all([
          employeeService.getDepartments(),
          employeeService.getManagers(),
        ]);
        
        setDepartments(departmentsData);
        setManagers(managersData);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Erro ao carregar dados do formulário");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Custom document validation
  const validateDocument = async (value: string) => {
    try {
      const isValid = await employeeService.validateDocument(value);
      if (!isValid) {
        return "Este número de documento já está em uso";
      }
      return true;
    } catch (error) {
      console.error("Error validating document:", error);
      return "Erro ao validar documento";
    }
  };

  // Add custom document validation
  useEffect(() => {
    const { register, trigger } = form;
    register("documentNumber", {
      validate: validateDocument,
    });

    // Trigger validation when document changes
    const subscription = form.watch((value, { name }) => {
      if (name === "documentNumber" && value.documentNumber && value.documentNumber.length >= 8) {
        trigger("documentNumber");
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Form submission
  const onSubmit = async (data: CreateEmployeeFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Validate that the user can create this role
      if (!canCreateRole(data.role)) {
        toast.error("Você não tem permissão para criar um funcionário com este cargo");
        return;
      }
      
      // Convert form values to API DTO
      const employeeDTO = formValuesToCreateEmployeeDTO(data);
      
      await employeeService.create(employeeDTO);
      
      toast.success("Funcionário cadastrado com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando formulário...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="João" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sobrenome */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome</FormLabel>
                <FormControl>
                  <Input placeholder="Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="joao.silva@empresa.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Documento */}
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Documento</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123.456.789-00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Nascimento */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Nascimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date > new Date() || date > getMinBirthDate()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Departamento */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gerente */}
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gerente (opcional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gerente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Senha */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="********" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cargo */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem 
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem 
                          value={EmployeeRole.Employee.toString()} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Funcionário
                      </FormLabel>
                    </FormItem>
                    <FormItem 
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem 
                          value={EmployeeRole.Leader.toString()} 
                          disabled={!canCreateRole(EmployeeRole.Leader)} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Líder
                        {!canCreateRole(EmployeeRole.Leader) && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            (Sem permissão)
                          </span>
                        )}
                      </FormLabel>
                    </FormItem>
                    <FormItem 
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem 
                          value={EmployeeRole.Director.toString()} 
                          disabled={!canCreateRole(EmployeeRole.Director)} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Diretor
                        {!canCreateRole(EmployeeRole.Director) && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            (Sem permissão)
                          </span>
                        )}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Telefones */}
        <PhoneFieldArray />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
        </Button>
      </form>
    </Form>
  );
}

// Helper function to get minimum birth date (18 years ago)
function getMinBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
}