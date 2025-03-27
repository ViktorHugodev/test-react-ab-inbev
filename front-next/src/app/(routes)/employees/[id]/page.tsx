  "use client";

  import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

  import { useAuth } from "@/hooks/use-auth";
import { useGetDepartments } from "@/services/department/queries";
import { useDeleteEmployee, useGetEmployee, useGetManagers, useUpdateEmployee } from "@/services/employee/queries";
import { EmployeeRole, PhoneType } from "@/types/employee";

  import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

  
  const employeeFormSchema = z.object({
    firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    documentNumber: z.string().min(8, "Documento deve ter pelo menos 8 caracteres"),
    birthDate: z.date({
      required_error: "Data de nascimento é obrigatória",
    }).refine(date => {
      const today = new Date();
      const birthDate = new Date(date);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 18;
    }, "Funcionário deve ter pelo menos 18 anos"),
    role: z.nativeEnum(EmployeeRole),
    department: z.string().min(1, "Departamento é obrigatório"),
    managerId: z.string().optional(),
    phoneNumbers: z.array(
      z.object({
        id: z.string().optional(),
        number: z.string().min(8, "Número de telefone deve ter pelo menos 8 dígitos"),
        type: z.nativeEnum(PhoneType),
      })
    ).optional(),
  });

  type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

  export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    
    
    useEffect(() => {
      
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const editMode = params.get("edit") === "true";
        
        if (editMode) {
          setIsEditing(true);
        }
      }
    }, []);
    
    
    const { data: employee, isLoading, isError } = useGetEmployee(params.id);
    const { data: departments } = useGetDepartments();
    const { data: managers } = useGetManagers();
    
    
    const updateEmployee = useUpdateEmployee();
    const deleteEmployee = useDeleteEmployee();
    
    
    const isDirector = user?.role === EmployeeRole.Director;
    const isLeaderOrDirector = user?.role === EmployeeRole.Leader || user?.role === EmployeeRole.Director;
    const canEdit = isLeaderOrDirector;
    const canDelete = isDirector;
    console.log('user', user);
    
    const employeeForm = useForm<EmployeeFormValues>({
      resolver: zodResolver(employeeFormSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        documentNumber: "",
        birthDate: new Date(),
        role: EmployeeRole.Employee,
        department: "",
        managerId: undefined,
        phoneNumbers: [],
      }
    });
    
    
    useEffect(() => {
      if (employee) {
        employeeForm.reset({
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          email: employee.email,
          documentNumber: employee.documentNumber || "",
          birthDate: employee.birthDate ? new Date(employee.birthDate) : new Date(),
          role: employee.role,
          department: employee.department,
          managerId: employee.managerId,
          phoneNumbers: employee.phoneNumbers || [],
        });
      }
    }, [employee, employeeForm]);
    
    
    const onSubmit = async (data: EmployeeFormValues) => {
      if (!employee || !employee.id) return;
      
      try {
        await updateEmployee.mutateAsync({
          id: employee.id,
          data: {
            id: employee.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            birthDate: data.birthDate.toISOString(),
            role: data.role,
            department: data.department,
            managerId: data.managerId,
            phoneNumbers: data.phoneNumbers?.map(phone => ({
              id: phone.id,
              number: phone.number || "",
              type: phone.type || 1
            })) || []
          }
        });
        
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating employee:", error);
      }
    };
    
    
    const handleDelete = async () => {
      if (!employee || !employee.id) return;
      
      try {
        await deleteEmployee.mutateAsync(employee.id);
        toast.success("Funcionário excluído com sucesso");
        router.push("/employees");
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Erro ao excluir funcionário");
      }
    };
    
    
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
    
    
    const getPhoneTypeLabel = (type: PhoneType): string => {
      switch (type) {
        case PhoneType.Mobile:
          return "Celular";
        case PhoneType.Home:
          return "Residencial";
        case PhoneType.Work:
          return "Trabalho";
        default:
          return "Outro";
      }
    };
    
    
    if (isLoading) {
      return (
        <div className="container mx-auto py-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }
    
    
    if (isError || !employee) {
      return (
        <div className="container mx-auto py-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-500">
                Erro ao carregar os dados do funcionário. Por favor, tente novamente mais tarde.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.refresh()}
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold">
              {employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
            
            {canDelete && (
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                Excluir
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Funcionário</CardTitle>
                <CardDescription>
                  Visualize e edite as informações do funcionário
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                      <p>
                        {employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Não informado'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{employee.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Documento</p>
                      <p>{employee.documentNumber || "Não informado"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                      <p>{employee.birthDate ? 
                        format(new Date(employee.birthDate), "dd/MM/yyyy", { locale: ptBR }) : 
                        "Não informada"}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                      <div>
                        <Badge variant={getRoleBadgeVariant(employee.role)}>
                          {getRoleDisplay(employee.role)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                      <p>{employee.department}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Gerente</p>
                      <p>{employee.managerName || "Sem gerente"}</p>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Telefones</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {employee.phoneNumbers && employee.phoneNumbers.length > 0 ? (
                          employee.phoneNumbers.map((phone, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{phone.number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {getPhoneTypeLabel(phone.type)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum telefone cadastrado</p>
                        )}
                      </div>
                    </div>
                    
                    {employee.createdAt && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                        <p>{format(new Date(employee.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                    )}
                    
                    {employee.updatedAt && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                        <p>{format(new Date(employee.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Form {...employeeForm}>
                    <form onSubmit={employeeForm.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sobrenome</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="documentNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Documento</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
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
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                O funcionário deve ter pelo menos 18 anos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo</FormLabel>
                              <Select
                                value={field.value.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cargo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={EmployeeRole.Employee.toString()}>Funcionário</SelectItem>
                                  {(user?.role === EmployeeRole.Leader || user?.role === EmployeeRole.Director) && (
                                    <SelectItem value={EmployeeRole.Leader.toString()}>Líder</SelectItem>
                                  )}
                                  {user?.role === EmployeeRole.Director && (
                                    <SelectItem value={EmployeeRole.Director.toString()}>Diretor</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um departamento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {departments?.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.name}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {}
                        <FormField
                          control={employeeForm.control}
                          name="managerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gerente</FormLabel>
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um gerente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">Sem gerente</SelectItem>
                                  {managers?.map(manager => manager.id !== employee.id && (
                                    <SelectItem key={manager.id} value={manager.id || ""}>
                                      {manager.fullName || `${manager.firstName} ${manager.lastName}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {}
                      <div className="space-y-2">
                        <FormLabel>Telefones</FormLabel>
                        {employeeForm.watch("phoneNumbers")?.map((phone, index) => (
                          <div key={index} className="flex items-end space-x-2">
                            <div className="flex-1">
                              <FormField
                                control={employeeForm.control}
                                name={`phoneNumbers.${index}.number`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Número</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="w-1/3">
                              <FormField
                                control={employeeForm.control}
                                name={`phoneNumbers.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select
                                      value={field.value.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value={PhoneType.Mobile.toString()}>Celular</SelectItem>
                                        <SelectItem value={PhoneType.Home.toString()}>Residencial</SelectItem>
                                        <SelectItem value={PhoneType.Work.toString()}>Trabalho</SelectItem>
                                        <SelectItem value={PhoneType.Other.toString()}>Outro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const phones = [...(employeeForm.getValues().phoneNumbers || [])];
                                phones.splice(index, 1);
                                employeeForm.setValue("phoneNumbers", phones);
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const phones = [...(employeeForm.getValues().phoneNumbers || [])];
                            phones.push({ number: "", type: PhoneType.Mobile });
                            employeeForm.setValue("phoneNumbers", phones);
                          }}
                        >
                          Adicionar Telefone
                        </Button>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={updateEmployee.isPending}>
                          {updateEmployee.isPending ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
                <CardDescription>
                  Visualize alterações e atividades relacionadas a este funcionário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.updatedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Perfil atualizado</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(employee.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {employee.createdAt && (
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Funcionário cadastrado</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(employee.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(!employee.createdAt && !employee.updatedAt) && (
                    <p className="text-muted-foreground">Nenhum histórico disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este funcionário?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteEmployee.isPending}>
                {deleteEmployee.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }