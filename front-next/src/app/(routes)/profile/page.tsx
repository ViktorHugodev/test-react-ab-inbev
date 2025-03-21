"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as z from "zod";

import { useCurrentUser } from "@/services/api/auth/queries";
import { useUpdateEmployee, useUpdateEmployeePassword } from "@/services/api/employee/queries";
import { EmployeeRole, PhoneType } from "@/types/employee";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Personal information form schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  phoneNumbers: z.array(
    z.object({
      id: z.string().optional(),
      number: z.string().min(8, "Número de telefone deve ter pelo menos 8 dígitos"),
      type: z.nativeEnum(PhoneType),
    })
  ),
});

// Password update form schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Senha atual deve ter pelo menos 8 caracteres"),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .regex(/[^a-zA-Z0-9]/, "Senha deve conter pelo menos um caractere especial"),
    confirmNewPassword: z.string().min(8, "Confirmação de senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Senhas não conferem",
    path: ["confirmNewPassword"],
  });

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// Component to display the role badge
function RoleBadge({ role }: { role: EmployeeRole }) {
  let variant: "default" | "secondary" | "outline" = "outline";
  let label = "Desconhecido";

  switch (role) {
    case EmployeeRole.Director:
      variant = "default";
      label = "Diretor";
      break;
    case EmployeeRole.Leader:
      variant = "secondary";
      label = "Líder";
      break;
    case EmployeeRole.Employee:
      variant = "outline";
      label = "Funcionário";
      break;
  }

  return <Badge variant={variant}>{label}</Badge>;
}

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useCurrentUser();
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const updateEmployee = useUpdateEmployee(user?.id || "");
  const updatePassword = useUpdateEmployeePassword(user?.id || "");

  // Form for personal information
  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: new Date(),
      phoneNumbers: [],
    },
  });

  // Form for password update
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Set form values when user data is loaded
  useState(() => {
    if (user) {
      personalInfoForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthDate: new Date(user.birthDate),
        phoneNumbers: user.phoneNumbers,
      });
    }
  });

  const onPersonalInfoSubmit = async (data: PersonalInfoFormValues) => {
    if (!user || !user.id) return;

    try {
      await updateEmployee.mutateAsync({
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        birthDate: data.birthDate.toISOString(),
        // Keep existing role, department, manager
        role: user.role,
        department: user.department,
        managerId: user.managerId,
        phoneNumbers: data.phoneNumbers.map(phone => ({
          id: phone.id,
          number: phone.number,
          type: phone.type
        })),
      });

      setIsEditingPersonalInfo(false);
      toast.success("Informações pessoais atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar informações pessoais");
      console.error(error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user || !user.id) return;

    try {
      await updatePassword.mutateAsync({
        employeeId: user.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      // Reset password form after successful update
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      
      toast.success("Senha atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar senha");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-500">
              Erro ao carregar seus dados de perfil. Por favor, tente novamente mais tarde.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Visualize e edite suas informações de perfil
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPersonalInfo(!isEditingPersonalInfo)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {isEditingPersonalInfo ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isEditingPersonalInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                    <p>{user.firstName} {user.lastName}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                    <div>
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                    <p>{user.department}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Gerente</p>
                    <p>{user.managerName || "Sem gerente"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                    <p>{format(new Date(user.birthDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Telefones</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {user.phoneNumbers.map((phone, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{phone.number}</p>
                            <p className="text-xs text-muted-foreground">
                              {phone.type === PhoneType.Mobile 
                                ? "Celular" 
                                : phone.type === PhoneType.Home 
                                ? "Residencial" 
                                : phone.type === PhoneType.Work 
                                ? "Trabalho" 
                                : "Outro"}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {user.phoneNumbers.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum telefone cadastrado</p>
                      )}
                    </div>
                  </div>
                  
                  {user.createdAt && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                      <p>{format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                  )}
                  
                  {user.updatedAt && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                      <p>{format(new Date(user.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                  )}
                </div>
              ) : (
                <Form {...personalInfoForm}>
                  <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <FormField
                        control={personalInfoForm.control}
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
                      
                      {/* Last Name */}
                      <FormField
                        control={personalInfoForm.control}
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
                      
                      {/* Email */}
                      <FormField
                        control={personalInfoForm.control}
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
                      
                      {/* Birth Date */}
                      <FormField
                        control={personalInfoForm.control}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Phone Numbers */}
                    <div className="space-y-2">
                      <FormLabel>Telefones</FormLabel>
                      {personalInfoForm.watch("phoneNumbers").map((phone, index) => (
                        <div key={index} className="flex items-end space-x-2">
                          <div className="flex-1">
                            <FormField
                              control={personalInfoForm.control}
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
                              control={personalInfoForm.control}
                              name={`phoneNumbers.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo</FormLabel>
                                  <FormControl>
                                    <select
                                      className="w-full p-2 border rounded"
                                      value={field.value}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    >
                                      <option value={PhoneType.Mobile}>Celular</option>
                                      <option value={PhoneType.Home}>Residencial</option>
                                      <option value={PhoneType.Work}>Trabalho</option>
                                      <option value={PhoneType.Other}>Outro</option>
                                    </select>
                                  </FormControl>
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
                              const phones = [...personalInfoForm.getValues().phoneNumbers];
                              phones.splice(index, 1);
                              personalInfoForm.setValue("phoneNumbers", phones);
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
                          const phones = [...personalInfoForm.getValues().phoneNumbers];
                          phones.push({ number: "", type: PhoneType.Mobile });
                          personalInfoForm.setValue("phoneNumbers", phones);
                        }}
                      >
                        Adicionar Telefone
                      </Button>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingPersonalInfo(false)}
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
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Atualize sua senha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatePassword.isPending}>
                      {updatePassword.isPending ? "Atualizando..." : "Atualizar Senha"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Última atualização de senha: {user.passwordUpdatedAt ? 
                  format(new Date(user.passwordUpdatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 
                  "Nunca"
                }</span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}